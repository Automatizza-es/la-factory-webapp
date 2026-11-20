"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { changeBoardPost, replyBoardPost } from "@/app/(coworker)/tablon/actions";
import { BoardEditor } from "@/components/board/BoardEditor";
import { getBoardDictionary, type BoardPost } from "@/lib/board";
import { useI18n } from "@/lib/i18n/context";

export function BoardCreate({ contactId, base }: { contactId: string; base: string }) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  return open ? <BoardEditor contactId={contactId} base={base} onCancel={() => setOpen(false)} /> : (
    <button onClick={() => setOpen(true)} className="self-start rounded-xl bg-brown-dark px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brown hover:shadow-md">
      {getBoardDictionary(locale).newPost}
    </button>
  );
}

export function BoardManage({ post, contactId, base, admin }: {
  post: BoardPost; contactId: string; base: string; admin: boolean;
}) {
  const { locale } = useI18n();
  const t = getBoardDictionary(locale);
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(status: string, confirmation?: string) {
    if (busy || (confirmation && !window.confirm(confirmation))) return;
    setBusy(true);
    setError(null);
    try {
      const result = await changeBoardPost(post.id, status, post.updated_at);
      if (result.error) { setError(result.error); return; }
      if (status === "deleted") router.push(base);
      router.refresh();
    } catch { setError(t.error); }
    finally { setBusy(false); }
  }

  if (edit) return <BoardEditor contactId={contactId} base={base} post={post} onCancel={() => setEdit(false)} />;
  const buttonClass = "rounded-xl border border-sand bg-white px-4 py-2 text-sm text-brown-dark disabled:opacity-60";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => setEdit(true)} className={buttonClass}>{t.edit}</button>
        {post.status === "active" && <button disabled={busy} onClick={() => change("closed", t.confirmClose)} className={buttonClass}>{t.close}</button>}
        {admin && post.status !== "active" && <button disabled={busy} onClick={() => change("active")} className={buttonClass}>{t.reopen}</button>}
        {admin && post.status !== "archived" && <button disabled={busy} onClick={() => change("archived", t.confirmArchive)} className={buttonClass}>{t.archive}</button>}
        {admin && <button disabled={busy} onClick={() => change("deleted", t.confirmDelete)} className={buttonClass}>{t.remove}</button>}
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function BoardReply({ postId }: { postId: string }) {
  const { locale } = useI18n();
  const t = getBoardDictionary(locale);
  const router = useRouter();
  const [id, setId] = useState(() => crypto.randomUUID());
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await replyBoardPost(id, postId, body);
      if (result.error) { setError(result.error); return; }
      setBody("");
      setId(crypto.randomUUID());
      router.refresh();
    } catch { setError(t.error); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
      <label htmlFor="board-reply" className="text-sm font-medium">{t.replyText}</label>
      <textarea id="board-reply" required disabled={busy} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} rows={3}
        className="w-full rounded-xl border border-sand px-4 py-3 text-sm outline-none focus:border-brown-dark" />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy || !body.trim()} className="self-start rounded-xl bg-brown-dark px-5 py-3 text-sm font-medium text-white disabled:opacity-60">{busy ? t.saving : t.reply}</button>
    </form>
  );
}
