import { SignOutButton } from "@/components/layout/SignOutButton";

// Full-screen message for a signed-in person who can't use the app: their
// login isn't linked to anyone yet, or their profile is archived.
export function AccountNotice({
  title,
  body,
  signOutLabel,
}: {
  title: string;
  body: string;
  signOutLabel: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="text-sm text-warm-gray">{body}</p>
      <div className="mt-4 w-full">
        <SignOutButton label={signOutLabel} />
      </div>
    </div>
  );
}
