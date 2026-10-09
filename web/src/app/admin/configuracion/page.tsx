import { PlanPriceForm } from "@/components/admin/PlanPriceForm";
import { formatMinutesAsHours } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const dict = getDictionary(await getLocale());
  const t = dict.admin.settings;
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("id, name, monthly_minutes, monthly_price")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
        <p className="text-sm text-warm-gray">{t.subtitle}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{t.plansTitle}</h2>
        {(plans ?? []).map((plan) => (
          <div key={plan.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <p className="font-semibold text-ink">{plan.name}</p>
              <p className="text-sm text-warm-gray">
                {t.monthlyHours}: {formatMinutesAsHours(plan.monthly_minutes)}
              </p>
            </div>
            <PlanPriceForm
              planId={plan.id}
              price={plan.monthly_price === null ? null : Number(plan.monthly_price)}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
