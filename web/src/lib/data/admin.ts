import type { SupabaseClient } from "@supabase/supabase-js";
import { getBookings, getQuotaSummary } from "@/lib/data/coworker";
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

export interface AdminCoworkerRow {
  contactId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  planLabel: string | null;
  membershipStatus: "active" | "ended" | "cancelled" | "none";
  totalMinutes: number;
  usedMinutes: number;
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

    rows.push({
      contactId: row.contact_id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      planLabel: plan?.name ?? null,
      membershipStatus: row.status,
      totalMinutes,
      usedMinutes,
    });
  }

  return rows.sort((a, b) => a.firstName.localeCompare(b.firstName));
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
    contactName: row.contacts
      ? `${row.contacts.first_name}${row.contacts.last_name ? " " + row.contacts.last_name : ""}`
      : null,
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
      "id, room_id, contact_id, booking_type, status, starts_at, ends_at, rooms(name), contacts!contact_id(first_name, last_name)",
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
      "id, room_id, contact_id, booking_type, status, starts_at, ends_at, rooms(name), contacts!contact_id(first_name, last_name)",
    )
    .eq("status", "confirmed")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(limit);

  if (error) console.error("getUpcomingBookings failed:", error.message);

  return ((data ?? []) as unknown as RawAdminBooking[]).map(toAdminBooking);
}
