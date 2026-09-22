// Thin wrapper around Resend's HTTP API for our own transactional emails
// (not Supabase's auth SMTP, which is locked to its own auth templates).
// Sandboxed to Resend's verified address until the sending domain is
// verified -- same limitation as the onboarding invite email.
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  error: string | null;
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { error: "missing_api_key" };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) return { error: "send_failed" };
  return { error: null };
}
