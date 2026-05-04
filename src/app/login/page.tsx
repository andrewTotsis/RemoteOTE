import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) redirect("/login?error=missing");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect("/login?error=invalid");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) redirect("/login?error=invalid");

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.displayName = user.displayName;
  await session.save();
  redirect("/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const errorMap: Record<string, string> = {
    missing: "Email and password required.",
    invalid: "Invalid email or password.",
  };
  const error = sp.error ? errorMap[sp.error] || "Something went wrong." : null;
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {error && <div className="mt-4 rounded-md bg-flag/10 px-3 py-2 text-sm text-flag">{error}</div>}
      <form action={login} className="card mt-6 space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" name="email" required className="input" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" name="password" required className="input" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Sign in</button>
        <p className="text-sm text-ink/60 text-center">
          New here? <Link href="/signup" className="underline">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
