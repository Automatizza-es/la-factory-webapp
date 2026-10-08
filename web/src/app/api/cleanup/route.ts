import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { CLEANUP_AFTER_DAYS } from "@/lib/retention";

export const runtime = "nodejs";

// Storage's remove() takes at most 1000 paths per call.
const PHOTO_BATCH_SIZE = 1000;

// Nightly housekeeping, called only by the daily-cleanup pg_cron job in
// Supabase -- gated by the same shared secret as /api/push/send.
// - Package photos are deleted 30 days after pickup (the package record
//   stays; its image_path becomes null).
// - Notifications older than 30 days are deleted.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.PUSH_CRON_SECRET}`;
  if (!process.env.PUSH_CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const cutoff = new Date(Date.now() - CLEANUP_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();

  let photosDeleted = 0;
  for (;;) {
    const { data: packages, error } = await supabase
      .from("packages")
      .select("id, image_path")
      .eq("status", "collected")
      .lt("collected_at", cutoff)
      .not("image_path", "is", null)
      .limit(PHOTO_BATCH_SIZE);

    if (error || !packages || packages.length === 0) break;

    const { error: removeError } = await supabase.storage
      .from("packages")
      .remove(packages.map((p) => p.image_path as string));
    if (removeError) break;

    await supabase
      .from("packages")
      .update({ image_path: null })
      .in(
        "id",
        packages.map((p) => p.id),
      );

    photosDeleted += packages.length;
    if (packages.length < PHOTO_BATCH_SIZE) break;
  }

  const { count: notificationsDeleted } = await supabase
    .from("notifications")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  return NextResponse.json({ photosDeleted, notificationsDeleted: notificationsDeleted ?? 0 });
}
