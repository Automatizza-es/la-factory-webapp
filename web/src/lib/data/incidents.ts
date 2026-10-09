import type { SupabaseClient } from "@supabase/supabase-js";

export type IncidentCategory = "internet" | "climate" | "cleaning" | "room" | "furniture" | "access" | "other";
export type IncidentStatus = "pending" | "in_progress" | "resolved";

export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  "internet",
  "climate",
  "cleaning",
  "room",
  "furniture",
  "access",
  "other",
];

export interface IncidentItem {
  id: string;
  category: IncidentCategory;
  description: string;
  imageUrl: string | null;
  status: IncidentStatus;
  adminNote: string | null;
  createdAt: string;
  isMine: boolean;
  // Admin view only.
  reporterName: string | null;
  reporterContactId: string | null;
}

interface RawIncident {
  id: string;
  reporter_contact_id: string;
  category: IncidentCategory;
  description: string;
  image_path: string | null;
  status: IncidentStatus;
  admin_note: string | null;
  created_at: string;
  contacts?: { first_name: string; last_name: string | null } | null;
}

const COLUMNS = "id, reporter_contact_id, category, description, image_path, status, admin_note, created_at";

async function toItems(
  supabase: SupabaseClient,
  rows: RawIncident[],
  myContactId: string,
  withReporter: boolean,
): Promise<IncidentItem[]> {
  return Promise.all(
    rows.map(async (row) => {
      const isMine = row.reporter_contact_id === myContactId;
      // Storage only lets the reporter and admins read the photo.
      let imageUrl: string | null = null;
      if (row.image_path && (isMine || withReporter)) {
        const { data } = await supabase.storage.from("incidents").createSignedUrl(row.image_path, 60 * 60);
        imageUrl = data?.signedUrl ?? null;
      }
      return {
        id: row.id,
        category: row.category,
        description: row.description,
        imageUrl,
        status: row.status,
        adminNote: row.admin_note,
        createdAt: row.created_at,
        isMine,
        reporterName:
          withReporter && row.contacts
            ? `${row.contacts.first_name} ${row.contacts.last_name ?? ""}`.trim()
            : null,
        reporterContactId: withReporter ? row.reporter_contact_id : null,
      };
    }),
  );
}

// What a coworker/guest sees (RLS): their own reports plus any open one.
export async function getIncidentsForMember(
  supabase: SupabaseClient,
  contactId: string,
): Promise<{ open: IncidentItem[]; mine: IncidentItem[] }> {
  const { data } = await supabase.from("incidents").select(COLUMNS).order("created_at", { ascending: false });
  const items = await toItems(supabase, (data ?? []) as RawIncident[], contactId, false);
  return {
    open: items.filter((i) => i.status !== "resolved"),
    mine: items.filter((i) => i.isMine),
  };
}

export type AdminIncidentFilter = "open" | "resolved" | "all";

export async function getAdminIncidents(
  supabase: SupabaseClient,
  contactId: string,
  filter: AdminIncidentFilter,
): Promise<IncidentItem[]> {
  let query = supabase
    .from("incidents")
    .select(`${COLUMNS}, contacts!incidents_reporter_contact_id_fkey(first_name, last_name)`)
    .order("created_at", { ascending: false });
  if (filter === "open") query = query.neq("status", "resolved");
  if (filter === "resolved") query = query.eq("status", "resolved").limit(100);

  const { data } = await query;
  return toItems(supabase, (data ?? []) as unknown as RawIncident[], contactId, true);
}
