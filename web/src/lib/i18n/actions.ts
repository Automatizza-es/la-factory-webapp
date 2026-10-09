"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { LOCALE_COOKIE, locales, type Locale } from "./config";

// The app's language is whatever each person picks in the switcher, kept in
// a cookie on that device. The last pick is also remembered on their contact
// so emails and push (sent while the app is closed) go out in it.
export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  const current = await getCurrentCoworker();
  if (current) {
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    await admin.from("contacts").update({ preferred_locale: locale }).eq("id", current.contactId);
  }

  revalidatePath("/", "layout");
}
