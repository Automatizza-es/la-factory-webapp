"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveBoardPost } from "@/app/(coworker)/tablon/actions";
import { BOARD_DOCUMENT_TYPES, BOARD_IMAGE_TYPES, getBoardDictionary, type BoardAttachment, type BoardPost } from "@/lib/board";
import { useI18n } from "@/lib/i18n/context";
import { compressImage } from "@/lib/image-compress";
import { createClient } from "@/lib/supabase/client";

const inputClass = "w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark";

export function BoardEditor({ contactId, base, post, onCancel }: {
  contactId: string; base: string; post?: BoardPost; onCancel: () => void;
}) {
  const { locale } = useI18n();
  const t = getBoardDictionary(locale);
  const router = useRouter();
  const [id] = useState(() => post?.id ?? crypto.randomUUID());
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [retained, setRetained] = useState(post?.attachments ?? []);
  const [photos, setPhotos] = useState<File[]>([]);
  const [document, setDocument] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const uploaded: string[] = [];
    let saved = false;
    try {
      const files = [...photos, ...(document ? [document] : [])];
      const imageCount = retained.filter((a) => BOARD_IMAGE_TYPES.includes(a.type)).length + photos.length;
      const documentCount = retained.filter((a) => !BOARD_IMAGE_TYPES.includes(a.type)).length + Number(!!document);
      if (imageCount > 5 || documentCount > 1 || files.some((file) =>
        file.size < 1 || file.size > 10485760 || ![...BOARD_IMAGE_TYPES, ...BOARD_DOCUMENT_TYPES].includes(file.type)
      )) throw new Error(t.invalidFile);

      const attachments: BoardAttachment[] = [...retained];
      for (const file of files) {
        const image = BOARD_IMAGE_TYPES.includes(file.type);
        const content = image ? await compressImage(file) : file;
        const type = image ? content.type : file.type;
        const path = `${contactId}/${id}/${crypto.randomUUID()}`;
        const { error: uploadError } = await supabase.storage.from("board").upload(path, content, { contentType: type });
        if (uploadError) throw new Error(t.error);
        uploaded.push(path);
        attachments.push({ path, name: file.name.slice(0, 255), type });
      }
      const result = await saveBoardPost({ id, title, body, attachments, expectedUpdatedAt: post?.updated_at ?? null });
      if (result.error) throw new Error(result.error);
      saved = true;
      router.push(`${base}/${id}`);
      router.refresh();
      onCancel();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.error);
    } finally {
      if (!saved && uploaded.length) {
        try {
          await supabase.storage.from("board").remove(uploaded);
        } catch {
          console.error("Board staged upload cleanup failed");
        }
      }
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm">
      <fieldset disabled={busy} className="flex min-w-0 flex-col gap-4 disabled:opacity-70">
        <h2 className="text-lg font-semibold">{post ? t.edit : t.newPost}</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t.postTitle}
          <input required maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t.text}
          <textarea required maxLength={10000} rows={6} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} />
        </label>
        <p className="text-xs text-warm-gray">{t.fileHint}</p>
        {retained.map((file) => (
          <div key={file.path} className="flex min-w-0 items-center gap-2 rounded-xl bg-cream p-3 text-sm">
            <span className="min-w-0 flex-1 break-words">{file.name}</span>
            <button type="button" aria-label={`${t.removeFile}: ${file.name}`} onClick={() => setRetained(retained.filter((a) => a.path !== file.path))} className="shrink-0 text-brown-dark underline">{t.removeFile}</button>
          </div>
        ))}
        <label className="flex flex-col gap-2 text-sm font-medium">
          {t.photos}
          <input type="file" multiple accept={BOARD_IMAGE_TYPES.join(",")} onChange={(e) => {
            setPhotos([...photos, ...Array.from(e.target.files ?? [])]);
            e.target.value = "";
          }} className={inputClass} />
        </label>
        {photos.map((file, index) => (
          <div key={index} className="flex min-w-0 items-center gap-2 text-sm">
            <span className="min-w-0 flex-1 break-words">{file.name}</span>
            <button type="button" className="shrink-0 text-brown-dark underline" aria-label={`${t.removeFile}: ${file.name}`} onClick={() => setPhotos(photos.filter((_, i) => i !== index))}>{t.removeFile}</button>
          </div>
        ))}
        <label className="flex flex-col gap-2 text-sm font-medium">
          {t.document}
          <input type="file" accept=".pdf,.doc,.docx,.odt,.txt" onChange={(e) => {
            setDocument(e.target.files?.[0] ?? null);
          }} className={inputClass} />
        </label>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button className="rounded-xl bg-brown-dark px-5 py-3 text-sm font-medium text-white">{busy ? t.saving : post ? t.save : t.publish}</button>
          <button type="button" onClick={onCancel} className="rounded-xl border border-sand px-5 py-3 text-sm">{t.cancel}</button>
        </div>
      </fieldset>
    </form>
  );
}
