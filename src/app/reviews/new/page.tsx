import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { StarInput } from "@/components/Stars";

async function createReview(formData: FormData) {
  "use server";
  const user = await requireUser();
  if (!user) redirect("/login");

  const companyId = String(formData.get("companyId") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const isAnonymous = formData.get("isAnonymous") === "on";

  const ratingPay = Number(formData.get("ratingPay"));
  const ratingLeads = Number(formData.get("ratingLeads"));
  const ratingMgmt = Number(formData.get("ratingMgmt"));
  const ratingLegit = Number(formData.get("ratingLegit"));
  const ratingCulture = Number(formData.get("ratingCulture"));

  const ratings = [ratingPay, ratingLeads, ratingMgmt, ratingLegit, ratingCulture];
  if (!companyId || !title || !body || ratings.some((r) => !Number.isInteger(r) || r < 1 || r > 5)) {
    redirect(`/reviews/new?companyId=${companyId}&error=invalid`);
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) redirect("/companies");

  await prisma.review.create({
    data: {
      userId: user.id, companyId, title, body, isAnonymous,
      ratingPay, ratingLeads, ratingMgmt, ratingLegit, ratingCulture,
    },
  });

  redirect(`/companies/${company.slug}`);
}

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; companyId?: string; error?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  let company = null;
  if (sp.companyId) {
    company = await prisma.company.findUnique({ where: { id: sp.companyId } });
  } else if (sp.company) {
    company = await prisma.company.findUnique({ where: { slug: sp.company } });
  }

  if (!company) {
    const all = await prisma.company.findMany({ orderBy: { name: "asc" } });
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Pick a company to review</h1>
        <p className="text-sm text-ink/60 mt-1">Or <a className="underline" href="/companies/new">add a new one</a>.</p>
        <ul className="mt-4 space-y-2">
          {all.map((c) => (
            <li key={c.id}>
              <a className="card block hover:shadow-md" href={`/reviews/new?company=${c.slug}`}>{c.name}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const error = sp.error === "invalid" ? "Please fill all required fields and rate each dimension 1–5." : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Review {company.name}</h1>
      <p className="text-sm text-ink/60 mt-1">
        Be specific. "Pay was bad" is useless — "OTE was advertised as $120k, actual reps clearing &lt;$60k" is gold.
      </p>
      {error && <div className="mt-4 rounded-md bg-flag/10 px-3 py-2 text-sm text-flag">{error}</div>}
      <form action={createReview} className="card mt-6 space-y-4">
        <input type="hidden" name="companyId" value={company.id} />
        <div>
          <label className="label">Title *</label>
          <input name="title" required className="input" placeholder="e.g. OTE is fiction; lead quality is roadkill" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <StarInput name="ratingPay" label="Pay accuracy (OTE matches reality)" />
          <StarInput name="ratingLeads" label="Lead quality / pipeline" />
          <StarInput name="ratingMgmt" label="Management" />
          <StarInput name="ratingLegit" label="Legitimacy (not a scam)" />
          <StarInput name="ratingCulture" label="Culture" />
        </div>
        <div>
          <label className="label">Your review *</label>
          <textarea name="body" required rows={8} className="textarea" placeholder="What was the role? What did they pay? What did they tell you vs reality? Pipeline? Tools? Quotas?"></textarea>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" name="isAnonymous" defaultChecked /> Post anonymously (recommended — your display name won't be shown)
        </label>
        <button type="submit" className="btn btn-primary w-full">Publish review</button>
      </form>
    </div>
  );
}
