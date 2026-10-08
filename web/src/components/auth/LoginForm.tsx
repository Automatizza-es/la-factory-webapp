"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import { useI18n } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ linkExpired }: { linkExpired: boolean }) {
  const router = useRouter();
  const { dict } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell title={dict.login.title} subtitle={dict.login.subtitle}>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        {linkExpired && status === "idle" && (
          <p className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-900">
            {dict.login.linkExpired}
          </p>
        )}
        <input
          type="email"
          required
          autoComplete="email"
          placeholder={dict.login.placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={authInputClass}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder={dict.login.passwordPlaceholder}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={authInputClass}
        />
        <button type="submit" disabled={status === "submitting"} className={authButtonClass}>
          {status === "submitting" ? dict.login.submitting : dict.login.submit}
        </button>
        {status === "error" && (
          <p className="text-center text-sm text-red-600">{dict.login.error}</p>
        )}
        <Link href="/recuperar" className="pt-1 text-center text-sm font-medium text-brown-dark">
          {dict.login.forgotPassword}
        </Link>
      </form>
    </AuthShell>
  );
}
