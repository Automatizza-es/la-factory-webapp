import { CalendarRange, Mail, ShieldCheck } from "lucide-react";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { getCurrentCoworker, getQuotaSummary } from "@/lib/data/coworker";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const supabase = await createClient();
  const [quota, auth] = await Promise.all([
    getQuotaSummary(supabase, current.contactId),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand text-2xl font-semibold text-brown-dark">
          {current.coworker.initials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">{current.coworker.firstName}</h1>
          <p className="text-sm text-warm-gray">{auth.data.user?.email}</p>
        </div>
      </div>

      <section className="flex flex-col divide-y divide-sand/40 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
          <div>
            <p className="text-sm text-warm-gray">Tarifa</p>
            <p className="font-medium text-ink">{quota?.planLabel ?? "Sin tarifa activa"}</p>
          </div>
        </div>
        {quota && (
          <div className="flex items-center gap-3 p-4">
            <CalendarRange className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
            <div>
              <p className="text-sm text-warm-gray">Periodo actual</p>
              <p className="font-medium text-ink">{quota.periodLabel}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 p-4">
          <Mail className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
          <div>
            <p className="text-sm text-warm-gray">Contacto</p>
            <p className="font-medium text-ink">hola@lafactorycoworking.com</p>
          </div>
        </div>
      </section>

      <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
        La edición de datos personales y las preferencias de comunicación estarán
        disponibles próximamente.
      </p>

      <SignOutButton />
    </div>
  );
}
