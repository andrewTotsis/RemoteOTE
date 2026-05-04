import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { aggregate } from "@/lib/ratings";
import { Stars } from "@/components/Stars";
import { tagsToArray } from "@/lib/slug";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [companies, recentReviews, recentThreads, totalReviews, totalCompanies] = await Promise.all([
    prisma.company.findMany({ take: 24, include: { reviews: true } }),
    prisma.review.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { company: true, user: { select: { displayName: true } } },
    }),
    prisma.thread.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { company: true, user: { select: { displayName: true } }, _count: { select: { posts: true } } },
    }),
    prisma.review.count(),
    prisma.company.count(),
  ]);

  const ranked = companies
    .map((c) => ({ ...c, agg: aggregate(c.reviews) }))
    .filter((c) => c.agg.count > 0)
    .sort((a, b) => b.agg.overall - a.agg.overall);

  const topRated = ranked.slice(0, 4);
  const flagged = companies
    .map((c) => ({ ...c, flags: tagsToArray(c.redFlags) }))
    .filter((c) => c.flags.length > 0)
    .slice(0, 4);

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-ink text-bone p-8 md:p-12">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-bone/60">RepVue × Yelp, for remote sales</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-semibold leading-tight">
            Stop wasting quarters on shady remote sales jobs.
          </h1>
          <p className="mt-4 text-bone/80 text-lg max-w-2xl">
            Real reviews from real reps. OTE accuracy, lead quality, comp model, scam flags — and a forum
            where you can ask before you sign. No HR-curated PR. No "we're like a family" nonsense.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/companies" className="btn btn-accent">Browse companies</Link>
            <Link href="/forum" className="btn btn-outline border-bone/30 text-bone hover:bg-bone/10">Open the forum</Link>
            <Link href="/signup" className="btn btn-outline border-bone/30 text-bone hover:bg-bone/10">Write a review</Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-bone/70">
            <span><strong className="text-bone">{totalCompanies}</strong> companies tracked</span>
            <span><strong className="text-bone">{totalReviews}</strong> reviews submitted</span>
            <span><strong className="text-bone">100%</strong> reps, 0% recruiters</span>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Top-rated remote sales orgs</h2>
          <Link href="/companies" className="text-sm hover:underline">All companies →</Link>
        </div>
        {topRated.length === 0 ? (
          <div className="card text-ink/60">No reviews yet. <Link href="/companies/new" className="underline">Add the first company →</Link></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {topRated.map((c) => (
              <Link key={c.id} href={`/companies/${c.slug}`} className="card hover:shadow-md transition">
                <div className="font-semibold">{c.name}</div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <Stars value={c.agg.overall} />
                  <span className="text-ink/60">{c.agg.overall.toFixed(1)}</span>
                  <span className="text-ink/40">· {c.agg.count} review{c.agg.count === 1 ? "" : "s"}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-ink/70">{c.description || "No description yet."}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {tagsToArray(c.roleTypes).slice(0, 3).map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent reviews</h2>
            <Link href="/companies" className="text-sm hover:underline">More →</Link>
          </div>
          <div className="space-y-3">
            {recentReviews.length === 0 ? (
              <div className="card text-ink/60">No reviews yet.</div>
            ) : (
              recentReviews.map((r) => (
                <Link key={r.id} href={`/companies/${r.company.slug}#review-${r.id}`} className="card block hover:shadow-md transition">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-semibold">{r.title}</div>
                    <Stars value={(r.ratingPay + r.ratingLeads + r.ratingMgmt + r.ratingLegit + r.ratingCulture) / 5} />
                  </div>
                  <div className="text-xs text-ink/50 mt-0.5">
                    {r.company.name} · {r.isAnonymous ? "anonymous rep" : r.user.displayName}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-ink/80">{r.body}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold">Forum — what reps are talking about</h2>
            <Link href="/forum" className="text-sm hover:underline">All threads →</Link>
          </div>
          <div className="space-y-3">
            {recentThreads.length === 0 ? (
              <div className="card text-ink/60">No threads yet. <Link href="/forum/new" className="underline">Start one →</Link></div>
            ) : (
              recentThreads.map((t) => (
                <Link key={t.id} href={`/forum/${t.id}`} className="card block hover:shadow-md transition">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-ink/50 mt-0.5">
                    {t.company ? `re: ${t.company.name} · ` : ""}{t.user.displayName} · {t._count.posts} repl{t._count.posts === 1 ? "y" : "ies"}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-ink/80">{t.body}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {flagged.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold">⚠️ Companies with red-flag reports</h2>
            <Link href="/scam-alerts" className="text-sm hover:underline">All scam alerts →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {flagged.map((c) => (
              <Link key={c.id} href={`/companies/${c.slug}`} className="card border-flag/30 hover:shadow-md transition">
                <div className="font-semibold">{c.name}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.flags.map((f) => (
                    <span key={f} className="tag-flag">{f}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
