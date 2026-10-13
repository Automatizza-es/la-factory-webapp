import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// /api/push, /api/cleanup and /api/events/reminders are called
// server-to-server by our own Supabase pg_cron/pg_net jobs, not by a browser
// session -- they check their own shared-secret header instead of a
// Supabase auth cookie, same reasoning as /invite.
const PUBLIC_PATHS = [
  "/login",
  "/recuperar",
  "/auth/callback",
  "/invite",
  "/onboarding",
  "/api/push",
  "/api/cleanup",
  "/api/events/reminders",
];

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

  // getClaims verifies the session token locally (refreshing it when it has
  // expired) instead of asking the Auth server on every request; pages
  // still check the user properly with getUser().
  const { data } = await supabase.auth.getClaims();
  const isPublicPath = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!data?.claims && !isPublicPath) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
