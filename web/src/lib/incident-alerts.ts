export interface IncidentAdminRow {
  contact_id: string;
  role: string;
  contacts: {
    status: string;
    first_name: string;
    email: string | null;
    preferred_locale: string | null;
  } | null;
}

export interface IncidentAdminRecipient {
  contactId: string;
  firstName: string;
  email: string | null;
  locale: "es" | "ca" | "en";
}

// Both the query and this boundary restrict delivery to active admins.
export function incidentAdminRecipients(rows: IncidentAdminRow[]): IncidentAdminRecipient[] {
  const recipients = new Map<string, IncidentAdminRecipient>();
  for (const row of rows) {
    const contact = row.contacts;
    if (row.role !== "admin" || contact?.status !== "active") continue;
    recipients.set(row.contact_id, {
      contactId: row.contact_id,
      firstName: contact.first_name,
      email: contact.email?.trim() || null,
      locale: contact.preferred_locale === "ca" || contact.preferred_locale === "en"
        ? contact.preferred_locale : "es",
    });
  }
  return [...recipients.values()];
}

export async function deliverIncidentAdminAlerts(
  rows: IncidentAdminRow[],
  transports: {
    push: (recipient: IncidentAdminRecipient) => Promise<unknown>;
    email: (recipient: IncidentAdminRecipient) => Promise<boolean>;
  },
) {
  let pushFailed = 0;
  let emailFailed = 0;
  await Promise.all(incidentAdminRecipients(rows).map(async (recipient) => {
    // One failed channel must not prevent the other channel or the next admin
    // receiving their alert, or make the reporter submit the incident twice.
    const [push, email] = await Promise.allSettled([
      Promise.resolve().then(() => transports.push(recipient)),
      recipient.email
        ? Promise.resolve().then(() => transports.email(recipient))
        : Promise.resolve(false),
    ]);
    if (push.status === "rejected") pushFailed++;
    if (email.status === "rejected" || !email.value) emailFailed++;
  }));
  return { pushFailed, emailFailed };
}
