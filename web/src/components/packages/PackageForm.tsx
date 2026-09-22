"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Camera, CheckCircle2, ImageUp } from "lucide-react";
import { registerPackage } from "@/app/admin/paquetes/actions";
import { RecipientPicker } from "@/components/packages/RecipientPicker";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import type { PackageContactOption } from "@/lib/data/packages";
import { compressImage } from "@/lib/image-compress";
import { createClient } from "@/lib/supabase/client";
import { todayInMadrid, utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

interface PackageFormProps {
  contacts: PackageContactOption[];
  redirectTo: string;
}

export function PackageForm({ contacts, redirectTo }: PackageFormProps) {
  const { locale, dict: fullDict } = useI18n();
  const dict = fullDict.admin.newPackageForm;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [recipientId, setRecipientId] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredForName, setRegisteredForName] = useState<string | null>(null);

  const recipientName = contacts.find((c) => c.id === recipientId)?.name ?? "";
  const nowLabel = `${formatDateLong(todayInMadrid(), locale)} · ${minutesToTime(
    utcIsoToZonedDateAndMinutes(new Date().toISOString()).minutes,
  )}`;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit() {
    setError(null);

    if (!file) {
      setError(dict.photoRequired);
      return;
    }
    if (!recipientId) {
      setError(dict.recipientRequired);
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const compressed = await compressImage(file);
    const path = `packages/${crypto.randomUUID()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("packages")
      .upload(path, compressed, { contentType: "image/jpeg" });

    if (uploadError) {
      setError(uploadError.message);
      setSubmitting(false);
      return;
    }

    const result = await registerPackage({
      recipientContactId: recipientId,
      imagePath: path,
      note,
      appOrigin: window.location.origin,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setRegisteredForName(recipientName);
  }

  function handleRegisterAnother() {
    setFile(null);
    setPreview(null);
    setRecipientId("");
    setNote("");
    setError(null);
    setRegisteredForName(null);
  }

  if (registeredForName) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" strokeWidth={2} />
        </div>
        <p className="text-base font-medium text-ink">{dict.success(registeredForName)}</p>
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={handleRegisterAnother}
            className="flex w-full items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white"
          >
            {dict.registerAnother}
          </button>
          <Link
            href={redirectTo}
            className="flex w-full items-center justify-center rounded-xl bg-cream py-3 text-sm font-medium text-brown-dark"
          >
            {dict.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{dict.photoLabel}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-sand bg-white"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-warm-gray">
              <Camera className="h-8 w-8" strokeWidth={1.5} />
              <span className="text-sm">{dict.photoLabel}</span>
            </div>
          )}
        </button>
        {preview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-brown-dark"
          >
            <ImageUp className="h-4 w-4" strokeWidth={2} />
            {dict.changePhoto}
          </button>
        )}
      </div>

      <RecipientPicker
        contacts={contacts}
        value={recipientId}
        onChange={setRecipientId}
        label={dict.recipientLabel}
        searchPlaceholder={dict.searchPlaceholder}
        noResults={dict.noResults}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-sm font-medium text-ink">
          {dict.noteLabel} <span className="font-normal text-warm-gray">({dict.noteOptional})</span>
        </label>
        <textarea
          id="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark"
        />
      </div>

      {(preview || recipientName) && (
        <div className="rounded-2xl bg-cream p-4">
          <p className="text-sm font-semibold text-ink">{dict.summaryTitle}</p>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <span className="text-warm-gray">{dict.summaryFor}</span>
            <span className="text-ink">{recipientName || "—"}</span>
            <span className="text-warm-gray">{dict.summaryReceived}</span>
            <span className="text-ink">{nowLabel}</span>
          </div>
        </div>
      )}

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? dict.submitting : recipientName ? dict.submit(recipientName) : dict.submit("")}
      </button>
    </div>
  );
}
