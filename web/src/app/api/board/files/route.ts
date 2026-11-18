import { type NextRequest, NextResponse } from "next/server";
import type { BoardAttachment } from "@/lib/board";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCoworker } from "@/lib/data/coworker";

export async function GET(request: NextRequest) {
  const current = await getCurrentCoworker();
  if (!current) return new NextResponse(null, { status: 401 });
  const path = request.nextUrl.searchParams.get("path");
  if (!path || path.length > 300) return new NextResponse(null, { status: 400 });
  const supabase = await createClient();
  const { data: post, error: postError } = await supabase.from("board_posts").select("attachments")
    .contains("attachments", [{ path }]).limit(1).maybeSingle();
  const attachment = (post?.attachments as BoardAttachment[] | undefined)?.find((file) => file.path === path);
  if (postError || !attachment) return new NextResponse(null, { status: 404 });
  const { data, error } = await supabase.storage.from("board").createSignedUrl(path, 60, {
    download: request.nextUrl.searchParams.has("download") ? attachment.name : false,
  });
  if (error || !data) return new NextResponse(null, { status: 404 });
  const response = NextResponse.redirect(data.signedUrl);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
