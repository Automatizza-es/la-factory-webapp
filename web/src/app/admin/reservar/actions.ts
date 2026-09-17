"use server";

import { getCurrentCoworker } from "@/lib/data/coworker";
import { translateBookingError } from "@/lib/i18n/booking-errors";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { zonedDateTimeToUtcIso } from "@/lib/timezone";

export type AdminBookingType = "coworker" | "guest" | "internal" | "event";

export interface CreateAdminBookingInput {
  bookingType: AdminBookingType;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  contactId?: string;
  consumesQuota: boolean;
}

export interface CreateAdminBookingResult {
  error: string | null;
}

export async function createAdminBooking(
  input: CreateAdminBookingInput,
): Promise<CreateAdminBookingResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const startsAt = zonedDateTimeToUtcIso(input.date, input.startTime);
  const endsAt = zonedDateTimeToUtcIso(input.date, input.endTime);
  const consumesQuota = input.bookingType === "coworker" && input.consumesQuota;

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_booking", {
    p_room_id: input.roomId,
    p_contact_id: input.contactId ?? null,
    p_starts_at: startsAt,
    p_ends_at: endsAt,
    p_booking_type: input.bookingType,
    p_consumes_quota: consumesQuota,
    p_created_by: current.contactId,
  });

  return { error: error ? translateBookingError(error, dict.errors) : null };
}
