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
