import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

async function reply(formData: FormData) {
  "use server";
  const user = await requireUser();
  const threadId = String(formData.get("threadId") || "");
  if (!user) redirect(`/login`);
  const body = String(formData.get("body") || "").trim();
  if (!body || !threadId) redirect(`/forum/${threadId}`);
  await prisma.post.create({ data: { threadId, userId: user.id, body } });
  redirect(`/forum/${threadId}`);
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await prisma.thread.findUnique({
    where: { id },
    include: {
      user: { select: { displayName: true } },
      company: true,
      posts: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { displayName: true } } },
      },
    },
  });
  if (!t) notFound();
  const session = await getSession();
  const loggedIn = !!session.userId;

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/forum" className="hover:underline">← Forum</Link>
        {t.company && (
          <>
            {" · "}
            <Link href={`/companies/${t.company.slug}`} className="hover:underline">
              {t.company.name}
            </Link>
          </>
        )}
      </div>

      <div className="card">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <div className="text-xs text-ink/50 mt-1">
          {t.user.displayName} · {new Date(t.createdAt).toLocaleString()}
        </div>
        <p className="prose-body mt-4">{t.body}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">{t.posts.length} repl{t.posts.length === 1 ? "y" : "ies"}</h2>
        <div className="space-y-3">
          {t.posts.map((p) => (
            <div key={p.id} className="card">
              <div className="text-xs text-ink/50">
                {p.user.displayName} · {new Date(p.createdAt).toLocaleString()}
              </div>
              <p className="prose-body mt-2">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {loggedIn ? (
        <form action={reply} className="card space-y-3">
          <input type="hidden" name="threadId" value={t.id} />
          <label className="label">Your reply</label>
          <textarea name="body" required rows={5} className="textarea" placeholder="Add to the conversation…"></textarea>
          <button type="submit" className="btn btn-primary">Post reply</button>
        </form>
      ) : (
        <div className="card text-sm">
          <Link href="/login" className="underline">Sign in</Link> to reply.
        </div>
      )}
    </div>
  );
}
