"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  error: string | null;
}

function translateEventError(code: string | undefined, dict: ReturnType<typeof getDictionary>): string {
  switch (code) {
    case "EVENT_FULL":
      return dict.events.errorFull;
    case "REGISTRATION_CLOSED":
      return dict.events.errorClosed;
    case "NOT_AUTHORIZED":
    case "EVENT_NOT_FOUND":
      return dict.events.errorNotAuthorized;
    default:
      return dict.events.errorGeneric;
  }
}

export async function registerForEvent(eventId: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current) return { error: dict.errors.notSignedIn };

  const supabase = await createClient();
  const { error } = await supabase.rpc("register_for_event", { p_event_id: eventId });

  if (error) return { error: translateEventError(error.message, dict) };

  revalidatePath("/eventos");
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath("/");
  return { error: null };
}

export async function cancelEventRegistration(eventId: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current) return { error: dict.errors.notSignedIn };

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_event_registration", { p_event_id: eventId });

  if (error) return { error: translateEventError(error.message, dict) };

  revalidatePath("/eventos");
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath("/");
  return { error: null };
}
