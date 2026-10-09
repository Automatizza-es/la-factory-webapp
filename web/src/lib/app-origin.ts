import { headers } from "next/headers";

// The app's own origin, taken from the request on the server. Use this for
// links inside emails sent on behalf of non-admin users: an origin sent by
// the browser could point anywhere.
export async function getAppOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "hub.lafactorycoworking.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
