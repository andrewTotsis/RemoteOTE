import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Turnstile } from "@/components/Turnstile";
import { getTurnstileSiteKey, verifyTurnstile } from "@/lib/turnstile";

async function createThread(formData: FormData) {
  "use server";
  const user = await requireUser();
  if (!user) redirect("/login");

  const captchaToken = String(formData.get("cf-turnstile-response") || "");
  if (!(await verifyTurnstile(captchaToken))) redirect("/forum/new?error=captcha");

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const companySlug = String(formData.get("companySlug") || "").trim();

  if (!title || !body) redirect("/forum/new?error=missing");

  let companyId: string | null = null;
  if (companySlug) {
    const c = await prisma.company.findUnique({ where: { slug: companySlug } });
    if (c) companyId = c.id;
  }

  const t = await prisma.thread.create({
    data: { userId: user.id, title, body, companyId },
  });
  redirect(`/forum/${t.id}`);
}

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; error?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const errorMap: Record<string, string> = {
    missing: "Title and body are required.",
    captcha: "Captcha failed. Please try again.",
  };
  const error = sp.error ? errorMap[sp.error] || null : null;
  const companies = await prisma.company.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">New forum thread</h1>
      {error && <div className="mt-4 rounded-md bg-flag/10 px-3 py-2 text-sm text-flag">{error}</div>}
      <form action={createThread} className="card mt-6 space-y-4">
        <div>
          <label className="label">Title *</label>
          <input name="title" required className="input" placeholder="e.g. Anyone interviewed at Acme Inc? Recruiter vibes off" />
        </div>
        <div>
          <label className="label">Related company <span className="text-ink/40 font-normal">(optional)</span></label>
          <select name="companySlug" defaultValue={sp.company || ""} className="select">
            <option value="">— general discussion —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Your post *</label>
          <textarea name="body" required rows={8} className="textarea" placeholder="What's the situation? What do you want to know?"></textarea>
        </div>
        <Turnstile siteKey={getTurnstileSiteKey()} />
        <button type="submit" className="btn btn-primary w-full">Post thread</button>
      </form>
    </div>
  );
}
