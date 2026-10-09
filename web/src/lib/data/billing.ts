import type { SupabaseClient } from "@supabase/supabase-js";

export type BillingIssue =
  | "no_price"
  | "no_tax_id"
  | "no_address"
  | "no_holded_id"
  | "starts_mid_month"
  | "ends_mid_month";

export interface BillingLine {
  membershipId: string;
  contactId: string;
  personName: string;
  planName: string;
  price: number | null;
  billable: boolean;
  // Who the invoice goes to: a company, or the person themselves.
  billTo: { kind: "person" | "company"; name: string; companyId: string | null };
  startDate: string;
  endDate: string | null;
  invoiced: boolean;
  issues: BillingIssue[];
}

export interface BillingMonth {
  // First and last day, YYYY-MM-DD.
  monthStart: string;
  monthEnd: string;
  billable: BillingLine[];
  notBillable: BillingLine[];
  totalExpected: number;
  invoicedCount: number;
}

interface RawMembership {
  id: string;
  contact_id: string;
  start_date: string;
  end_date: string | null;
  billable: boolean;
  plans: { name: string; monthly_price: number | string | null } | null;
  contacts: {
    first_name: string;
    last_name: string | null;
    nif: string | null;
    address: string | null;
    postal_code: string | null;
    city: string | null;
    holded_contact_id: string | null;
    billing_company_id: string | null;
    status: string;
  } | null;
}

function lastDayOfMonth(monthStart: string): string {
  const [y, m] = monthStart.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${monthStart.slice(0, 7)}-${String(last).padStart(2, "0")}`;
}

// Everyone with a plan for at least one day of the month (cancelled plans
// excluded), split into billable / not billable, with what's missing for
// each invoice. Admin-only data (RLS).
export async function getBillingMonth(supabase: SupabaseClient, month: string): Promise<BillingMonth> {
  const monthStart = `${month}-01`;
  const monthEnd = lastDayOfMonth(monthStart);

  const [{ data: memberships }, { data: companies }, { data: marks }] = await Promise.all([
    supabase
      .from("memberships")
      .select(
        "id, contact_id, start_date, end_date, billable, plans(name, monthly_price), contacts!memberships_contact_id_fkey(first_name, last_name, nif, address, postal_code, city, holded_contact_id, billing_company_id, status)",
      )
      .neq("status", "cancelled")
      .lte("start_date", monthEnd)
      .or(`end_date.is.null,end_date.gte.${monthStart}`),
    supabase.from("companies").select("id, name, tax_id, address, postal_code, city, holded_contact_id"),
    supabase.from("billing_marks").select("membership_id").eq("period_month", monthStart),
  ]);

  const companyById = new Map((companies ?? []).map((c) => [c.id, c]));
  const invoiced = new Set((marks ?? []).map((m) => m.membership_id as string));

  const lines: BillingLine[] = ((memberships ?? []) as unknown as RawMembership[])
    .filter((m) => m.contacts)
    .map((m): BillingLine => {
      const contact = m.contacts!;
      const personName = `${contact.first_name} ${contact.last_name ?? ""}`.trim();
      const company = contact.billing_company_id ? companyById.get(contact.billing_company_id) : undefined;
      const price = m.plans?.monthly_price == null ? null : Number(m.plans.monthly_price);

      // Fiscal checks look at whoever actually receives the invoice.
      const fiscal = company
        ? { taxId: company.tax_id, address: company.address, postalCode: company.postal_code, city: company.city, holded: company.holded_contact_id }
        : { taxId: contact.nif, address: contact.address, postalCode: contact.postal_code, city: contact.city, holded: contact.holded_contact_id };

      const issues: BillingIssue[] = [];
      if (price === null) issues.push("no_price");
      if (!fiscal.taxId) issues.push("no_tax_id");
      if (!fiscal.address || !fiscal.postalCode || !fiscal.city) issues.push("no_address");
      if (!fiscal.holded) issues.push("no_holded_id");
      if (m.start_date > monthStart) issues.push("starts_mid_month");
      if (m.end_date && m.end_date < monthEnd) issues.push("ends_mid_month");

      return {
        membershipId: m.id,
        contactId: m.contact_id,
        personName,
        planName: m.plans?.name ?? "",
        price,
        billable: m.billable && contact.status !== "archived",
        billTo: company
          ? { kind: "company", name: company.name, companyId: company.id }
          : { kind: "person", name: personName, companyId: null },
        startDate: m.start_date,
        endDate: m.end_date,
        invoiced: invoiced.has(m.id),
        issues,
      };
    })
    .sort((a, b) => a.billTo.name.localeCompare(b.billTo.name) || a.personName.localeCompare(b.personName));

  const billable = lines.filter((l) => l.billable);
  return {
    monthStart,
    monthEnd,
    billable,
    notBillable: lines.filter((l) => !l.billable),
    totalExpected: billable.reduce((sum, l) => sum + (l.price ?? 0), 0),
    invoicedCount: billable.filter((l) => l.invoiced).length,
  };
}
