"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp } from "lucide-react";
import { createEvent, type EventAudienceType } from "@/app/admin/eventos/actions";
import { AudienceContactPicker } from "@/components/admin/AudienceContactPicker";
import type { AdminRoom } from "@/lib/data/admin";
import type { PackageContactOption } from "@/lib/data/packages";
import type { PlanOption } from "@/lib/data/events";
import { defaultEndTime, defaultStartTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { compressImage } from "@/lib/image-compress";
import { createClient } from "@/lib/supabase/client";
import { todayInMadrid } from "@/lib/timezone";

interface EventFormProps {
  rooms: AdminRoom[];
  plans: PlanOption[];
  contacts: PackageContactOption[];
}

export function EventForm({ rooms, plans, contacts }: EventFormProps) {
  const router = useRouter();
  const { dict: fullDict } = useI18n();
  const dict = fullDict.admin.newEventForm;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayInMadrid());
  const [startTime, setStartTime] = useState(defaultStartTime());
  const [endTime, setEndTime] = useState(defaultEndTime(startTime));
  const [location, setLocation] = useState("");
  const [roomId, setRoomId] = useState("");
  const [blockRoom, setBlockRoom] = useState(false);
  const [capacity, setCapacity] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [audienceType, setAudienceType] = useState<EventAudienceType>("all");
  const [audiencePlanId, setAudiencePlanId] = useState("");
  const [audienceContactIds, setAudienceContactIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(dict.titleRequired);
      return;
    }

    setSubmitting(true);

    let imagePath: string | null = null;
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

    const result = await createEvent({
      title,
      description,
      imagePath,
      date,
      startTime,
      endTime,
      location,
      roomId: roomId || null,
      blockRoom: roomId ? blockRoom : false,
      capacity,
      registrationDeadlineDate: deadlineDate,
      registrationDeadlineTime: deadlineTime,
      audienceType,
      audiencePlanId: audiencePlanId || null,
      audienceContactIds,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSuccess(true);
    router.push("/admin/eventos");
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
          {dict.dateLabel}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          />
        </label>
        <div className="mt-3 flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-warm-gray">
            {dict.startTimeLabel}
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-warm-gray">
            {dict.endTimeLabel}
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
            />
          </label>
        </div>

        <label className="mt-3 flex flex-col gap-1 text-sm text-warm-gray">
          {dict.roomLabel}
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          >
            <option value="">{dict.noRoom}</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        {roomId && (
          <label className="mt-3 flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={blockRoom}
              onChange={(e) => setBlockRoom(e.target.checked)}
              className="h-4 w-4 rounded border-sand"
            />
            {dict.blockRoomLabel}
          </label>
        )}
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

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1 text-sm text-warm-gray">
          {dict.audienceLabel}
          <select
            value={audienceType}
            onChange={(e) => {
              const next = e.target.value as EventAudienceType;
              setAudienceType(next);
              if (next === "plan" && !audiencePlanId) setAudiencePlanId(plans[0]?.id ?? "");
            }}
            className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          >
            <option value="all">{dict.audienceAll}</option>
            <option value="plan" disabled={plans.length === 0}>
              {dict.audiencePlan}
            </option>
            <option value="contacts">{dict.audienceContacts}</option>
          </select>
        </label>

        {audienceType === "plan" && plans.length > 0 && (
          <label className="mt-3 flex flex-col gap-1 text-sm text-warm-gray">
            {dict.audiencePlan}
            <select
              value={audiencePlanId}
              onChange={(e) => setAudiencePlanId(e.target.value)}
              className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {audienceType === "contacts" && (
          <div className="mt-3">
            <AudienceContactPicker
              contacts={contacts}
              value={audienceContactIds}
              onChange={setAudienceContactIds}
              searchPlaceholder={dict.audienceSearchPlaceholder}
            />
          </div>
        )}
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-2xl bg-sand/30 p-3 text-sm text-brown-dark">{dict.success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? dict.submitting : dict.submit}
      </button>
    </form>
  );
}
