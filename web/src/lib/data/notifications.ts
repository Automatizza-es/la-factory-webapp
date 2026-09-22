import type { SupabaseClient } from "@supabase/supabase-js";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDateLong, minutesToTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  linkPath: string | null;
  read: boolean;
  createdAt: string;
}

interface RawNotification {
  id: string;
  type: string;
  link_path: string | null;
  related_id: string | null;
  read_at: string | null;
  created_at: string;
}

// Notification content is built here from `type` + the related record,
// rather than trusting stored strings, so it always renders in the
// viewer's current language.
function renderNotification(
  row: RawNotification,
  dict: Dictionary["notifications"],
  locale: Locale,
  packageReceivedAt: string | undefined,
): NotificationItem {
  let title = dict.genericTitle;
  let body = dict.genericBody;

  if (row.type === "package_received") {
    title = dict.packageReceivedTitle;
    if (packageReceivedAt) {
      const zoned = utcIsoToZonedDateAndMinutes(packageReceivedAt);
      body = dict.packageReceivedBody(`${formatDateLong(zoned.date, locale)} · ${minutesToTime(zoned.minutes)}`);
    } else {
      body = dict.packageReceivedBody("");
    }
  }

  return {
    id: row.id,
    title,
    body,
    linkPath: row.link_path,
    read: row.read_at !== null,
    createdAt: row.created_at,
  };
}

export async function getMyNotifications(
  supabase: SupabaseClient,
  contactId: string,
  dict: Dictionary["notifications"],
  locale: Locale,
  limit = 20,
): Promise<NotificationItem[]> {
  const { data } = await supabase
    .from("notifications")
    .select("id, type, link_path, related_id, read_at, created_at")
    .eq("recipient_contact_id", contactId)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as RawNotification[];

  const packageIds = rows.filter((r) => r.type === "package_received" && r.related_id).map((r) => r.related_id as string);
  const receivedAtById = new Map<string, string>();
  if (packageIds.length > 0) {
    const { data: packageRows } = await supabase
      .from("packages")
      .select("id, received_at")
      .in("id", packageIds);
    for (const p of packageRows ?? []) receivedAtById.set(p.id, p.received_at);
  }

  return rows.map((row) =>
    renderNotification(row, dict, locale, row.related_id ? receivedAtById.get(row.related_id) : undefined),
  );
}

export async function getUnreadNotificationCount(
  supabase: SupabaseClient,
  contactId: string,
): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_contact_id", contactId)
    .is("read_at", null);

  return count ?? 0;
}
