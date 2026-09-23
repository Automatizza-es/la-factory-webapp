"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp } from "lucide-react";
import { updateEvent } from "@/app/admin/eventos/actions";
import type { AdminEventItem } from "@/lib/data/events";
import { useI18n } from "@/lib/i18n/context";
import { compressImage } from "@/lib/image-compress";
import { createClient } from "@/lib/supabase/client";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

interface EventEditFormProps {
  event: AdminEventItem;
}

export function EventEditForm({ event }: EventEditFormProps) {
  const router = useRouter();
  const { dict: fullDict } = useI18n();
  const dict = fullDict.admin.newEventForm;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(event.imageUrl);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [location, setLocation] = useState(event.location ?? "");
  const [capacity, setCapacity] = useState(event.capacity !== null ? String(event.capacity) : "");
  const initialDeadline = event.registrationDeadline
    ? utcIsoToZonedDateAndMinutes(event.registrationDeadline)
    : null;
  const [deadlineDate, setDeadlineDate] = useState(initialDeadline?.date ?? "");
  const [deadlineTime, setDeadlineTime] = useState(
    initialDeadline
      ? `${String(Math.floor(initialDeadline.minutes / 60)).padStart(2, "0")}:${String(initialDeadline.minutes % 60).padStart(2, "0")}`
      : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(dict.titleRequired);
      return;
    }

    setSubmitting(true);

    let imagePath: string | null = event.imagePath;
    if (file) {
      const supabase = createClient();
      const compressed = await compressImage(file);
      const path = `events/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(path, compressed, { contentType: "image/jpeg" });
      if (uploadError) {
        setError(uploadError.message);
        setSubmitting(false);
        return;
      }
      imagePath = path;
    }

    const result = await updateEvent({
      eventId: event.id,
      title,
      description,
      imagePath,
      location,
      capacity,
      registrationDeadlineDate: deadlineDate,
      registrationDeadlineTime: deadlineTime,
    });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{dict.imageLabel}</span>
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
            className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-sand bg-cream"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-warm-gray">
                <ImageUp className="h-7 w-7" strokeWidth={1.5} />
                <span className="text-sm">{dict.imageLabel}</span>
              </div>
            )}
          </button>
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm text-warm-gray">
          {dict.titleLabel}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1 text-sm text-warm-gray">
          {dict.descriptionLabel}
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1 text-sm text-warm-gray">
          {dict.locationLabel}
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          />
        </label>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1 text-sm text-warm-gray">
          {dict.capacityLabel} <span className="font-normal">({dict.capacityOptional})</span>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1 text-sm text-warm-gray">
          {dict.registrationDeadlineLabel} <span className="font-normal">({dict.deadlineOptional})</span>
        </label>
        <div className="flex gap-3">
          <input
            type="date"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            className="flex-1 rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          />
          <input
            type="time"
            value={deadlineTime}
            onChange={(e) => setDeadlineTime(e.target.value)}
            className="flex-1 rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          />
        </div>
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-2xl bg-sand/30 p-3 text-sm text-brown-dark">{dict.editSuccess}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? dict.submitting : dict.editSubmit}
      </button>
    </form>
  );
}
