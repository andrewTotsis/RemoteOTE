import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { aggregate } from "@/lib/ratings";
import { Stars } from "@/components/Stars";
import { tagsToArray } from "@/lib/slug";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; flag?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const sort = sp.sort || "top";
  const flag = sp.flag || "";

  const companies = await prisma.company.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }
      : undefined,
    include: { reviews: true },
  });

  const enriched = companies
    .map((c) => ({ ...c, agg: aggregate(c.reviews), flags: tagsToArray(c.redFlags) }))
    .filter((c) => (flag ? c.flags.includes(flag) : true));

  enriched.sort((a, b) => {
    if (sort === "new") return b.createdAt.getTime() - a.createdAt.getTime();
    if (sort === "reviews") return b.agg.count - a.agg.count;
    if (sort === "flagged") return b.flags.length - a.flags.length;
    return b.agg.overall - a.agg.overall;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-sm text-ink/60 mt-1">
            Remote sales orgs reviewed by reps. Filter by red flags to skip the scammy ones.
          </p>
        </div>
        <Link href="/companies/new" className="btn btn-primary">+ Add a company</Link>
      </div>

      <form className="card flex flex-wrap items-end gap-3" action="/companies">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Search</label>
          <input name="q" defaultValue={q} placeholder="company name…" className="input" />
        </div>
        <div>
          <label className="label">Sort by</label>
          <select name="sort" defaultValue={sort} className="select">
            <option value="top">Top rated</option>
            <option value="new">Newest</option>
            <option value="reviews">Most reviews</option>
            <option value="flagged">Most red flags</option>
          </select>
        </div>
        <div>
          <label className="label">Filter flag</label>
          <select name="flag" defaultValue={flag} className="select">
            <option value="">All</option>
            <option value="fake-ote">fake-ote</option>
            <option value="pay-to-play">pay-to-play</option>
            <option value="1099-misclassification">1099-misclassification</option>
            <option value="mlm">mlm</option>
            <option value="no-leads">no-leads</option>
            <option value="ghost-recruiter">ghost-recruiter</option>
          </select>
        </div>
        <button type="submit" className="btn btn-outline">Apply</button>
      </form>

      {enriched.length === 0 ? (
        <div className="card text-ink/60">No companies match. <Link href="/companies/new" className="underline">Add one →</Link></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enriched.map((c) => (
            <Link key={c.id} href={`/companies/${c.slug}`} className="card hover:shadow-md transition">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-ink/60">
                  {c.agg.count > 0 ? c.agg.overall.toFixed(1) : "—"}
                </div>
              </div>
              {c.agg.count > 0 && (
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <Stars value={c.agg.overall} />
                  <span className="text-ink/40">{c.agg.count} review{c.agg.count === 1 ? "" : "s"}</span>
                </div>
              )}
              {c.description && <p className="mt-2 line-clamp-2 text-sm text-ink/70">{c.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1">
                {tagsToArray(c.roleTypes).slice(0, 4).map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
                {c.flags.slice(0, 3).map((f) => (
                  <span key={f} className="tag-flag">⚠ {f}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
