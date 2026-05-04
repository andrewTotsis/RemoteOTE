import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { aggregate, reviewAvg } from "@/lib/ratings";
import { Stars } from "@/components/Stars";
import { tagsToArray } from "@/lib/slug";

export const dynamic = "force-dynamic";

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { displayName: true } } },
      },
      threads: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { displayName: true } }, _count: { select: { posts: true } } },
      },
    },
  });
  if (!company) notFound();

  const agg = aggregate(company.reviews);
  const flags = tagsToArray(company.redFlags);
  const roles = tagsToArray(company.roleTypes);
  const comp = tagsToArray(company.compModel);

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer noopener" className="text-sm text-ink/60 hover:underline">
                {company.website.replace(/^https?:\/\//, "")} ↗
              </a>
            )}
            {company.description && <p className="mt-2 text-ink/80">{company.description}</p>}
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="tag">remote: {company.remotePolicy}</span>
              {roles.map((r) => <span key={r} className="tag">{r}</span>)}
              {comp.map((c) => <span key={c} className="tag">{c}</span>)}
              {flags.map((f) => <span key={f} className="tag-flag">⚠ {f}</span>)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-semibold">{agg.count > 0 ? agg.overall.toFixed(1) : "—"}</div>
            <Stars value={agg.overall} />
            <div className="text-xs text-ink/60 mt-1">{agg.count} review{agg.count === 1 ? "" : "s"}</div>
            <Link href={`/reviews/new?company=${company.slug}`} className="btn btn-accent mt-3">+ Write a review</Link>
          </div>
        </div>

        {agg.count > 0 && (
          <div className="mt-6 grid gap-3 md:grid-cols-5 text-sm">
            {[
              ["Pay accuracy", agg.pay],
              ["Lead quality", agg.leads],
              ["Management", agg.mgmt],
              ["Legitimacy", agg.legit],
              ["Culture", agg.culture],
            ].map(([label, val]) => (
              <div key={label as string} className="rounded-lg border border-ink/10 p-3">
                <div className="text-ink/60">{label as string}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Stars value={val as number} />
                  <span className="text-ink/70">{(val as number).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Reviews</h2>
          <Link href={`/reviews/new?company=${company.slug}`} className="text-sm hover:underline">+ Add yours</Link>
        </div>
        {company.reviews.length === 0 ? (
          <div className="card text-ink/60">
            No reviews yet. <Link href={`/reviews/new?company=${company.slug}`} className="underline">Be the first.</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {company.reviews.map((r) => (
              <div key={r.id} id={`review-${r.id}`} className="card">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{r.title}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Stars value={reviewAvg(r)} />
                    <span className="text-ink/60">{reviewAvg(r).toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-xs text-ink/50 mt-0.5">
                  {r.isAnonymous ? "anonymous rep" : r.user.displayName} · {new Date(r.createdAt).toLocaleDateString()}
                </div>
                <p className="prose-body mt-3">{r.body}</p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-ink/70">
                  <div>Pay: <Stars value={r.ratingPay} /></div>
                  <div>Leads: <Stars value={r.ratingLeads} /></div>
                  <div>Mgmt: <Stars value={r.ratingMgmt} /></div>
                  <div>Legit: <Stars value={r.ratingLegit} /></div>
                  <div>Culture: <Stars value={r.ratingCulture} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Discussion</h2>
          <Link href={`/forum/new?company=${company.slug}`} className="text-sm hover:underline">+ Start a thread</Link>
        </div>
        {company.threads.length === 0 ? (
          <div className="card text-ink/60">
            No threads about {company.name} yet. <Link href={`/forum/new?company=${company.slug}`} className="underline">Start one →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {company.threads.map((t) => (
              <Link key={t.id} href={`/forum/${t.id}`} className="card block hover:shadow-md transition">
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-ink/50 mt-0.5">
                  {t.user.displayName} · {t._count.posts} repl{t._count.posts === 1 ? "y" : "ies"} · {new Date(t.createdAt).toLocaleDateString()}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-ink/80">{t.body}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
