"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { sendAnnouncement, type AnnouncementAudience } from "@/app/admin/comunicados/actions";
import { personInputClass } from "@/components/admin/person/PersonFieldsCard";
import { Switch } from "@/components/admin/person/Switch";
import type { AnnouncementTexts } from "@/lib/announcements";
import { LOCALE_LABELS, locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";

const EMPTY_TEXTS: AnnouncementTexts = {
  es: { title: "", body: "" },
  ca: { title: "", body: "" },
  en: { title: "", body: "" },
};

export function AnnouncementForm({
  plans,
  people,
}: {
  plans: { id: string; name: string }[];
  people: { id: string; name: string }[];
}) {
  const { dict, locale } = useI18n();
  const t = dict.admin.announcements;
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<Locale>(locale);
  const [texts, setTexts] = useState<AnnouncementTexts>(EMPTY_TEXTS);
  const [sendEmail, setSendEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? people.filter((p) => p.name.toLowerCase().includes(q)) : people;
  }, [people, search]);

  const audiences: { key: AnnouncementAudience; label: string }[] = [
    { key: "all", label: t.audienceAll },
    { key: "coworkers", label: t.audienceCoworkers },
    { key: "guests", label: t.audienceGuests },
    { key: "plan", label: t.audiencePlan },
    { key: "contacts", label: t.audienceContacts },
  ];

  function setText(field: "title" | "body", value: string) {
    setTexts((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm(t.confirm)) return;
    setSending(true);
    setMessage(null);
    const result = await sendAnnouncement({
      audience,
      planId,
      contactIds: [...chosen],
      texts,
      sendEmail,
      origin: window.location.origin,
    });
    setSending(false);
    if (result.error) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    setMessage({ ok: true, text: t.sent(result.sent ?? 0) });
    setTexts(EMPTY_TEXTS);
    setChosen(new Set());
    setSendEmail(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">{t.audience}</span>
        <div className="flex flex-wrap gap-2">
          {audiences.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setAudience(a.key)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                audience === a.key ? "border-brown-dark bg-brown-dark text-white" : "border-sand bg-white text-ink"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        {audience === "plan" && (
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            aria-label={t.choosePlan}
            className={`${personInputClass} sm:w-64`}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        {audience === "contacts" && (
          <div className="flex flex-col gap-2">
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" strokeWidth={2} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPeople}
                aria-label={t.searchPeople}
                className={`${personInputClass} pl-9`}
              />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-xl border border-sand/60">
              {matches.map((p) => (
                <label key={p.id} className="flex items-center gap-2.5 border-b border-sand/30 px-3 py-2 text-sm last:border-0">
                  <input
                    type="checkbox"
                    checked={chosen.has(p.id)}
                    onChange={(e) =>
                      setChosen((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(p.id);
                        else next.delete(p.id);
                        return next;
                      })
                    }
                    className="h-4 w-4 rounded border-sand text-brown-dark focus:ring-brown-dark"
                  />
                  <span className="text-ink">{p.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-warm-gray">{t.selected(chosen.size)}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-1 rounded-xl bg-cream p-1 sm:w-fit">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`flex-1 rounded-lg px-4 py-1.5 text-sm font-medium sm:flex-none ${
                lang === code ? "bg-white text-brown-dark shadow-sm" : "text-warm-gray"
              }`}
            >
              {LOCALE_LABELS[code].name}
              {texts[code].title && texts[code].body ? " ✓" : ""}
            </button>
          ))}
        </div>
        <p className="text-xs text-warm-gray">{t.languagesHint}</p>
        <input
          value={texts[lang].title}
          onChange={(e) => setText("title", e.target.value)}
          placeholder={t.titleLabel}
          aria-label={t.titleLabel}
          className={personInputClass}
        />
        <textarea
          rows={6}
          value={texts[lang].body}
          onChange={(e) => setText("body", e.target.value)}
          placeholder={t.bodyLabel}
          aria-label={t.bodyLabel}
          className={`${personInputClass} resize-y`}
        />
      </div>

      <div className="flex items-start justify-between gap-4 border-t border-sand/30 pt-4">
        <div>
          <p className="text-sm text-ink">{t.sendEmail}</p>
          <p className="text-xs text-warm-gray">{t.sendEmailHint}</p>
        </div>
        <Switch checked={sendEmail} onChange={setSendEmail} label={t.sendEmail} />
      </div>

      {message && (
        <p className={`rounded-xl p-3 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="flex w-full items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto sm:self-end sm:px-8"
      >
        {sending ? t.sending : t.send}
      </button>
    </form>
  );
}
