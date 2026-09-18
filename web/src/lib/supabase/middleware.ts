import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

// TEMPORARY: while Resend's sending domain is pending DNS verification
// (due back 2026-09-22), TEMP_AUTH_BYPASS=true on Vercel logs any
// unauthenticated visitor in as the coworker test account automatically,
// so the app can still be reviewed without a working magic-link email.
// No secret in the URL — gated purely by that env var. Remove it (and this
// block) once real login is confirmed working again.
const BYPASS_EMAIL = "evaamartiin12@gmail.com";

async function mintBypassSession(request: NextRequest): Promise<NextResponse | null> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;

  const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: BYPASS_EMAIL,
    options: { redirectTo: request.nextUrl.origin },
  });
  if (error || !data.properties?.action_link) return null;

  const verifyResponse = await fetch(data.properties.action_link, { redirect: "manual" });
  const location = verifyResponse.headers.get("location");
  const hash = location?.includes("#") ? location.split("#")[1] : "";
  const params = new URLSearchParams(hash);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return null;

  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (sessionError) return null;

  return response;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const isPublicPath = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!data.user && !isPublicPath) {
    if (process.env.TEMP_AUTH_BYPASS === "true") {
      const bypassed = await mintBypassSession(request);
      if (bypassed) return bypassed;
    }

    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
