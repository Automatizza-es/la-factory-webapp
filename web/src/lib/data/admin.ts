import type { SupabaseClient } from "@supabase/supabase-js";
import { getBookings, getQuotaSummary, type RoomOccupancyBlock } from "@/lib/data/coworker";
import { getActiveContactsForPicker } from "@/lib/data/packages";
import type { Locale } from "@/lib/i18n/config";
import { utcIsoToZonedDateAndMinutes, zonedDateTimeToUtcIso } from "@/lib/timezone";
import type { Booking, QuotaSummary } from "@/types/domain";

export interface AdminRoom {
  id: string;
  name: string;
}

export async function getAllRooms(supabase: SupabaseClient): Promise<AdminRoom[]> {
  const { data } = await supabase.from("rooms").select("id, name").eq("is_active", true).order("name");
  return data ?? [];
}

export interface AdminContact {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
}

export async function getAllContacts(supabase: SupabaseClient): Promise<AdminContact[]> {
  const { data } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, email")
    .order("first_name");

  return (data ?? []).map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
  }));
}

export type AdminCoworkerStage =
  | "active"
  // Has a plan but no login and no invitation yet (e.g. imported): needs a
  // welcome email.
  | "no_access"
  | "invited"
  | "onboarding"
  | "invite_expired"
  | "invite_cancelled";

export interface AdminCoworkerRow {
  contactId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  planLabel: string | null;
  membershipStatus: "active" | "ended" | "cancelled" | "none";
  totalMinutes: number;
  usedMinutes: number;
  stage: AdminCoworkerStage;
  invitation: {
    id: string;
    token: string;
    status: "pending" | "completed" | "cancelled";
    kind: "onboarding" | "welcome";
  } | null;
}

export async function getAllCoworkers(
  supabase: SupabaseClient,
  locale: Locale,
): Promise<AdminCoworkerRow[]> {
  const { data: membershipRows } = await supabase
    .from("memberships")
    .select("contact_id, status, start_date, contacts(first_name, last_name, email), plans(name)")
    .order("start_date", { ascending: false });

  const memberships = membershipRows ?? [];
  const latestByContact = new Map<string, (typeof memberships)[number]>();
  for (const row of memberships) {
    if (!latestByContact.has(row.contact_id)) {
      latestByContact.set(row.contact_id, row);
    }
  }

  const contactIds = Array.from(latestByContact.keys());

  const { data: invitationRows } = await supabase
    .from("coworker_invitations")
    .select("id, contact_id, token, status, expires_at, kind, created_at")
    .in("contact_id", contactIds.length > 0 ? contactIds : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false });

  const latestInvitationByContact = new Map<string, NonNullable<typeof invitationRows>[number]>();
  for (const inv of invitationRows ?? []) {
    if (!latestInvitationByContact.has(inv.contact_id)) {
      latestInvitationByContact.set(inv.contact_id, inv);
    }
  }

  const { data: userRows } = await supabase
    .from("users")
    .select("contact_id")
    .in("contact_id", contactIds.length > 0 ? contactIds : ["00000000-0000-0000-0000-000000000000"]);

  const linkedContactIds = new Set((userRows ?? []).map((u) => u.contact_id));

  const rows: AdminCoworkerRow[] = [];
  for (const row of latestByContact.values()) {
    const contact = row.contacts as unknown as {
      first_name: string;
      last_name: string | null;
      email: string | null;
    } | null;
    const plan = row.plans as unknown as { name: string } | null;
    if (!contact) continue;

    let totalMinutes = 0;
    let usedMinutes = 0;
    if (row.status === "active") {
      const quota = await getQuotaSummary(supabase, row.contact_id, locale);
      if (quota) {
        totalMinutes = quota.totalMinutes;
        usedMinutes = quota.usedMinutes;
      }
    }

    const invitation = latestInvitationByContact.get(row.contact_id) ?? null;
    const hasLogin = linkedContactIds.has(row.contact_id);
    let stage: AdminCoworkerStage = "active";
    if (!invitation || (invitation.kind === "welcome" && invitation.status === "cancelled")) {
      // A cancelled welcome just means "not sent yet" again.
      if (!hasLogin) stage = "no_access";
    } else {
      if (invitation.status === "completed") {
        stage = "active";
      } else if (invitation.status === "cancelled") {
        stage = "invite_cancelled";
      } else if (new Date(invitation.expires_at) < new Date()) {
        stage = "invite_expired";
      } else if (hasLogin && invitation.kind === "onboarding") {
        stage = "onboarding";
      } else {
        stage = "invited";
      }
    }

    rows.push({
      contactId: row.contact_id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      planLabel: plan?.name ?? null,
      membershipStatus: row.status,
      totalMinutes,
      usedMinutes,
      stage,
      invitation: invitation
        ? {
            id: invitation.id,
            token: invitation.token,
            status: invitation.status,
            kind: invitation.kind,
          }
        : null,
    });
  }

  return rows.sort((a, b) => (a.firstName || a.email || "").localeCompare(b.firstName || b.email || ""));
}

export interface AdminCoworkerDetail {
  contact: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  };
  membership: {
    planLabel: string;
    status: string;
    startDate: string;
    endDate: string | null;
  } | null;
  quota: QuotaSummary | null;
  movements: {
    id: string;
    deltaMinutes: number;
    reasonCode: string;
    note: string | null;
    createdAt: string;
  }[];
  bookings: Booking[];
}

export async function getCoworkerDetail(
  supabase: SupabaseClient,
  contactId: string,
  locale: Locale,
): Promise<AdminCoworkerDetail | null> {
  const { data: contact } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, email, phone")
    .eq("id", contactId)
    .maybeSingle();

  if (!contact) return null;

  const { data: membershipRow } = await supabase
    .from("memberships")
    .select("status, start_date, end_date, quota_account_id, plans(name)")
    .eq("contact_id", contactId)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const membership = membershipRow
    ? {
        planLabel: (membershipRow.plans as unknown as { name: string } | null)?.name ?? "",
        status: membershipRow.status,
        startDate: membershipRow.start_date,
        endDate: membershipRow.end_date,
      }
    : null;

  const quota =
    membershipRow?.status === "active" ? await getQuotaSummary(supabase, contactId, locale) : null;

  let movements: AdminCoworkerDetail["movements"] = [];
  if (membershipRow?.quota_account_id) {
    const { data: movementRows } = await supabase
      .from("quota_movements")
      .select("id, delta_minutes, reason_code, note, created_at")
      .eq("quota_account_id", membershipRow.quota_account_id)
      .order("created_at", { ascending: false })
      .limit(50);

    movements = (movementRows ?? []).map((m) => ({
      id: m.id,
      deltaMinutes: m.delta_minutes,
      reasonCode: m.reason_code,
      note: m.note,
      createdAt: m.created_at,
    }));
  }

  const bookings = await getBookings(supabase, contactId);

  return {
    contact: {
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
    },
    membership,
    quota,
    movements,
    bookings,
  };
}

export interface AdminBooking {
  id: string;
  roomId: string;
  roomName: string;
  contactId: string | null;
  contactName: string | null;
  bookingType: string;
  status: "confirmed" | "cancelled";
  date: string;
  startMinutes: number;
  endMinutes: number;
}

interface RawAdminBooking {
  id: string;
  room_id: string;
  contact_id: string | null;
  booking_type: string;
  status: "confirmed" | "cancelled";
  starts_at: string;
  ends_at: string;
  guest_name: string | null;
  rooms: { name: string } | null;
  contacts: { first_name: string; last_name: string | null } | null;
}

function toAdminBooking(row: RawAdminBooking): AdminBooking {
  const start = utcIsoToZonedDateAndMinutes(row.starts_at);
  const end = utcIsoToZonedDateAndMinutes(row.ends_at);

  return {
    id: row.id,
    roomId: row.room_id,
    roomName: row.rooms?.name ?? "",
    contactId: row.contact_id,
    // A coworker/guest's name, or the free-text name of an external client.
    contactName: row.contacts
      ? `${row.contacts.first_name}${row.contacts.last_name ? " " + row.contacts.last_name : ""}`
      : row.guest_name,
    bookingType: row.booking_type,
    status: row.status,
    date: start.date,
    startMinutes: start.minutes,
    endMinutes: end.minutes,
  };
}

// [startDate, endDate) as Europe/Madrid local calendar dates (YYYY-MM-DD).
export async function getBookingsInLocalRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string,
): Promise<AdminBooking[]> {
  const startsAtGte = zonedDateTimeToUtcIso(startDate, "00:00");
  const startsAtLt = zonedDateTimeToUtcIso(endDate, "00:00");

  // `contacts!contact_id` disambiguates the embed: bookings has two FKs to
  // contacts (contact_id and created_by), so a bare `contacts(...)` is an
  // ambiguous embed that PostgREST rejects -- and since callers here only
  // destructure `data`, that error was silently swallowed into `[]`.
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, room_id, contact_id, booking_type, status, starts_at, ends_at, guest_name, rooms(name), contacts!contact_id(first_name, last_name)",
    )
    .eq("status", "confirmed")
    .gte("starts_at", startsAtGte)
    .lt("starts_at", startsAtLt)
    .order("starts_at");

  if (error) console.error("getBookingsInLocalRange failed:", error.message);

  return ((data ?? []) as unknown as RawAdminBooking[]).map(toAdminBooking);
}

export async function getUpcomingBookings(
  supabase: SupabaseClient,
  limit = 6,
): Promise<AdminBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, room_id, contact_id, booking_type, status, starts_at, ends_at, guest_name, rooms(name), contacts!contact_id(first_name, last_name)",
    )
    .eq("status", "confirmed")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(limit);

  if (error) console.error("getUpcomingBookings failed:", error.message);

  return ((data ?? []) as unknown as RawAdminBooking[]).map(toAdminBooking);
}

// ---------------------------------------------------------------------------
// Admin calendar
// ---------------------------------------------------------------------------

export type AdminBookingFor = "coworker" | "external" | "guest" | "event" | "other";

interface RawAdminOccupancy {
  id: string;
  room_id: string;
  starts_at: string;
  ends_at: string;
  booking_type: string;
  guest_name: string | null;
  contacts: { first_name: string; last_name: string | null } | null;
}

// Every confirmed booking in the range, labelled with who it's for, so the
// admin's calendar shows names where a coworker's only sees "Reservado".
// `typeLabels` names the bookings that have no person or free-text name.
export async function getAdminOccupancy(
  supabase: SupabaseClient,
  rangeStartIso: string,
  rangeEndIso: string,
  typeLabels: { event: string; other: string },
): Promise<RoomOccupancyBlock[]> {
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, room_id, starts_at, ends_at, booking_type, guest_name, contacts!contact_id(first_name, last_name)",
    )
    .eq("status", "confirmed")
    .lt("starts_at", rangeEndIso)
    .gt("ends_at", rangeStartIso)
    .order("starts_at");

  return ((data ?? []) as unknown as RawAdminOccupancy[]).map((row) => {
    const start = utcIsoToZonedDateAndMinutes(row.starts_at);
    const end = utcIsoToZonedDateAndMinutes(row.ends_at);
    const person = row.contacts
      ? `${row.contacts.first_name} ${row.contacts.last_name ?? ""}`.trim()
      : null;
    const fallback = row.booking_type === "event" ? typeLabels.event : typeLabels.other;
    return {
      id: row.id,
      roomId: row.room_id,
      date: start.date,
      startMinutes: start.minutes,
      endMinutes: end.minutes,
      isMine: true,
      label: person || row.guest_name || fallback,
    };
  });
}

export interface BookingPickerOption {
  id: string;
  name: string;
}

// Who an admin can book for from the lists: active coworkers, and "guests"
// (any other contact that isn't an admin) until the Invitado role exists.
export async function getAdminBookingPickers(
  supabase: SupabaseClient,
): Promise<{ coworkers: BookingPickerOption[]; guests: BookingPickerOption[] }> {
  const [coworkers, contacts, { data: admins }] = await Promise.all([
    getActiveContactsForPicker(supabase),
    getAllContacts(supabase),
    supabase.from("users").select("contact_id").eq("role", "admin"),
  ]);

  const excluded = new Set([
    ...coworkers.map((c) => c.id),
    ...(admins ?? []).map((a) => a.contact_id as string),
  ]);
  const guests = contacts
    .filter((c) => !excluded.has(c.id))
    .map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName ?? ""}`.trim() || c.email || "—" }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { coworkers, guests };
}

// Minutes of confirmed bookings this admin created in the current month
// (Madrid time), whoever they were for: "Has reservado X h este mes".
export async function getMinutesBookedByThisMonth(
  supabase: SupabaseClient,
  contactId: string,
): Promise<number> {
  const today = utcIsoToZonedDateAndMinutes(new Date().toISOString()).date;
  const monthStart = `${today.slice(0, 7)}-01`;
  const [year, month] = today.slice(0, 7).split("-").map(Number);
  const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const { data } = await supabase
    .from("bookings")
    .select("starts_at, ends_at")
    .eq("created_by", contactId)
    .eq("status", "confirmed")
    .gte("starts_at", zonedDateTimeToUtcIso(monthStart, "00:00"))
    .lt("starts_at", zonedDateTimeToUtcIso(nextMonth, "00:00"));

  return (data ?? []).reduce(
    (sum, b) => sum + (new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime()) / 60000,
    0,
  );
}
