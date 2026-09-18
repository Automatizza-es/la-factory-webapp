import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// TEMPORARY: lets us in without a working login while email delivery is
// blocked on the cdmon DNS change (pending as of 2026-09-18). Does nothing
// unless DEV_BYPASS_SECRET is set on the environment — remove this route
// and that env var once real login is confirmed working again.
const BYPASS_EMAIL = "evamartinlopez02@gmail.com";

export async function GET(request: NextRequest) {
  const secret = process.env.DEV_BYPASS_SECRET;
  const key = request.nextUrl.searchParams.get("key");
  if (!secret || key !== secret) {
    return new NextResponse("Not found", { status: 404 });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: BYPASS_EMAIL,
    options: { redirectTo: `${request.nextUrl.origin}/auth/callback` },
  });

  if (error || !data.properties?.action_link) {
    return new NextResponse("Bypass failed: could not generate link", { status: 500 });
  }

  const verifyResponse = await fetch(data.properties.action_link, { redirect: "manual" });
  const location = verifyResponse.headers.get("location");
  const hash = location?.includes("#") ? location.split("#")[1] : "";
  const params = new URLSearchParams(hash);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (!access_token || !refresh_token) {
    return new NextResponse("Bypass failed: no session tokens in verify response", {
      status: 500,
    });
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  if (sessionError) {
    return new NextResponse(`Bypass failed: ${sessionError.message}`, { status: 500 });
  }

  return NextResponse.redirect(new URL("/", request.url));
}
