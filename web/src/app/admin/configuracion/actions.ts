"use server";

import { revalidatePath } from "next/cache";
import { adminActionContext } from "@/lib/admin-action";

// Informative monthly price of a plan, in euros (null = not set).
export async function setPlanPrice(planId: string, price: number | null): Promise<{ error: string | null }> {
  const { dict, admin } = await adminActionContext();
  if (!admin) return { error: dict.errors.notAuthorized };
  if (price !== null && (!Number.isFinite(price) || price < 0)) return { error: dict.admin.settings.invalidPrice };

  const { error } = await admin.from("plans").update({ monthly_price: price }).eq("id", planId);
  if (error) return { error: dict.admin.userDetail.error };
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/facturacion");
  return { error: null };
}
