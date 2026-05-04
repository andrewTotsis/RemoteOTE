import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { slugify } from "@/lib/slug";

async function createCompany(formData: FormData) {
  "use server";
  const user = await requireUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const website = String(formData.get("website") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const remotePolicy = String(formData.get("remotePolicy") || "remote");

  const roleTypes = (formData.getAll("roleTypes") as string[]).join("|");
  const compModel = (formData.getAll("compModel") as string[]).join("|");
  const redFlags = (formData.getAll("redFlags") as string[]).join("|");

  if (!name) redirect("/companies/new?error=name");

  let slug = slugify(name);
  let n = 1;
  while (await prisma.company.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugify(name)}-${n}`;
  }

  const company = await prisma.company.create({
    data: { name, slug, website, description, remotePolicy, roleTypes, compModel, redFlags },
  });
  redirect(`/companies/${company.slug}`);
}

const ROLE_OPTIONS = ["SDR", "BDR", "AE", "AM", "CSM", "Sales Manager", "Inside Sales"];
const COMP_OPTIONS = ["base+commission", "100% commission", "1099 contractor", "W2", "draw against commission", "MLM-style"];
const FLAG_OPTIONS = ["fake-ote", "pay-to-play", "1099-misclassification", "mlm", "no-leads", "ghost-recruiter", "unpaid-training", "high-pressure"];

export default async function NewCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const error = sp.error === "name" ? "Company name is required." : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Add a company</h1>
      <p className="text-sm text-ink/60 mt-1">
        Add a remote-sales-hiring org so other reps can review it. Be accurate — defamation isn't useful, facts are.
      </p>
      {error && <div className="mt-4 rounded-md bg-flag/10 px-3 py-2 text-sm text-flag">{error}</div>}
      <form action={createCompany} className="card mt-6 space-y-4">
        <div>
          <label className="label">Company name *</label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="label">Website</label>
          <input name="website" type="url" className="input" placeholder="https://" />
        </div>
        <div>
          <label className="label">Short description</label>
          <textarea name="description" rows={3} className="textarea" placeholder="What do they sell? Who do they hire?"></textarea>
        </div>
        <div>
          <label className="label">Remote policy</label>
          <select name="remotePolicy" className="select" defaultValue="remote">
            <option value="remote">Fully remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>
        <fieldset>
          <legend className="label">Role types they hire</legend>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((r) => (
              <label key={r} className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-3 py-1 text-sm cursor-pointer hover:bg-ink/5">
                <input type="checkbox" name="roleTypes" value={r} className="h-3 w-3" /> {r}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">Comp model</legend>
          <div className="flex flex-wrap gap-2">
            {COMP_OPTIONS.map((r) => (
              <label key={r} className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-3 py-1 text-sm cursor-pointer hover:bg-ink/5">
                <input type="checkbox" name="compModel" value={r} className="h-3 w-3" /> {r}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">Red flags <span className="text-ink/40 font-normal">(optional, only if true)</span></legend>
          <div className="flex flex-wrap gap-2">
            {FLAG_OPTIONS.map((r) => (
              <label key={r} className="inline-flex items-center gap-1 rounded-full border border-flag/30 px-3 py-1 text-sm cursor-pointer hover:bg-flag/5 text-flag">
                <input type="checkbox" name="redFlags" value={r} className="h-3 w-3" /> {r}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="btn btn-primary w-full">Submit company</button>
      </form>
    </div>
  );
}
