"use server";

import { revalidatePath } from "next/cache";
import type { AdminBookingFor } from "@/lib/data/admin";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { translateBookingError } from "@/lib/i18n/booking-errors";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { zonedDateTimeToUtcIso } from "@/lib/timezone";

export interface CreateAdminBookingInput {
  bookingFor: AdminBookingFor;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  contactId?: string;
  // Only for coworker bookings: take the hours from their monthly quota.
  consumesQuota: boolean;
  guestName?: string;
  notes?: string;
}

export async function createAdminBooking(
  input: CreateAdminBookingInput,
): Promise<{ error: string | null }> {
  const dict = getDictionary(await getLocale());
  const t = dict.admin.createBooking;
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const needsContact = input.bookingFor === "coworker" || input.bookingFor === "guest";
  if (needsContact && !input.contactId) return { error: t.contactRequired };
  if (input.bookingFor === "external" && !input.guestName?.trim()) return { error: t.nameRequired };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_create_booking", {
    p_room_id: input.roomId,
    p_contact_id: needsContact ? input.contactId : null,
    p_starts_at: zonedDateTimeToUtcIso(input.date, input.startTime),
    p_ends_at: zonedDateTimeToUtcIso(input.date, input.endTime),
    p_booking_type: input.bookingFor,
    p_consumes_quota: input.bookingFor === "coworker" && input.consumesQuota,
    p_guest_name: needsContact ? null : (input.guestName ?? null),
    p_notes: input.notes ?? null,
  });

  if (error) return { error: translateBookingError(error, dict.errors) };
  revalidatePath("/admin/calendario");
  revalidatePath("/admin");
  return { error: null };
}
