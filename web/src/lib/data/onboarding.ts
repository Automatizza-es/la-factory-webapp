import { createClient } from "@/lib/supabase/server";

export interface OnboardingContext {
  invitationId: string;
  token: string;
  email: string;
  status: "pending" | "completed" | "cancelled";
  expired: boolean;
}

// Resolves the signed-in visitor's own most recent invitation, if any --
// used to render the onboarding form (or the right "this link no longer
// works" message) after /invite/[token] signs them in.
export async function getMyOnboardingContext(): Promise<OnboardingContext | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: userRow } = await supabase
    .from("users")
    .select("contact_id")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (!userRow) return null;

  const { data: contact } = await supabase
    .from("contacts")
    .select("email")
    .eq("id", userRow.contact_id)
    .maybeSingle();
  if (!contact?.email) return null;

  const { data: invitation } = await supabase
    .from("coworker_invitations")
    .select("id, token, status, expires_at")
    .eq("contact_id", userRow.contact_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!invitation) return null;

  return {
    invitationId: invitation.id,
    token: invitation.token,
    email: contact.email,
    status: invitation.status as OnboardingContext["status"],
    expired: new Date(invitation.expires_at) < new Date(),
  };
}
