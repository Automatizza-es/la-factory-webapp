"use server";

import { getCurrentCoworker } from "@/lib/data/coworker";
import { translateBookingError } from "@/lib/i18n/booking-errors";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { zonedDateTimeToUtcIso } from "@/lib/timezone";

export interface SubmitBookingInput {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  existingBookingId?: string;
}

export interface SubmitBookingResult {
  error: string | null;
}

export async function submitBooking(input: SubmitBookingInput): Promise<SubmitBookingResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current) {
    return { error: dict.errors.notSignedIn };
  }

  const startsAt = zonedDateTimeToUtcIso(input.date, input.startTime);
  const endsAt = zonedDateTimeToUtcIso(input.date, input.endTime);
  const supabase = await createClient();

  if (input.existingBookingId) {
    const { error } = await supabase.rpc("modify_booking", {
      p_booking_id: input.existingBookingId,
      p_new_room_id: input.roomId,
      p_new_starts_at: startsAt,
      p_new_ends_at: endsAt,
    });
    return { error: error ? translateBookingError(error, dict.errors) : null };
  }

  const { error } = await supabase.rpc("create_booking", {
    p_room_id: input.roomId,
    p_contact_id: current.contactId,
    p_starts_at: startsAt,
    p_ends_at: endsAt,
  });

  return { error: error ? translateBookingError(error, dict.errors) : null };
}

export async function cancelBooking(bookingId: string): Promise<SubmitBookingResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current) {
    return { error: dict.errors.notSignedIn };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });
  return { error: error ? translateBookingError(error, dict.errors) : null };
}
