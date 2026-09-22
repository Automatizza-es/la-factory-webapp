import type { SupabaseClient } from "@supabase/supabase-js";

export interface PackageContactOption {
  id: string;
  name: string;
}

// Active coworkers only, for the "¿Para quién es el paquete?" search --
// mirrors AdminBookingForm's contact source but scoped to active
// memberships since a package can't go to someone without one.
export async function getActiveContactsForPicker(
  supabase: SupabaseClient,
): Promise<PackageContactOption[]> {
  const { data } = await supabase
    .from("memberships")
    .select("contact_id, status, contacts(first_name, last_name)")
    .eq("status", "active");

  const seen = new Set<string>();
  const options: PackageContactOption[] = [];
  for (const row of data ?? []) {
    if (seen.has(row.contact_id)) continue;
    seen.add(row.contact_id);
    const contact = row.contacts as unknown as { first_name: string; last_name: string | null } | null;
    if (!contact) continue;
    options.push({
      id: row.contact_id,
      name: `${contact.first_name} ${contact.last_name ?? ""}`.trim(),
    });
  }

  return options.sort((a, b) => a.name.localeCompare(b.name));
}

export interface PackageItem {
  id: string;
  recipientContactId: string;
  recipientName: string;
  imageUrl: string | null;
  note: string | null;
  status: "pending" | "collected";
  receivedAt: string;
  collectedAt: string | null;
}

interface RawPackage {
  id: string;
  recipient_contact_id: string;
  image_path: string;
  note: string | null;
  status: "pending" | "collected";
  received_at: string;
  collected_at: string | null;
  contacts: { first_name: string; last_name: string | null } | null;
}

async function signImageUrls(
  supabase: SupabaseClient,
  rows: RawPackage[],
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  await Promise.all(
    rows.map(async (row) => {
      const { data } = await supabase.storage
        .from("packages")
        .createSignedUrl(row.image_path, 60 * 60);
      if (data?.signedUrl) urls.set(row.id, data.signedUrl);
    }),
  );
  return urls;
}

function toPackageItem(row: RawPackage, imageUrl: string | undefined): PackageItem {
  const contact = row.contacts;
  return {
    id: row.id,
    recipientContactId: row.recipient_contact_id,
    recipientName: contact ? `${contact.first_name} ${contact.last_name ?? ""}`.trim() : "",
    imageUrl: imageUrl ?? null,
    note: row.note,
    status: row.status,
    receivedAt: row.received_at,
    collectedAt: row.collected_at,
  };
}

export async function getMyPackages(
  supabase: SupabaseClient,
  contactId: string,
): Promise<PackageItem[]> {
  const { data } = await supabase
    .from("packages")
    .select("id, recipient_contact_id, image_path, note, status, received_at, collected_at, contacts!recipient_contact_id(first_name, last_name)")
    .eq("recipient_contact_id", contactId)
    .order("received_at", { ascending: false });

  const rows = (data ?? []) as unknown as RawPackage[];
  const urls = await signImageUrls(supabase, rows);
  return rows.map((row) => toPackageItem(row, urls.get(row.id)));
}

export interface PendingPackagesSummary {
  count: number;
  mostRecentReceivedAt: string | null;
}

// Lightweight home-banner query: no signed URLs, just enough to render
// "You have N packages waiting, most recent at <time>".
export async function getMyPendingPackagesSummary(
  supabase: SupabaseClient,
  contactId: string,
): Promise<PendingPackagesSummary> {
  const { data, count } = await supabase
    .from("packages")
    .select("received_at", { count: "exact" })
    .eq("recipient_contact_id", contactId)
    .eq("status", "pending")
    .order("received_at", { ascending: false })
    .limit(1);

  return {
    count: count ?? 0,
    mostRecentReceivedAt: data?.[0]?.received_at ?? null,
  };
}

export type PackageFilter = "pending" | "collected" | "all";

export async function getAdminPackages(
  supabase: SupabaseClient,
  filter: PackageFilter,
): Promise<PackageItem[]> {
  let query = supabase
    .from("packages")
    .select("id, recipient_contact_id, image_path, note, status, received_at, collected_at, contacts!recipient_contact_id(first_name, last_name)")
    .order("received_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);

  const { data } = await query;
  const rows = (data ?? []) as unknown as RawPackage[];
  const urls = await signImageUrls(supabase, rows);
  return rows.map((row) => toPackageItem(row, urls.get(row.id)));
}
