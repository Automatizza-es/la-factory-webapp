"use server";

import { revalidatePath } from "next/cache";
import { adminActionContext } from "@/lib/admin-action";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

type Result = { error: string | null };

// Contact columns the admin's person file may write. Anything else in a
// patch is ignored.
const EDITABLE_COLUMNS = [
  "first_name",
  "last_name",
  "nif",
  "phone",
  "company_name",
  "preferred_locale",
  "can_receive_packages",
  "marketing_consent",
  "address",
  "city",
  "postal_code",
  "province",
  "country",
  "billing_company_id",
  "holded_contact_id",
  "internal_notes",
] as const;
export type PersonPatch = Partial<Record<(typeof EDITABLE_COLUMNS)[number], string | boolean | null>>;

function refresh(contactId: string) {
  revalidatePath(`/admin/coworkers/${contactId}`);
  revalidatePath("/admin/coworkers");
}

export async function updatePerson(contactId: string, patch: PersonPatch): Promise<Result> {
  const { dict, admin } = await adminActionContext();
  if (!admin) return { error: dict.errors.notAuthorized };
  const t = dict.admin.userDetail;

  const update: Record<string, string | boolean | null> = {};
  for (const column of EDITABLE_COLUMNS) {
    if (!(column in patch)) continue;
    const value = patch[column];
    update[column] = typeof value === "string" ? value.trim() || null : (value ?? null);
  }
  if ("first_name" in update && !update.first_name) return { error: t.firstNameRequired };
  if (update.marketing_consent === true) update.marketing_consent_at = new Date().toISOString();

  const { error } = await admin.from("contacts").update(update).eq("id", contactId);
  if (error) return { error: t.error };
  refresh(contactId);
  return { error: null };
}

export async function setArchived(contactId: string, archived: boolean): Promise<Result> {
  const { dict, admin } = await adminActionContext();
  if (!admin) return { error: dict.errors.notAuthorized };

  const { error } = await admin
    .from("contacts")
    .update({ status: archived ? "archived" : "active", archived_at: archived ? new Date().toISOString() : null })
    .eq("id", contactId);
  if (error) return { error: dict.admin.userDetail.error };
  refresh(contactId);
  return { error: null };
}

// A new plan of their own (they become a coworker from startDate). Any
// shared-hours link is dropped: you either have your own plan or share one.
export async function assignPlan(contactId: string, planId: string, startDate: string): Promise<Result> {
  const { dict, admin } = await adminActionContext();
  if (!admin) return { error: dict.errors.notAuthorized };
  const t = dict.admin.userDetail;

  const { data: account, error: accountError } = await admin
    .from("quota_accounts")
    .insert({ owner_type: "contact", contact_id: contactId })
    .select("id")
    .single();
  if (accountError || !account) return { error: t.error };

  const { error } = await admin.from("memberships").insert({
    contact_id: contactId,
    plan_id: planId,
    quota_account_id: account.id,
    status: "active",
    start_date: startDate,
  });
  if (error) return { error: t.error };

  await admin.from("quota_account_members").delete().eq("contact_id", contactId);
  refresh(contactId);
  return { error: null };
}

// The plan stays in force until endDate (inclusive); a date already past
// closes it right away.
export async function endPlan(contactId: string, membershipId: string, endDate: string): Promise<Result> {
  const { dict, admin } = await adminActionContext();
  if (!admin) return { error: dict.errors.notAuthorized };

  const today = utcIsoToZonedDateAndMinutes(new Date().toISOString()).date;
  const { data: membership } = await admin
    .from("memberships")
    .select("start_date")
    .eq("id", membershipId)
    .single();
  if (!membership) return { error: dict.admin.userDetail.error };

  const end = endDate < membership.start_date ? membership.start_date : endDate;
  const { error } = await admin
    .from("memberships")
    .update({ end_date: end, status: end < today ? "ended" : "active" })
    .eq("id", membershipId);
  if (error) return { error: dict.admin.userDetail.error };
  refresh(contactId);
  return { error: null };
}

export async function setBillable(contactId: string, membershipId: string, billable: boolean): Promise<Result> {
  const { dict, admin } = await adminActionContext();
  if (!admin) return { error: dict.errors.notAuthorized };

  const { error } = await admin.from("memberships").update({ billable }).eq("id", membershipId);
  if (error) return { error: dict.admin.userDetail.error };
  refresh(contactId);
  return { error: null };
}

// "Comparte las horas de": authorise this person on the owner's current
// quota account (null = stop sharing).
export async function setSharedHours(contactId: string, ownerContactId: string | null): Promise<Result> {
  const { dict, admin } = await adminActionContext();
  if (!admin) return { error: dict.errors.notAuthorized };
  const t = dict.admin.userDetail;

  await admin.from("quota_account_members").delete().eq("contact_id", contactId);
  if (ownerContactId) {
    const today = utcIsoToZonedDateAndMinutes(new Date().toISOString()).date;
    const { data: owner } = await admin
      .from("memberships")
      .select("quota_account_id")
      .eq("contact_id", ownerContactId)
      .eq("status", "active")
      .lte("start_date", today)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!owner) return { error: t.error };

    const { error } = await admin
      .from("quota_account_members")
      .insert({ quota_account_id: owner.quota_account_id, contact_id: contactId });
    if (error) return { error: t.error };
  }
  refresh(contactId);
  return { error: null };
}

// "Añadir / quitar horas" for this month. `hours` is positive to add,
// negative to remove; stored in minutes in the same ledger as bookings.
export async function adjustHours(contactId: string, hours: number, note: string): Promise<Result> {
  const { dict, admin } = await adminActionContext();
  if (!admin) return { error: dict.errors.notAuthorized };
  const minutes = Math.round(hours * 60);
  if (!Number.isFinite(minutes) || minutes === 0) return { error: dict.admin.coworkerDetail.invalidHours };

  // Through the user's own session: the function checks it's an admin and
  // records who made the adjustment.
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_adjust_quota", {
    p_contact_id: contactId,
    p_delta_minutes: minutes,
    p_note: note,
  });
  if (error) {
    return { error: error.message === "NO_ACTIVE_PLAN" ? dict.errors.noActivePlan : dict.admin.userDetail.error };
  }
  refresh(contactId);
  return { error: null };
}

// Changes the person's email everywhere at once: their contact record and,
// if they have an app login, the login itself (already confirmed, so they
// keep signing in with their usual password).
export async function changeEmail(contactId: string, email: string): Promise<Result> {
  const { dict, admin } = await adminActionContext();
  if (!admin) return { error: dict.errors.notAuthorized };
  const t = dict.admin.userDetail;

  const next = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) return { error: t.emailInvalid };

  const { data: taken } = await admin
    .from("contacts")
    .select("id")
    .ilike("email", next)
    .neq("id", contactId)
    .limit(1)
    .maybeSingle();
  if (taken) return { error: t.emailTaken };

  const { data: userRow } = await admin.from("users").select("id").eq("contact_id", contactId).maybeSingle();
  if (userRow) {
    const { error: authError } = await admin.auth.admin.updateUserById(userRow.id, {
      email: next,
      email_confirm: true,
    });
    if (authError) return { error: authError.message.includes("already") ? t.emailTaken : t.error };
  }

  const { error } = await admin.from("contacts").update({ email: next }).eq("id", contactId);
  if (error) return { error: t.error };
  refresh(contactId);
  return { error: null };
}
