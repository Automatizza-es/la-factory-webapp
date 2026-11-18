"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { createClient } from "@/lib/supabase/server";
import { sendPushToContact } from "@/lib/push-server";
import { getBoardDictionary, type BoardAttachment } from "@/lib/board";
import { getLocale } from "@/lib/i18n/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function removeUnusedFiles(supabase: SupabaseClient, files: BoardAttachment[]) {
  if (!files.length) return;
  try {
    const { error } = await supabase.storage.from("board").remove(files.map((file) => file.path));
    if (error) console.error("Board attachment cleanup failed");
  } catch {
    console.error("Board attachment cleanup failed");
  }
}

function refreshBoard(id: string) {
  for (const base of ["/tablon", "/admin/tablon"]) {
    revalidatePath(base);
    revalidatePath(`${base}/${id}`);
  }
}
async function actionError(message?: string) {
  const t = getBoardDictionary(await getLocale());
  if (message?.includes("BOARD_CONFLICT")) return t.conflict;
  if (message?.includes("BOARD_CLOSED")) return t.closedHint;
  return t.error;
}

export async function saveBoardPost(input: {
  id: string; title: string; body: string; attachments: BoardAttachment[]; expectedUpdatedAt: string | null;
}) {
  const current = await getCurrentCoworker();
  if (!current) return { error: await actionError() };
  const supabase = await createClient();
  const { data: old } = await supabase.from("board_posts").select("attachments").eq("id", input.id).maybeSingle();
  const { error } = await supabase.rpc("save_board_post", {
    p_id: input.id, p_title: input.title, p_body: input.body,
    p_attachments: input.attachments, p_expected_updated_at: input.expectedUpdatedAt,
  });
  if (error) return { error: await actionError(error.message) };
  const kept = new Set(input.attachments.map((a) => a.path));
  const removed = ((old?.attachments ?? []) as BoardAttachment[]).filter((a) => !kept.has(a.path));
  await removeUnusedFiles(supabase, removed);
  refreshBoard(input.id);
  return { error: null };
}

export async function changeBoardPost(id: string, status: string, expectedUpdatedAt: string) {
  const current = await getCurrentCoworker();
  if (!current) return { error: await actionError() };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("change_board_post", {
    p_id: id, p_status: status, p_expected_updated_at: expectedUpdatedAt,
  });
  if (error) return { error: await actionError(error.message) };
  const removed = (data ?? []) as BoardAttachment[];
  await removeUnusedFiles(supabase, removed);
  refreshBoard(id);
  return { error: null };
}

export async function replyBoardPost(id: string, postId: string, body: string) {
  const current = await getCurrentCoworker();
  if (!current || current.access === "guest") return { error: await actionError() };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reply_board_post", { p_id: id, p_post_id: postId, p_body: body }).single<{
    id: string; notify_contact_id: string | null; author_is_admin: boolean; post_title: string;
  }>();
  if (error || !data) return { error: await actionError(error?.message) };
  if (data.notify_contact_id) {
    try {
      await sendPushToContact(data.notify_contact_id, (_d, locale) => ({
        title: getBoardDictionary(locale).replyTitle,
        body: `${getBoardDictionary(locale).replyBody}: ${data.post_title}`,
        url: `${data.author_is_admin ? "/admin" : ""}/tablon/${postId}?comment=${id}#comment-${id}`,
      }));
    } catch {
      console.error("Board reply push failed");
    }
  }
  refreshBoard(postId);
  return { error: null };
}
