"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, ImageUp } from "lucide-react";
import { reportIncident } from "@/app/(coworker)/incidencias/actions";
import { INCIDENT_CATEGORIES, type IncidentCategory } from "@/lib/data/incidents";
import { useI18n } from "@/lib/i18n/context";
import { compressImage } from "@/lib/image-compress";
import { createClient } from "@/lib/supabase/client";

export function IncidentForm({ contactId }: { contactId: string }) {
  const { dict } = useI18n();
  const t = dict.incidents;
  const fileInput = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<IncidentCategory>("internet");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim()) {
      setError(t.descriptionRequired);
      return;
    }
    setSubmitting(true);
    setError(null);

    // The photo goes into the reporter's own folder (storage policy).
    let imagePath: string | null = null;
    if (file) {
      const supabase = createClient();
      const compressed = await compressImage(file);
      const path = `${contactId}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("incidents")
        .upload(path, compressed, { contentType: "image/jpeg" });
      if (uploadError) {
        setError(uploadError.message);
        setSubmitting(false);
        return;
      }
      imagePath = path;
    }

    const result = await reportIncident({ category, description, imagePath });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={1.75} />
        <p className="text-sm text-ink">{t.sent}</p>
        <Link href="/incidencias" className="text-sm font-medium text-brown-dark">
          {t.title}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">{t.category}</span>
        <div className="flex flex-wrap gap-2">
          {INCIDENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                category === c ? "border-brown-dark bg-brown-dark text-white" : "border-sand bg-white text-ink"
              }`}
            >
              {t.categories[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="incident-description" className="text-sm font-medium text-ink">
          {t.description} *
        </label>
        <textarea
          id="incident-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.descriptionPlaceholder}
          className="w-full resize-y rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{t.photo}</span>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0] ?? null;
            setFile(selected);
            setPreview(selected ? URL.createObjectURL(selected) : null);
          }}
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={preview} alt="" className="h-40 w-full rounded-xl object-cover sm:w-64" />
        )}
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex w-fit items-center gap-1.5 rounded-xl bg-cream px-4 py-2.5 text-sm font-medium text-brown-dark"
        >
          <ImageUp className="h-4 w-4" strokeWidth={2} />
          {preview ? t.changePhoto : t.addPhoto}
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
