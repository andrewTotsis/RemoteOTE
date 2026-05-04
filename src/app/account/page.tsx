import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Stars } from "@/components/Stars";
import { reviewAvg } from "@/lib/ratings";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const [reviews, threads] = await Promise.all([
    prisma.review.findMany({
      where: { userId: user.id },
      include: { company: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.thread.findMany({
      where: { userId: user.id },
      include: { company: true, _count: { select: { posts: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hi, {user.displayName}</h1>
        <p className="text-sm text-ink/60">{user.email}</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Your reviews</h2>
        {reviews.length === 0 ? (
          <div className="card text-ink/60">You haven't written a review yet. <Link href="/companies" className="underline">Pick a company →</Link></div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Link key={r.id} href={`/companies/${r.company.slug}#review-${r.id}`} className="card block hover:shadow-md transition">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-semibold">{r.title}</div>
                  <Stars value={reviewAvg(r)} />
                </div>
                <div className="text-xs text-ink/50">{r.company.name} · {new Date(r.createdAt).toLocaleDateString()}{r.isAnonymous ? " · anonymous" : ""}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Your forum threads</h2>
        {threads.length === 0 ? (
          <div className="card text-ink/60">You haven't started a thread yet.</div>
        ) : (
          <div className="space-y-3">
            {threads.map((t) => (
              <Link key={t.id} href={`/forum/${t.id}`} className="card block hover:shadow-md transition">
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-ink/50">
                  {t.company ? `re: ${t.company.name} · ` : ""}{t._count.posts} repl{t._count.posts === 1 ? "y" : "ies"} · {new Date(t.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
