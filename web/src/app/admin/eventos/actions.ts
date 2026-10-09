"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { pushEventNotifications, pushWindowStart } from "@/lib/event-push";
import { createClient } from "@/lib/supabase/server";
import { zonedDateTimeToUtcIso } from "@/lib/timezone";

interface ActionResult {
  error: string | null;
}

export type EventAudienceType = "all" | "plan" | "contacts";

export interface CreateEventInput {
  title: string;
  description: string;
  imagePath: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  roomId: string | null;
  blockRoom: boolean;
  capacity: string;
  registrationDeadlineDate: string;
  registrationDeadlineTime: string;
  audienceType: EventAudienceType;
  audiencePlanId: string | null;
  audienceContactIds: string[];
  // false = save as draft (nobody sees it, nobody is told).
  publish: boolean;
}

function eventErrorMessage(code: string | undefined, dict: ReturnType<typeof getDictionary>): string {
  if (code === "INVALID_TIME_RANGE") return dict.reservar.invalidRange;
  if (code === "ROOM_OVERLAP") return dict.errors.roomOverlap;
  return dict.errors.unknown;
}

function refreshEvents(eventId?: string) {
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  if (eventId) {
    revalidatePath(`/admin/eventos/${eventId}`);
    revalidatePath(`/eventos/${eventId}`);
  }
}

export async function createEvent(input: CreateEventInput): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const startsAt = zonedDateTimeToUtcIso(input.date, input.startTime);
  const endsAt = zonedDateTimeToUtcIso(input.date, input.endTime);
  const registrationDeadline =
    input.registrationDeadlineDate && input.registrationDeadlineTime
      ? zonedDateTimeToUtcIso(input.registrationDeadlineDate, input.registrationDeadlineTime)
      : null;
  const capacity = input.capacity.trim() ? Number(input.capacity) : null;

  const supabase = await createClient();
  const since = pushWindowStart();
  const { data, error } = await supabase.rpc("admin_create_event", {
    p_title: input.title,
    p_description: input.description || null,
    p_image_path: input.imagePath,
    p_starts_at: startsAt,
    p_ends_at: endsAt,
    p_location: input.location || null,
    p_room_id: input.roomId,
    p_block_room: input.blockRoom,
    p_capacity: capacity,
    p_registration_deadline: registrationDeadline,
    p_audience_type: input.audienceType,
    p_audience_plan_id: input.audienceType === "plan" ? input.audiencePlanId : null,
    p_audience_contact_ids: input.audienceType === "contacts" ? input.audienceContactIds : null,
    p_status: input.publish ? "published" : "draft",
  });

  if (error) return { error: eventErrorMessage(error.message, dict) };

  const eventId = (data as { id: string } | null)?.id;
  if (input.publish && eventId) await pushEventNotifications(eventId, "event_new", since);
  refreshEvents(eventId);
  return { error: null };
}

export async function publishEvent(eventId: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const since = pushWindowStart();
  const { error } = await supabase.rpc("admin_publish_event", { p_event_id: eventId });
  if (error) return { error: dict.errors.unknown };

  await pushEventNotifications(eventId, "event_new", since);
  refreshEvents(eventId);
  return { error: null };
}

export interface UpdateEventInput {
  eventId: string;
  title: string;
  description: string;
  imagePath: string | null;
  location: string;
  capacity: string;
  registrationDeadlineDate: string;
  registrationDeadlineTime: string;
  date: string;
  startTime: string;
  endTime: string;
}

export async function updateEvent(input: UpdateEventInput): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const registrationDeadline =
    input.registrationDeadlineDate && input.registrationDeadlineTime
      ? zonedDateTimeToUtcIso(input.registrationDeadlineDate, input.registrationDeadlineTime)
      : null;
  const capacity = input.capacity.trim() ? Number(input.capacity) : null;

  const supabase = await createClient();
  const since = pushWindowStart();
  const { error } = await supabase.rpc("admin_update_event", {
    p_event_id: input.eventId,
    p_title: input.title,
    p_description: input.description || null,
    p_image_path: input.imagePath,
    p_location: input.location || null,
    p_capacity: capacity,
    p_registration_deadline: registrationDeadline,
    p_starts_at: zonedDateTimeToUtcIso(input.date, input.startTime),
    p_ends_at: zonedDateTimeToUtcIso(input.date, input.endTime),
  });

  if (error) return { error: eventErrorMessage(error.message, dict) };

  // Only sends anything if the date/time changed on a published event.
  await pushEventNotifications(input.eventId, "event_changed", since);
  refreshEvents(input.eventId);
  return { error: null };
}

export async function cancelEvent(eventId: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const since = pushWindowStart();
  const { error } = await supabase.rpc("admin_cancel_event", { p_event_id: eventId });
  if (error) return { error: dict.errors.unknown };

  await pushEventNotifications(eventId, "event_cancelled", since);
  refreshEvents(eventId);
  return { error: null };
}
