import { createClient as createServiceClient, type SupabaseClient } from "@supabase/supabase-js";
import { historySinceIso } from "@/lib/retention";

export interface PackageContactOption {
  id: string;
  name: string;
}

// Active coworkers only, for the "¿Para quién es el paquete?" search. Goes
// through a SECURITY DEFINER RPC (not a direct memberships/contacts query)
// because any signed-in coworker can register a package now, and the real
// RLS on those tables only lets someone see their own row.
export async function getActiveContactsForPicker(
  supabase: SupabaseClient,
): Promise<PackageContactOption[]> {
  const { data } = await supabase.rpc("get_active_coworkers_directory");

  const options: PackageContactOption[] = [];
  for (const row of (data ?? []) as { id: string; first_name: string; last_name: string | null }[]) {
    options.push({
      id: row.id,
      name: `${row.first_name} ${row.last_name ?? ""}`.trim(),
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
  // Whoever registered it when it arrived; null if unknown.
  receivedByName: string | null;
  collectedAt: string | null;
}

interface RawPackage {
  id: string;
  recipient_contact_id: string;
  // null once the nightly cleanup has deleted the photo.
  image_path: string | null;
  note: string | null;
  status: "pending" | "collected";
  received_at: string;
  received_by: string | null;
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
      if (!row.image_path) return;
      const { data } = await supabase.storage
        .from("packages")
        .createSignedUrl(row.image_path, 60 * 60);
      if (data?.signedUrl) urls.set(row.id, data.signedUrl);
    }),
  );
  return urls;
}

// Names of whoever received each package. contacts RLS only lets a coworker
// read their own row, so this lookup uses the service key and returns
// nothing but first + last name.
async function getReceiverNames(rows: RawPackage[]): Promise<Map<string, string>> {
  const ids = [...new Set(rows.map((r) => r.received_by).filter((id): id is string => !!id))];
  const names = new Map<string, string>();
  if (ids.length === 0) return names;

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await admin.from("contacts").select("id, first_name, last_name").in("id", ids);
  for (const c of data ?? []) {
    names.set(c.id, `${c.first_name} ${c.last_name ?? ""}`.trim());
  }
  return names;
}

async function toPackageItems(supabase: SupabaseClient, rows: RawPackage[]): Promise<PackageItem[]> {
  const [urls, receivers] = await Promise.all([signImageUrls(supabase, rows), getReceiverNames(rows)]);
  return rows.map((row) =>
    toPackageItem(row, urls.get(row.id), row.received_by ? receivers.get(row.received_by) : undefined),
  );
}

function toPackageItem(
  row: RawPackage,
  imageUrl: string | undefined,
  receivedByName: string | undefined,
): PackageItem {
  const contact = row.contacts;
  return {
    id: row.id,
    recipientContactId: row.recipient_contact_id,
    recipientName: contact ? `${contact.first_name} ${contact.last_name ?? ""}`.trim() : "",
    imageUrl: imageUrl ?? null,
    note: row.note,
    status: row.status,
    receivedAt: row.received_at,
    receivedByName: receivedByName || null,
    collectedAt: row.collected_at,
  };
}

export async function getMyPackages(
  supabase: SupabaseClient,
  contactId: string,
): Promise<PackageItem[]> {
  const { data } = await supabase
    .from("packages")
    .select("id, recipient_contact_id, image_path, note, status, received_at, received_by, collected_at, contacts!recipient_contact_id(first_name, last_name)")
    .eq("recipient_contact_id", contactId)
    // Pending ones always show, however old; picked-up ones only recently.
    .or(`status.eq.pending,received_at.gte.${historySinceIso()}`)
    .order("received_at", { ascending: false });

  const rows = (data ?? []) as unknown as RawPackage[];
  return toPackageItems(supabase, rows);
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
    .select("id, recipient_contact_id, image_path, note, status, received_at, received_by, collected_at, contacts!recipient_contact_id(first_name, last_name)")
    .order("received_at", { ascending: false });

  if (filter === "pending") {
    query = query.eq("status", "pending");
  } else {
    // Pending ones always show, however old; picked-up ones only recently.
    const since = historySinceIso();
    query =
      filter === "collected"
        ? query.eq("status", "collected").gte("received_at", since)
        : query.or(`status.eq.pending,received_at.gte.${since}`);
  }

  const { data } = await query;
  const rows = (data ?? []) as unknown as RawPackage[];
  return toPackageItems(supabase, rows);
}
