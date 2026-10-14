"use client";

import { useRef } from "react";
import { Camera, ImageUp } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

// Two ways to add a photo. A single <input accept="image/*"> leaves the
// choice to the phone, and some Android phones (OPPO, for one) then only
// offer the gallery. capture="environment" opens the back camera directly.
export function PhotoSourceButtons({ onSelect }: { onSelect: (file: File) => void }) {
  const { dict } = useI18n();
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    // Reset so picking the same file again still fires a change.
    event.target.value = "";
    if (selected) onSelect(selected);
  }

  const buttonClass =
    "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-cream px-3 py-2.5 text-sm font-medium text-brown-dark";

  return (
    <div className="flex gap-2">
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <input ref={galleryInput} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      <button type="button" onClick={() => cameraInput.current?.click()} className={buttonClass}>
        <Camera className="h-4 w-4 shrink-0" strokeWidth={2} />
        {dict.common.takePhoto}
      </button>
      <button type="button" onClick={() => galleryInput.current?.click()} className={buttonClass}>
        <ImageUp className="h-4 w-4 shrink-0" strokeWidth={2} />
        {dict.common.fromGallery}
      </button>
    </div>
  );
}
