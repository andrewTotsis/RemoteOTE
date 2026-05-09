"use client";

import Script from "next/script";

/**
 * Renders Cloudflare Turnstile widget. Inside a <form>, Turnstile's JS injects
 * a hidden input named `cf-turnstile-response`, which we read in the server
 * action via `verifyTurnstile`.
 */
export function Turnstile({ siteKey }: { siteKey: string }) {
  return (
    <div className="my-2">
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        strategy="afterInteractive"
      />
    </div>
  );
}
