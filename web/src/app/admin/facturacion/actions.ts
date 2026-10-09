"use server";

import { revalidatePath } from "next/cache";
import { adminActionContext } from "@/lib/admin-action";

// Tick / untick "Facturado" for one membership in one month (YYYY-MM).
export async function setInvoiced(
  membershipId: string,
  month: string,
  invoiced: boolean,
): Promise<{ error: string | null }> {
  const { dict, current, admin } = await adminActionContext();
  if (!admin || !current) return { error: dict.errors.notAuthorized };

  const periodMonth = `${month}-01`;
  const { error } = invoiced
    ? await admin
        .from("billing_marks")
        .upsert(
          { membership_id: membershipId, period_month: periodMonth, invoiced_by: current.contactId },
          { onConflict: "membership_id,period_month" },
        )
    : await admin.from("billing_marks").delete().eq("membership_id", membershipId).eq("period_month", periodMonth);

  if (error) return { error: dict.admin.userDetail.error };
  revalidatePath("/admin/facturacion");
  return { error: null };
}
