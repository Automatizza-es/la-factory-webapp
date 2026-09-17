"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { dict } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Fallback for auth links that carry the session as a URL hash
  // (#access_token=...&refresh_token=...) instead of a PKCE ?code=.
  // gotrue-js only auto-detects the hash under the implicit flow, so with
  // flowType "pkce" (our default) it's ignored unless we set it explicitly.
  //
  // Guarded with a ref because React's Strict Mode double-invokes effects
  // in dev: without it, setSession + push + refresh ran twice concurrently,
  // which was enough overlapping load against the connection pooler to
  // make every "/" request queue up behind the others for 15s+.
  const hasHandledHash = useRef(false);
  useEffect(() => {
    if (hasHandledHash.current) return;
    if (!window.location.hash.includes("access_token")) return;
    hasHandledHash.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;

    const supabase = createClient();
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (!error) {
        router.push("/");
      }
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-8 px-6">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>

      <Image
        src="/brand/logo-cuadrado-original.jpg"
        alt="La Factory Coworking"
        width={64}
        height={64}
        className="h-16 w-16 rounded-2xl object-cover"
        priority
      />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">{dict.login.title}</h1>
        <p className="mt-1 text-sm text-warm-gray">{dict.login.subtitle}</p>
      </div>

      {status === "sent" ? (
        <p className="w-full rounded-2xl bg-white p-4 text-center text-sm text-ink shadow-sm">
          {dict.login.checkEmail(email)}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <input
            type="email"
            required
            placeholder={dict.login.placeholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {status === "sending" ? dict.login.sending : dict.login.submit}
          </button>
          {status === "error" && (
            <p className="text-center text-sm text-red-600">{dict.login.error}</p>
          )}
        </form>
      )}
    </div>
  );
}
