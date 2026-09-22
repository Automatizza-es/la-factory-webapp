"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, Copy, Mail } from "lucide-react";
import {
  createCoworkerInvitation,
  sendCoworkerInvitationEmail,
  type CreateInvitationData,
} from "@/app/admin/coworkers/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { todayInMadrid } from "@/lib/timezone";

interface NewCoworkerFormProps {
  dict: Dictionary["admin"]["newCoworker"];
}

const inputClass =
  "w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark";

export function NewCoworkerForm({ dict }: NewCoworkerFormProps) {
  const [email, setEmail] = useState("");
  const [planCode, setPlanCode] = useState<"fixed" | "hot_desk">("fixed");
  const [startDate, setStartDate] = useState(todayInMadrid());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateInvitationData | null>(null);
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await createCoworkerInvitation({
      email,
      planCode,
      startDate,
      origin: window.location.origin,
    });

    if (result.error || !result.data) {
      setError(result.error ?? "Error");
      setSubmitting(false);
      return;
    }

    setCreated(result.data);
    setSubmitting(false);
  }

  async function handleCopy() {
    if (!created) return;
    await navigator.clipboard.writeText(created.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendEmail() {
    if (!created) return;
    setSendingEmail(true);
    const result = await sendCoworkerInvitationEmail(created.invitationId, email, created.inviteLink);
    setSendingEmail(false);
    if (!result.error) setEmailSent(true);
  }

  if (created) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-xl bg-sand/40 p-3 text-sm text-brown-dark">{dict.created}</p>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{dict.inviteLinkLabel}</span>
          <div className="flex items-center gap-2 rounded-xl border border-sand bg-cream px-3 py-2.5">
            <span className="flex-1 truncate text-sm text-ink">{created.inviteLink}</span>
            <button type="button" onClick={handleCopy} aria-label={dict.inviteLinkLabel}>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" strokeWidth={2} />
              ) : (
                <Copy className="h-4 w-4 text-brown-dark" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSendEmail}
          disabled={sendingEmail || emailSent}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
          {emailSent ? dict.emailSent : sendingEmail ? dict.sendingEmail : dict.sendEmail}
        </button>

        <Link
          href="/admin/coworkers"
          className="text-center text-sm font-medium text-brown-dark underline"
        >
          {dict.backToList}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          {dict.email}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{dict.plan}</span>
        <div className="flex gap-2">
          {(["fixed", "hot_desk"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setPlanCode(code)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                planCode === code
                  ? "border-brown-dark bg-cream text-brown-dark"
                  : "border-sand bg-white text-ink"
              }`}
            >
              {code === "fixed" ? "Fixed" : "Hot Desk"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="startDate" className="text-sm font-medium text-ink">
          {dict.startDate}
        </label>
        <input
          id="startDate"
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex w-full items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? dict.submitting : dict.submit}
      </button>
    </form>
  );
}
