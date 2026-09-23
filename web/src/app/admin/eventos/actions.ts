"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
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
  const { error } = await supabase.rpc("admin_create_event", {
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
  });

  if (error) {
    const message =
      error.message === "INVALID_TIME_RANGE" ? dict.reservar.invalidRange : dict.errors.unknown;
    return { error: message };
  }

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  return { error: null };
}

export async function cancelEvent(eventId: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_cancel_event", { p_event_id: eventId });
  if (error) return { error: dict.errors.unknown };

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  return { error: null };
}
