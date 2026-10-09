import { cookies } from "next/headers";

// Admins who are also coworkers (active membership) can switch between the
// admin panel and their own coworker space; this cookie remembers which one
// they last chose. Anyone else ignores it.
export const APP_MODE_COOKIE = "app_mode";
export type AppMode = "admin" | "coworker";

export async function getAppMode(): Promise<AppMode> {
  const value = (await cookies()).get(APP_MODE_COOKIE)?.value;
  return value === "coworker" ? "coworker" : "admin";
}
