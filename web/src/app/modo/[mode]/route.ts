import { NextResponse, type NextRequest } from "next/server";
import { APP_MODE_COOKIE } from "@/lib/app-mode";

// /modo/admin and /modo/coworker: switch an admin-who-is-also-a-coworker
// between the two sides of the app. Link here with a plain <a>, not
// next/link, so a prefetch can't flip the mode behind the user's back.
export async function GET(request: NextRequest, { params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  const target = mode === "coworker" ? "/" : "/admin";

  const response = NextResponse.redirect(new URL(target, request.nextUrl.origin));
  response.cookies.set(APP_MODE_COOKIE, mode === "coworker" ? "coworker" : "admin", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
