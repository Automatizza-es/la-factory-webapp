import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";
import type { Booking, Coworker, QuotaSummary, Room } from "@/types/domain";
import { historySinceIso } from "@/lib/retention";

function initialsFor(firstName: string, lastName: string | null) {
  const first = firstName.trim().charAt(0);
  const last = (lastName ?? "").trim().charAt(0);
  return (first + last).toUpperCase() || "?";
}

export interface CurrentCoworker {
  contactId: string;
  role: "coworker" | "admin";
  // What they can use: admins; coworkers (plan in force today); guests
  // (no plan right now: former coworkers, people between plans...).
  access: "admin" | "coworker" | "guest";
  coworker: Coworker;
}

export interface CurrentAccount {
  current: CurrentCoworker | null;
  // Signed in but archived: no access to the app at all.
  archived: boolean;
}

// Deliberately not wrapped in React's cache(): in this Next.js/Turbopack
// dev setup it was observed to leak a stale result (e.g. a null from a
// pre-auth request) across unrelated later requests, which is far worse
// than the extra duplicate DB round trip it was meant to save.
export async function getCurrentAccount(): Promise<CurrentAccount> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { current: null, archived: false };

  const { data: userRow } = await supabase
    .from("users")
    .select("contact_id, role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!userRow) return { current: null, archived: false };

  const { data: contact } = await supabase
    .from("contacts")
    .select("first_name, last_name, email, status")
    .eq("id", userRow.contact_id)
    .single();

  if (!contact) return { current: null, archived: false };
  if (contact.status === "archived") return { current: null, archived: true };

  const access =
    userRow.role === "admin"
      ? "admin"
      : (await hasActiveMembership(supabase, userRow.contact_id))
        ? "coworker"
        : "guest";

  return {
    current: {
      contactId: userRow.contact_id,
      role: userRow.role,
      access,
      coworker: {
        firstName: contact.first_name,
        initials: initialsFor(contact.first_name, contact.last_name),
      },
    },
    archived: false,
  };
}

// Null for anyone who isn't an active, linked user -- including archived
// ones, so every server action that checks it also locks them out.
export async function getCurrentCoworker(): Promise<CurrentCoworker | null> {
  return (await getCurrentAccount()).current;
}

interface EffectiveMembership {
  id: string;
  contact_id: string;
  plan_id: string;
  quota_account_id: string;
}

// The plan in force today for this person: their own, or the one they share
// (authorised on someone else's hours, e.g. a partner who pays). Null if
// neither. Same rule the database applies when booking.
export async function getEffectiveMembership(
  supabase: SupabaseClient,
  contactId: string,
): Promise<EffectiveMembership | null> {
  const { data } = await supabase.rpc("effective_membership", { p_contact_id: contactId });
  const row = data as EffectiveMembership | null;
  return row?.id ? row : null;
}

// A plan in force today, own or shared: coworker rather than guest.
export async function hasActiveMembership(
  supabase: SupabaseClient,
  contactId: string,
): Promise<boolean> {
  return (await getEffectiveMembership(supabase, contactId)) !== null;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function getQuotaSummary(
  supabase: SupabaseClient,
  contactId: string,
  locale: Locale,
): Promise<QuotaSummary | null> {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const periodStart = `${todayIso.slice(0, 7)}-01`;

  const membership = await getEffectiveMembership(supabase, contactId);
  if (!membership) return null;

  const { data: plan } = await supabase
    .from("plans")
    .select("code, name, monthly_minutes")
    .eq("id", membership.plan_id)
    .single();

  if (!plan) return null;

  const { data: period } = await supabase
    .from("quota_periods")
    .select("id, allocated_minutes")
    .eq("quota_account_id", membership.quota_account_id)
    .eq("period_start", periodStart)
    .maybeSingle();

  let availableMinutes = plan.monthly_minutes;

  if (period) {
    const { data: movements } = await supabase
      .from("quota_movements")
      .select("delta_minutes")
      .eq("quota_period_id", period.id);

    availableMinutes = (movements ?? []).reduce((sum, m) => sum + m.delta_minutes, 0);
  }

  const totalMinutes = period?.allocated_minutes ?? plan.monthly_minutes;

  const monthLabelFormatter = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    month: "long",
    year: "numeric",
  });

  return {
    planCode: plan.code,
    planLabel: plan.name.toUpperCase(),
    periodLabel: capitalize(monthLabelFormatter.format(today)),
    totalMinutes,
    usedMinutes: totalMinutes - availableMinutes,
  };
}

export async function getRooms(supabase: SupabaseClient): Promise<Room[]> {
  const { data } = await supabase
    .from("rooms")
    .select("id, name, capacity_min, capacity_max, image_path")
    .eq("is_active", true)
    .order("name");

  return (data ?? []).map((room) => ({
    id: room.id,
    name: room.name,
    capacityMin: room.capacity_min,
    capacityMax: room.capacity_max,
    imagePath: room.image_path,
  }));
}

export interface RoomOccupancyBlock {
  id: string;
  roomId: string;
  date: string;
  startMinutes: number;
  endMinutes: number;
  // For coworkers: their own booking. For admins: every booking (they can
  // manage all of them).
  isMine: boolean;
  // Admin calendar only: who the booking is for. Coworkers never get it.
  label?: string;
}

// Room occupancy for the calendar view: any signed-in coworker can see
// that a slot is taken, but only whether it's their own booking, never
// whose it is otherwise (see get_room_occupancy's SECURITY DEFINER note).
export async function getRoomOccupancy(
  supabase: SupabaseClient,
  rangeStartIso: string,
  rangeEndIso: string,
): Promise<RoomOccupancyBlock[]> {
  const { data, error } = await supabase.rpc("get_room_occupancy", {
    p_range_start: rangeStartIso,
    p_range_end: rangeEndIso,
  });

  if (error) {
    console.error("getRoomOccupancy failed:", error.message);
    return [];
  }

  interface RawOccupancy {
    id: string;
    room_id: string;
    starts_at: string;
    ends_at: string;
    is_mine: boolean;
  }

  return ((data ?? []) as RawOccupancy[]).map((row) => {
    const start = utcIsoToZonedDateAndMinutes(row.starts_at);
    const end = utcIsoToZonedDateAndMinutes(row.ends_at);
    return {
      id: row.id,
      roomId: row.room_id,
      date: start.date,
      startMinutes: start.minutes,
      endMinutes: end.minutes,
      isMine: row.is_mine,
    };
  });
}

interface RawBooking {
  id: string;
  room_id: string;
  starts_at: string;
  ends_at: string;
  status: "confirmed" | "cancelled";
  rooms: { name: string; image_path: string | null } | null;
}

function toBooking(row: RawBooking, now: Date): Booking {
  const ends = new Date(row.ends_at);
  const start = utcIsoToZonedDateAndMinutes(row.starts_at);
  const end = utcIsoToZonedDateAndMinutes(row.ends_at);

  const status: Booking["status"] =
    row.status === "cancelled" ? "cancelled" : ends < now ? "completed" : "upcoming";

  return {
    id: row.id,
    roomId: row.room_id,
    roomName: row.rooms?.name ?? "Sala",
    roomImagePath: row.rooms?.image_path ?? null,
    date: start.date,
    startMinutes: start.minutes,
    endMinutes: end.minutes,
    status,
  };
}

export async function getBookings(
  supabase: SupabaseClient,
  contactId: string,
): Promise<Booking[]> {
  const { data } = await supabase
    .from("bookings")
    .select("id, room_id, starts_at, ends_at, status, rooms(name, image_path)")
    .eq("contact_id", contactId)
    .gte("starts_at", historySinceIso())
    .order("starts_at", { ascending: false });

  const now = new Date();
  return ((data ?? []) as unknown as RawBooking[]).map((row) => toBooking(row, now));
}
