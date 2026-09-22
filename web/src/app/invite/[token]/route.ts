import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Visiting a coworker's personal invite link: verify the token ourselves
// (our own table, not Supabase's), then sign them in as that contact using
// the same admin-generateLink + verify + setSession trick the temporary
// login bypass uses, and hand off to the onboarding form.
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const origin = request.nextUrl.origin;

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // coworker_invitations has two FKs to contacts (contact_id, created_by),
  // so a bare `contacts(...)` embed is ambiguous -- same gotcha as bookings.
  const { data: invitation } = await admin
    .from("coworker_invitations")
    .select("id, status, expires_at, contacts!coworker_invitations_contact_id_fkey(email)")
    .eq("token", token)
    .maybeSingle();

  const email = (invitation?.contacts as unknown as { email: string | null } | null)?.email;

  if (!invitation || !email) {
    return NextResponse.redirect(new URL("/onboarding?error=not_found", origin));
  }
  if (invitation.status === "cancelled") {
    return NextResponse.redirect(new URL("/onboarding?error=cancelled", origin));
  }
  if (invitation.status === "completed") {
    return NextResponse.redirect(new URL("/", origin));
  }
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/onboarding?error=expired", origin));
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${origin}/onboarding` },
  });

  if (linkError || !linkData.properties?.action_link) {
    return NextResponse.redirect(new URL("/onboarding?error=not_found", origin));
  }

  const verifyResponse = await fetch(linkData.properties.action_link, { redirect: "manual" });
  const location = verifyResponse.headers.get("location");
  const hash = location?.includes("#") ? location.split("#")[1] : "";
  const params2 = new URLSearchParams(hash);
  const access_token = params2.get("access_token");
  const refresh_token = params2.get("refresh_token");

  if (!access_token || !refresh_token) {
    return NextResponse.redirect(new URL("/onboarding?error=not_found", origin));
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  if (sessionError) {
    return NextResponse.redirect(new URL("/onboarding?error=not_found", origin));
  }

  return NextResponse.redirect(new URL("/onboarding", origin));
}
