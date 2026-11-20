import { type NextRequest, NextResponse } from "next/server";
import type { BoardAttachment } from "@/lib/board";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCoworker } from "@/lib/data/coworker";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const current = await getCurrentCoworker();
  if (!current) return new NextResponse(null, { status: 401 });
  const path = request.nextUrl.searchParams.get("path");
  if (!path || path.length > 300) return new NextResponse(null, { status: 400 });
  // Board upload paths are <author id>/<post id>/<file id>. Looking up the
  // post directly is more reliable than applying a JSON containment filter
  // to attachments (which was returning a false 404 for valid files).
  const segments = path.split("/");
  const [authorId, postId, fileId] = segments;
  if (segments.length !== 3 || !UUID.test(authorId) || !UUID.test(postId) || !UUID.test(fileId)) {
    return new NextResponse(null, { status: 404 });
  }
  const supabase = await createClient();
  const { data: post, error: postError } = await supabase.from("board_posts").select("attachments")
    .eq("id", postId).maybeSingle();
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
