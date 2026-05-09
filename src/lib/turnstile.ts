import { headers } from "next/headers";

// Cloudflare Turnstile public test keys (documented at
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/) —
// "always passes" for dev. SWAP TO REAL KEYS IN PRODUCTION:
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY (in client) and TURNSTILE_SECRET_KEY (server).
export const TEST_SITE_KEY = "1x00000000000000000000AA";
export const TEST_SECRET = "1x0000000000000000000000000000000AA";

export function getTurnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY;
}

export function isUsingRealTurnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  return Boolean(siteKey) && !siteKey!.startsWith("1x") && !siteKey!.startsWith("2x") && !siteKey!.startsWith("3x");
}

/** Validates the Turnstile token issued by the widget. Returns true if human, false otherwise. */
export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.TURNSTILE_SECRET_KEY || TEST_SECRET;

  let remoteip: string | undefined;
  try {
    const h = await headers();
    remoteip =
      h.get("cf-connecting-ip") ||
      h.get("x-real-ip") ||
      (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
      undefined;
  } catch {
    // headers() is only callable in request scope; outside it, skip remoteip
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.append("remoteip", remoteip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      // Don't let Turnstile delays hang server actions forever
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
