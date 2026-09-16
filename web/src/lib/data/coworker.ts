import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";
import type { Booking, Coworker, QuotaSummary, Room } from "@/types/domain";

function initialsFor(firstName: string, lastName: string | null) {
  const first = firstName.trim().charAt(0);
  const last = (lastName ?? "").trim().charAt(0);
  return (first + last).toUpperCase() || "?";
}

export interface CurrentCoworker {
  contactId: string;
  role: "coworker" | "admin";
  coworker: Coworker;
}

export async function getCurrentCoworker(): Promise<CurrentCoworker | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: userRow } = await supabase
    .from("users")
    .select("contact_id, role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!userRow) return null;

  const { data: contact } = await supabase
    .from("contacts")
    .select("first_name, last_name, email")
    .eq("id", userRow.contact_id)
    .single();

  if (!contact) return null;

  return {
    contactId: userRow.contact_id,
    role: userRow.role,
    coworker: {
      firstName: contact.first_name,
      initials: initialsFor(contact.first_name, contact.last_name),
    },
  };
}

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function getQuotaSummary(
  supabase: SupabaseClient,
  contactId: string,
): Promise<QuotaSummary | null> {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const periodStart = `${todayIso.slice(0, 7)}-01`;

  const { data: membership } = await supabase
    .from("memberships")
    .select("plan_id, quota_account_id")
    .eq("contact_id", contactId)
    .eq("status", "active")
    .lte("start_date", todayIso)
    .or(`end_date.is.null,end_date.gte.${todayIso}`)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

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

  return {
    planCode: plan.code,
    planLabel: plan.name.toUpperCase(),
    periodLabel: capitalize(MONTH_LABEL_FORMATTER.format(today)),
    totalMinutes,
    usedMinutes: totalMinutes - availableMinutes,
  };
}

export async function getRooms(supabase: SupabaseClient): Promise<Room[]> {
  const { data } = await supabase
    .from("rooms")
    .select("id, name, capacity_min, capacity_max")
    .eq("is_active", true)
    .order("name");

  return (data ?? []).map((room) => ({
    id: room.id,
    name: room.name,
    capacityLabel: `${room.capacity_min}–${room.capacity_max} pers.`,
  }));
}

interface RawBooking {
  id: string;
  room_id: string;
  starts_at: string;
  ends_at: string;
  status: "confirmed" | "cancelled";
  rooms: { name: string } | null;
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
    .select("id, room_id, starts_at, ends_at, status, rooms(name)")
    .eq("contact_id", contactId)
    .order("starts_at", { ascending: false });

  const now = new Date();
  return ((data ?? []) as unknown as RawBooking[]).map((row) => toBooking(row, now));
}
