import type { SupabaseClient } from "@supabase/supabase-js";

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startsAt: string;
  endsAt: string;
  location: string | null;
  capacity: number | null;
  registeredCount: number;
  registrationDeadline: string | null;
  status: "published" | "cancelled";
  isRegistered: boolean;
}

interface RawEvent {
  id: string;
  title: string;
  description: string | null;
  image_path: string | null;
  starts_at: string;
  ends_at: string;
  location: string | null;
  capacity: number | null;
  registered_count: number;
  registration_deadline: string | null;
  status: "published" | "cancelled";
}

const EVENT_COLUMNS =
  "id, title, description, image_path, starts_at, ends_at, location, capacity, registered_count, registration_deadline, status";

function imageUrlFor(supabase: SupabaseClient, imagePath: string | null): string | null {
  if (!imagePath) return null;
  return supabase.storage.from("events").getPublicUrl(imagePath).data.publicUrl;
}

async function myRegisteredEventIds(
  supabase: SupabaseClient,
  contactId: string,
  eventIds: string[],
): Promise<Set<string>> {
  if (eventIds.length === 0) return new Set();
  const { data } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("contact_id", contactId)
    .eq("status", "registered")
    .in("event_id", eventIds);
  return new Set((data ?? []).map((r) => r.event_id as string));
}

function toEventItem(supabase: SupabaseClient, row: RawEvent, registeredIds: Set<string>): EventItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: imageUrlFor(supabase, row.image_path),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    capacity: row.capacity,
    registeredCount: row.registered_count,
    registrationDeadline: row.registration_deadline,
    status: row.status,
    isRegistered: registeredIds.has(row.id),
  };
}

// Home "Próximos eventos": up to `limit` upcoming, published events the
// viewer's audience membership makes visible (RLS handles the filtering).
export async function getUpcomingEventsForHome(
  supabase: SupabaseClient,
  contactId: string,
  limit = 3,
): Promise<EventItem[]> {
  const { data } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("status", "published")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  const rows = (data ?? []) as RawEvent[];
  const registered = await myRegisteredEventIds(supabase, contactId, rows.map((r) => r.id));
  return rows.map((row) => toEventItem(supabase, row, registered));
}

export interface EventListResult {
  upcoming: EventItem[];
  past: EventItem[];
}

export async function getEventList(supabase: SupabaseClient, contactId: string): Promise<EventListResult> {
  const nowIso = new Date().toISOString();

  const [{ data: upcomingData }, { data: pastData }] = await Promise.all([
    supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("status", "published")
      .gte("ends_at", nowIso)
      .order("starts_at", { ascending: true }),
    supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .lt("ends_at", nowIso)
      .order("starts_at", { ascending: false })
      .limit(20),
  ]);

  const upcomingRows = (upcomingData ?? []) as RawEvent[];
  const pastRows = (pastData ?? []) as RawEvent[];
  const registered = await myRegisteredEventIds(supabase, contactId, [
    ...upcomingRows.map((r) => r.id),
    ...pastRows.map((r) => r.id),
  ]);

  return {
    upcoming: upcomingRows.map((row) => toEventItem(supabase, row, registered)),
    past: pastRows.map((row) => toEventItem(supabase, row, registered)),
  };
}

export async function getEventDetail(
  supabase: SupabaseClient,
  contactId: string,
  eventId: string,
): Promise<EventItem | null> {
  const { data } = await supabase.from("events").select(EVENT_COLUMNS).eq("id", eventId).maybeSingle();
  if (!data) return null;
  const row = data as RawEvent;
  const registered = await myRegisteredEventIds(supabase, contactId, [row.id]);
  return toEventItem(supabase, row, registered);
}

// --- admin ---------------------------------------------------------------

export interface AdminEventItem extends EventItem {
  imagePath: string | null;
  roomId: string | null;
  roomName: string | null;
  blockRoom: boolean;
  audienceType: "all" | "plan" | "contacts";
  audiencePlanName: string | null;
}

interface RawAdminEvent extends RawEvent {
  room_id: string | null;
  block_room: boolean;
  audience_type: "all" | "plan" | "contacts";
  rooms: { name: string } | null;
  plans: { name: string } | null;
}

export async function getAdminEvents(supabase: SupabaseClient): Promise<AdminEventItem[]> {
  const { data } = await supabase
    .from("events")
    .select(
      `${EVENT_COLUMNS}, room_id, block_room, audience_type, rooms(name), plans:audience_plan_id(name)`,
    )
    .order("starts_at", { ascending: false });

  const rows = (data ?? []) as unknown as RawAdminEvent[];
  return rows.map((row) => ({
    ...toEventItem(supabase, row, new Set()),
    imagePath: row.image_path,
    roomId: row.room_id,
    roomName: row.rooms?.name ?? null,
    blockRoom: row.block_room,
    audienceType: row.audience_type,
    audiencePlanName: row.plans?.name ?? null,
  }));
}

export async function getAdminEventById(
  supabase: SupabaseClient,
  eventId: string,
): Promise<AdminEventItem | null> {
  const { data } = await supabase
    .from("events")
    .select(
      `${EVENT_COLUMNS}, room_id, block_room, audience_type, rooms(name), plans:audience_plan_id(name)`,
    )
    .eq("id", eventId)
    .maybeSingle();

  if (!data) return null;
  const row = data as unknown as RawAdminEvent;
  return {
    ...toEventItem(supabase, row, new Set()),
    imagePath: row.image_path,
    roomId: row.room_id,
    roomName: row.rooms?.name ?? null,
    blockRoom: row.block_room,
    audienceType: row.audience_type,
    audiencePlanName: row.plans?.name ?? null,
  };
}

export interface EventAttendee {
  contactId: string;
  name: string;
  status: "registered" | "cancelled";
  registeredAt: string;
  cancelledAt: string | null;
}

export async function getEventAttendees(
  supabase: SupabaseClient,
  eventId: string,
): Promise<EventAttendee[]> {
  const { data } = await supabase
    .from("event_registrations")
    .select("contact_id, status, registered_at, cancelled_at, contacts!contact_id(first_name, last_name)")
    .eq("event_id", eventId)
    .order("registered_at", { ascending: true });

  return ((data ?? []) as unknown as {
    contact_id: string;
    status: "registered" | "cancelled";
    registered_at: string;
    cancelled_at: string | null;
    contacts: { first_name: string; last_name: string | null } | null;
  }[]).map((row) => ({
    contactId: row.contact_id,
    name: row.contacts ? `${row.contacts.first_name} ${row.contacts.last_name ?? ""}`.trim() : "",
    status: row.status,
    registeredAt: row.registered_at,
    cancelledAt: row.cancelled_at,
  }));
}

export interface PlanOption {
  id: string;
  name: string;
}

export async function getActivePlans(supabase: SupabaseClient): Promise<PlanOption[]> {
  const { data } = await supabase.from("plans").select("id, name").eq("is_active", true).order("name");
  return data ?? [];
}
