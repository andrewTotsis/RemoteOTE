import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

async function signup(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const displayName = String(formData.get("displayName") || "").trim();

  if (!email || !password || !displayName) {
    redirect("/signup?error=missing");
  }
  if (password.length < 8) {
    redirect("/signup?error=password");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/signup?error=exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName },
  });

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.displayName = user.displayName;
  await session.save();

  redirect("/");
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const errorMap: Record<string, string> = {
    missing: "Fill in every field.",
    password: "Password must be at least 8 characters.",
    exists: "An account with that email already exists.",
  };
  const error = sp.error ? errorMap[sp.error] || "Something went wrong." : null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <p className="text-sm text-ink/60 mt-1">
        You can post and review anonymously — your display name is only shown if you opt out of anonymous mode.
      </p>
      {error && <div className="mt-4 rounded-md bg-flag/10 px-3 py-2 text-sm text-flag">{error}</div>}
      <form action={signup} className="card mt-6 space-y-4">
        <div>
          <label className="label">Display name</label>
          <input name="displayName" required className="input" placeholder="e.g. ClosingAndy" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" name="email" required className="input" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" name="password" required minLength={8} className="input" />
          <p className="text-xs text-ink/50 mt-1">Min 8 characters.</p>
        </div>
        <button type="submit" className="btn btn-primary w-full">Create account</button>
        <p className="text-sm text-ink/60 text-center">
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
