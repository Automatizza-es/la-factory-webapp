"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Fallback for auth links that carry the session as a URL hash
  // (#access_token=...&refresh_token=...) instead of a PKCE ?code=.
  // gotrue-js only auto-detects the hash under the implicit flow, so with
  // flowType "pkce" (our default) it's ignored unless we set it explicitly.
  useEffect(() => {
    if (!window.location.hash.includes("access_token")) return;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;

    const supabase = createClient();
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (!error) {
        router.push("/");
        router.refresh();
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
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-8 px-6">
      <Image
        src="/brand/logo-cuadrado-original.jpg"
        alt="La Factory Coworking"
        width={64}
        height={64}
        className="h-16 w-16 rounded-2xl object-cover"
        priority
      />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">Entrar</h1>
        <p className="mt-1 text-sm text-warm-gray">
          Te enviamos un enlace de acceso a tu email, sin contraseña.
        </p>
      </div>

      {status === "sent" ? (
        <p className="w-full rounded-2xl bg-white p-4 text-center text-sm text-ink shadow-sm">
          Revisa <span className="font-medium">{email}</span> y abre el enlace que te hemos
          enviado para entrar.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <input
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {status === "sending" ? "Enviando..." : "Enviar enlace de acceso"}
          </button>
          {status === "error" && (
            <p className="text-center text-sm text-red-600">
              No hemos podido enviar el enlace. Inténtalo de nuevo.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
