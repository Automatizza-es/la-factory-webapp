"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import { useI18n } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

// The email links back to /auth/callback (see supabase/templates/reset-password.html),
// which signs the person in and forwards them to /nueva-contrasena.
export default function RecoverPasswordPage() {
  const { dict } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <AuthShell title={dict.recover.title} subtitle={dict.recover.subtitle}>
      {status === "sent" ? (
        <p className="w-full rounded-2xl bg-white p-4 text-center text-sm text-ink shadow-sm">
          {dict.recover.sent(email)}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder={dict.login.placeholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={authInputClass}
          />
          <button type="submit" disabled={status === "sending"} className={authButtonClass}>
            {status === "sending" ? dict.recover.sending : dict.recover.submit}
          </button>
          {status === "error" && (
            <p className="text-center text-sm text-red-600">{dict.recover.error}</p>
          )}
        </form>
      )}
      <Link href="/login" className="text-sm font-medium text-brown-dark">
        {dict.recover.backToLogin}
      </Link>
    </AuthShell>
  );
}
