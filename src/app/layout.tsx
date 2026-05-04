import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "RemoteOTE — Honest reviews of remote sales jobs",
  description:
    "RepVue meets Yelp for remote sales. Real reviews of remote SDR/AE/BDR/AM roles, scam alerts, and a community forum to call out shady comp plans before you take the job.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const loggedIn = !!session.userId;

  return (
    <html lang="en">
      <body>
        <header className="border-b border-ink/10 bg-white/80 backdrop-blur sticky top-0 z-30">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-block h-7 w-7 rounded-md bg-ink text-bone text-center text-[15px] font-bold leading-7">R</span>
              <span className="text-lg font-semibold tracking-tight">RemoteOTE</span>
              <span className="hidden sm:inline text-xs text-ink/50">honest remote-sales reviews</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/companies" className="px-3 py-1.5 rounded hover:bg-ink/5">Companies</Link>
              <Link href="/forum" className="px-3 py-1.5 rounded hover:bg-ink/5">Forum</Link>
              <Link href="/scam-alerts" className="px-3 py-1.5 rounded hover:bg-ink/5">Scam alerts</Link>
              {loggedIn ? (
                <>
                  <Link href="/companies/new" className="btn btn-outline ml-1">+ Add company</Link>
                  <Link href="/account" className="px-3 py-1.5 rounded hover:bg-ink/5">
                    {session.displayName}
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <button className="px-3 py-1.5 rounded hover:bg-ink/5" type="submit">Sign out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-3 py-1.5 rounded hover:bg-ink/5">Sign in</Link>
                  <Link href="/signup" className="btn btn-primary ml-1">Join free</Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="border-t border-ink/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink/60 flex flex-wrap items-center gap-x-6 gap-y-2 justify-between">
            <div>
              © {new Date().getFullYear()} RemoteOTE — built by reps, for reps.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:underline">About</Link>
              <Link href="/guidelines" className="hover:underline">Community guidelines</Link>
              <Link href="/scam-alerts" className="hover:underline">Scam alerts</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
