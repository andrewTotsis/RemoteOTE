import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const threads = await prisma.thread.findMany({
    where: q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { company: true, user: { select: { displayName: true } }, _count: { select: { posts: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Forum</h1>
          <p className="text-sm text-ink/60 mt-1">
            Ask before you sign. Vent after you quit. Help the next rep dodge the trap.
          </p>
        </div>
        <Link href="/forum/new" className="btn btn-primary">+ New thread</Link>
      </div>

      <form className="card flex gap-3" action="/forum">
        <input name="q" defaultValue={q} placeholder="search threads…" className="input flex-1" />
        <button className="btn btn-outline">Search</button>
      </form>

      {threads.length === 0 ? (
        <div className="card text-ink/60">No threads yet. <Link href="/forum/new" className="underline">Start one →</Link></div>
      ) : (
        <div className="space-y-3">
          {threads.map((t) => (
            <Link key={t.id} href={`/forum/${t.id}`} className="card block hover:shadow-md transition">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-ink/50">{new Date(t.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-xs text-ink/50 mt-0.5">
                {t.company ? <>re: <span className="text-ink/70">{t.company.name}</span> · </> : ""}
                {t.user.displayName} · {t._count.posts} repl{t._count.posts === 1 ? "y" : "ies"}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-ink/80">{t.body}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
