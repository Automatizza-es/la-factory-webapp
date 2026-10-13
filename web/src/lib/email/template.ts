// Shared look for the app's own emails (invitations, welcome, packages), so
// they match the Supabase auth templates in supabase/templates/.
const APP_ORIGIN = "https://hub.lafactorycoworking.com";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface BrandedEmailInput {
  heading: string;
  // Plain text; escaped here.
  paragraphs: string[];
  cta: { label: string; url: string };
  // Small grey lines under the button (validity, fallback link...).
  footnotes?: string[];
}

export function brandedEmailHtml({ heading, paragraphs, cta, footnotes = [] }: BrandedEmailInput) {
  const body = paragraphs
    .map(
      (p) =>
        `<p style="color:#5f5249;font-size:15px;line-height:1.5;margin:0 0 16px;">${escapeHtml(p)}</p>`,
    )
    .join("");
  const notes = footnotes
    .map(
      (n) =>
        `<p style="color:#8a7a6d;font-size:13px;line-height:1.5;margin:16px 0 0;word-break:break-all;">${escapeHtml(n)}</p>`,
    )
    .join("");

  return `
<div style="background:#f6f1ea;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;text-align:center;">
    <img src="${APP_ORIGIN}/brand/logo-cuadrado-original.jpg" alt="La Factory Coworking" width="56" height="56" style="border-radius:12px;">
    <h2 style="color:#2b211b;font-size:20px;margin:24px 0 16px;">${escapeHtml(heading)}</h2>
    ${body}
    <a href="${escapeHtml(cta.url)}"
       style="display:inline-block;margin-top:8px;background:#5b4636;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
      ${escapeHtml(cta.label)}
    </a>
    ${notes}
  </div>
</div>`;
}

export interface EmailLanguageSection extends BrandedEmailInput {
  // Anchor id and the short label in the language bar (e.g. "ca", "CAT").
  id: string;
  label: string;
}

// One email with every language in full, in the order given (La Factory's
// standard is CAT / ES / EN): a bar of jump links at the top, then each
// language with its own heading, text and button. For emails to people
// whose language we don't know yet. Jump links don't work in every mail
// client; the sections are readable by scrolling either way.
export function brandedMultilingualEmailHtml(sections: EmailLanguageSection[]) {
  const bar = sections
    .map(
      (s) =>
        `<a href="#${escapeHtml(s.id)}" style="color:#5b4636;font-weight:600;font-size:13px;text-decoration:none;">${escapeHtml(s.label)}</a>`,
    )
    .join(`<span style="color:#d8c7b2;margin:0 8px;">/</span>`);

  const blocks = sections
    .map((s, i) => {
      const body = s.paragraphs
        .map(
          (p) =>
            `<p style="color:#5f5249;font-size:15px;line-height:1.5;margin:0 0 16px;">${escapeHtml(p)}</p>`,
        )
        .join("");
      const notes = (s.footnotes ?? [])
        .map(
          (n) =>
            `<p style="color:#8a7a6d;font-size:13px;line-height:1.5;margin:16px 0 0;word-break:break-all;">${escapeHtml(n)}</p>`,
        )
        .join("");
      const divider = i > 0 ? `<div style="border-top:1px solid #eadfd2;margin:32px 0 0;"></div>` : "";
      return `${divider}
    <div id="${escapeHtml(s.id)}">
      <p style="color:#8a7a6d;font-size:12px;font-weight:600;letter-spacing:1px;margin:24px 0 0;">${escapeHtml(s.label)}</p>
      <h2 style="color:#2b211b;font-size:20px;margin:8px 0 16px;">${escapeHtml(s.heading)}</h2>
      ${body}
      <a href="${escapeHtml(s.cta.url)}"
         style="display:inline-block;margin-top:8px;background:#5b4636;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
        ${escapeHtml(s.cta.label)}
      </a>
      ${notes}
    </div>`;
    })
    .join("");

  return `
<div style="background:#f6f1ea;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;text-align:center;">
    <img src="${APP_ORIGIN}/brand/logo-cuadrado-original.jpg" alt="La Factory Coworking" width="56" height="56" style="border-radius:12px;">
    <p style="margin:16px 0 0;">${bar}</p>
    ${blocks}
  </div>
</div>`;
}
