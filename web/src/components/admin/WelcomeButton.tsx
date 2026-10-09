"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { sendWelcomeInvitations } from "@/app/admin/coworkers/actions";
import { useI18n } from "@/lib/i18n/context";

interface WelcomeButtonProps {
  contactIds: string[];
  label: string;
  // The "everyone" button asks first and is styled as the primary action.
  bulk?: boolean;
}

// Strings come from useI18n here rather than as a prop: this section of the
// dictionary has functions, which can't cross from a Server Component.
export function WelcomeButton({ contactIds, label, bulk = false }: WelcomeButtonProps) {
  const dict = useI18n().dict.admin.coworkers;
  const router = useRouter();
  const [sending, setSending] = useState(false);

  async function handleClick() {
    if (bulk && !window.confirm(dict.sendWelcomeConfirm(contactIds.length))) return;

    setSending(true);
    const result = await sendWelcomeInvitations(contactIds, window.location.origin);
    setSending(false);

    if (result.error) {
      window.alert(result.error);
    } else if (bulk) {
      window.alert(dict.welcomeSent(result.data?.sent ?? 0));
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={sending}
      className={`flex shrink-0 items-center gap-1.5 rounded-xl text-sm font-medium disabled:opacity-60 ${
        bulk
          ? "bg-brown-dark px-4 py-2.5 text-white"
          : "bg-cream px-3 py-1.5 text-xs text-brown-dark"
      }`}
    >
      <Send className={bulk ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={2} />
      {sending ? dict.sendingWelcome : label}
    </button>
  );
}
