"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import { completeMyWelcomeInvitation } from "@/app/nueva-contrasena/actions";
import { useI18n } from "@/lib/i18n/context";
import { passwordErrorMessage, validateNewPassword } from "@/lib/password";
import { createClient } from "@/lib/supabase/client";

export function NewPasswordForm({ welcome }: { welcome: boolean }) {
  const router = useRouter();
  const { dict } = useI18n();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = validateNewPassword(password, confirm, dict.password);
    if (invalid) {
      setError(invalid);
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(passwordErrorMessage(updateError, dict.password));
      setSaving(false);
      return;
    }
    // A no-op unless they came from a welcome invitation.
    await completeMyWelcomeInvitation();
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell
      title={welcome ? dict.password.welcomeTitle : dict.password.title}
      subtitle={welcome ? dict.password.welcomeSubtitle : dict.password.subtitle}
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        <input
          type="password"
          required
          autoComplete="new-password"
          placeholder={dict.password.newPassword}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={authInputClass}
        />
        <input
          type="password"
          required
          autoComplete="new-password"
          placeholder={dict.password.confirmPassword}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className={authInputClass}
        />
        <button type="submit" disabled={saving} className={authButtonClass}>
          {saving ? dict.password.saving : dict.password.submit}
        </button>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>
      {!welcome && (
        <Link href="/" className="text-sm font-medium text-brown-dark">
          {dict.password.back}
        </Link>
      )}
    </AuthShell>
  );
}
