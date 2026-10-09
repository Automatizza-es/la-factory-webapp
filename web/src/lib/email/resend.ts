// Thin wrapper around Resend's HTTP API for our own transactional emails
// (not Supabase's auth SMTP, which is locked to its own auth templates).
// Sent from the hub subdomain, which is the domain verified in Resend.
const FROM_ADDRESS = "La Factory Coworking <no-reply@hub.lafactorycoworking.com>";

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
      from: FROM_ADDRESS,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) return { error: "send_failed" };
  return { error: null };
}

// Resend's batch endpoint takes up to 100 emails per request; used for the
// "send welcome to everyone" button so a big list doesn't hit the
// per-request rate limit one email at a time.
const BATCH_SIZE = 100;

export async function sendTransactionalEmails(inputs: SendEmailInput[]): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { error: "missing_api_key" };

  for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
    const batch = inputs.slice(i, i + BATCH_SIZE).map((input) => ({
      from: FROM_ADDRESS,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }));
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    });
    if (!response.ok) return { error: "send_failed" };
  }
  return { error: null };
}
