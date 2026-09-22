"use client";

import { useState } from "react";
import { Check, Copy, RotateCw, X } from "lucide-react";
import { cancelCoworkerInvitation, resendCoworkerInvitation } from "@/app/admin/coworkers/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface InvitationActionsProps {
  invitationId: string;
  token: string;
  dict: Dictionary["admin"]["coworkers"];
}

export function InvitationActions({ invitationId, token, dict }: InvitationActionsProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleCopy() {
    const link = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleResend() {
    setBusy(true);
    await resendCoworkerInvitation(invitationId);
    setBusy(false);
  }

  async function handleCancel() {
    if (!window.confirm(dict.cancelConfirm)) return;
    setBusy(true);
    await cancelCoworkerInvitation(invitationId);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        disabled={busy}
        title={dict.copyLink}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-cream text-brown-dark disabled:opacity-60"
      >
        {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2} />}
      </button>
      <button
        type="button"
        onClick={handleResend}
        disabled={busy}
        title={dict.resendInvitation}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-cream text-brown-dark disabled:opacity-60"
      >
        <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={handleCancel}
        disabled={busy}
        title={dict.cancelInvitation}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 disabled:opacity-60"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
