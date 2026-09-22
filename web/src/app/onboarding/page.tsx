import Image from "next/image";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { getMyOnboardingContext } from "@/lib/data/onboarding";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

interface OnboardingPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { error } = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const context = await getMyOnboardingContext();

  let message: string | null = null;

  if (!context) {
    message =
      error === "expired"
        ? dict.onboarding.errorExpired
        : error === "cancelled"
          ? dict.onboarding.errorCancelled
          : dict.onboarding.errorNotFound;
  } else if (context.status === "completed") {
    redirect("/");
  } else if (context.status === "cancelled") {
    message = dict.onboarding.errorCancelled;
  } else if (context.expired) {
    message = dict.onboarding.errorExpired;
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center gap-6 px-6 py-10">
      <Image
        src="/brand/logo-cuadrado-original.jpg"
        alt="La Factory Coworking"
        width={64}
        height={64}
        className="h-16 w-16 rounded-2xl object-cover"
        priority
      />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">{dict.onboarding.title}</h1>
        <p className="mt-1 text-sm text-warm-gray">{dict.onboarding.subtitle}</p>
      </div>

      {message ? (
        <p className="w-full rounded-2xl bg-white p-4 text-center text-sm text-ink shadow-sm">
          {message}
        </p>
      ) : (
        context && <OnboardingForm token={context.token} email={context.email} />
      )}
    </div>
  );
}
