import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { tagsToArray } from "@/lib/slug";

export const dynamic = "force-dynamic";

export default async function ScamAlertsPage() {
  const companies = await prisma.company.findMany();
  const flagged = companies
    .map((c) => ({ ...c, flags: tagsToArray(c.redFlags) }))
    .filter((c) => c.flags.length > 0)
    .sort((a, b) => b.flags.length - a.flags.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">⚠️ Scam alerts & red flags</h1>
        <p className="text-sm text-ink/60 mt-1">
          Companies the community has flagged for shady comp, misclassification, MLM-style ops, or other patterns
          you should know about before signing.
        </p>
      </div>

      <div className="card text-sm bg-amber-50/60 border-amber-300/60">
        <strong>How to read this:</strong> a flag is a community-submitted signal, not a court verdict.
        Cross-reference with the company's reviews and look for multiple independent reports. If you've worked
        somewhere flagged inaccurately, write a counter-review with specifics.
      </div>

      {flagged.length === 0 ? (
        <div className="card text-ink/60">No flagged companies yet. Quiet so far.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flagged.map((c) => (
            <Link key={c.id} href={`/companies/${c.slug}`} className="card border-flag/30 hover:shadow-md transition">
              <div className="font-semibold">{c.name}</div>
              {c.description && <p className="mt-1 text-sm text-ink/70 line-clamp-2">{c.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1">
                {c.flags.map((f) => (
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
