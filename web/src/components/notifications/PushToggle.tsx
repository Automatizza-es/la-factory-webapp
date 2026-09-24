"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { deletePushSubscription, savePushSubscription } from "@/app/(coworker)/perfil/notificaciones/actions";
import { useI18n } from "@/lib/i18n/context";
import {
  disablePush,
  enablePush,
  getExistingSubscription,
  getPushSupportState,
  subscriptionToJSON,
  type PushSupportState,
} from "@/lib/push";

export function PushToggle() {
  const { dict } = useI18n();
  const t = dict.notificationSettings;

  const [support, setSupport] = useState<PushSupportState | "loading">(() =>
    typeof window === "undefined" ? "loading" : getPushSupportState(),
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExistingSubscription().then((sub) => setSubscribed(!!sub));
  }, []);

  async function handleActivate() {
    setBusy(true);
    setError(null);
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("NOT_SUPPORTED");

      const subscription = await enablePush(vapidKey);
      const json = subscriptionToJSON(subscription);
      const result = await savePushSubscription({ ...json, userAgent: navigator.userAgent });
      if (result.error) throw new Error(result.error);

      setSubscribed(true);
      setSupport("granted");
    } catch (err) {
      if (err instanceof Error && err.message === "PERMISSION_DENIED") {
        setSupport("denied");
      } else {
        setError(t.permissionDenied);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDeactivate() {
    setBusy(true);
    setError(null);
    const endpoint = await disablePush();
    if (endpoint) await deletePushSubscription(endpoint);
    setSubscribed(false);
    setBusy(false);
  }

  if (support === "loading") return null;

  if (support === "unsupported") {
    return <p className="text-sm text-warm-gray">{t.notSupported}</p>;
  }

  if (subscribed) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-ink">
          <Bell className="h-4 w-4 text-brown-dark" strokeWidth={2} />
          {t.pushEnabled}
        </div>
        <button
          type="button"
          onClick={handleDeactivate}
          disabled={busy}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-cream py-2.5 text-sm font-medium text-brown-dark disabled:opacity-60"
        >
          <BellOff className="h-4 w-4" strokeWidth={2} />
          {busy ? t.deactivating : t.deactivateButton}
        </button>
      </div>
    );
  }

  if (support === "denied") {
    return <p className="text-sm text-warm-gray">{t.pushDisabledHint}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleActivate}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 rounded-xl bg-brown-dark py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        <Bell className="h-4 w-4" strokeWidth={2} />
        {busy ? t.activating : t.activateButton}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
