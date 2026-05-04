import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = await Promise.all(
    [
      { email: "andy@example.com", displayName: "ClosingAndy" },
      { email: "sam@example.com", displayName: "QuotaCarrier" },
      { email: "lin@example.com", displayName: "PipelineLin" },
    ].map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, passwordHash },
      }),
    ),
  );

  const companiesData = [
    {
      slug: "clearwave-saas",
      name: "Clearwave SaaS",
      website: "https://example.com/clearwave",
      description: "Mid-market SaaS hiring remote AEs and SDRs across NA. Inbound + outbound mix.",
      remotePolicy: "remote",
      roleTypes: "SDR|AE|AM",
      compModel: "base+commission|W2",
      redFlags: "",
    },
    {
      slug: "summitline-360",
      name: "SummitLine 360",
      website: "https://example.com/summitline",
      description: "Final-expense and life-insurance shop pushing remote 1099 'sales agents'. Recruits hard on LinkedIn.",
      remotePolicy: "remote",
      roleTypes: "Inside Sales",
      compModel: "100% commission|1099 contractor|MLM-style",
      redFlags: "fake-ote|pay-to-play|1099-misclassification|mlm",
    },
    {
      slug: "northgate-ai",
      name: "Northgate AI",
      website: "https://example.com/northgate",
      description: "Series B AI vertical-SaaS, hiring remote AEs and CSMs. Real product, real reps closing.",
      remotePolicy: "remote",
      roleTypes: "AE|CSM|Sales Manager",
      compModel: "base+commission|W2",
      redFlags: "",
    },
    {
      slug: "vendora-marketplace",
      name: "Vendora Marketplace",
      website: "https://example.com/vendora",
      description: "B2B marketplace hiring remote BDRs. Lead flow has been inconsistent post-restructure.",
      remotePolicy: "remote",
      roleTypes: "BDR|SDR",
      compModel: "base+commission|W2",
      redFlags: "no-leads",
    },
    {
      slug: "globepoint-academy",
      name: "Globepoint Academy",
      website: "https://example.com/globepoint",
      description: "Online 'sales bootcamp' that doubles as a recruiter for affiliated MLM-style ops.",
      remotePolicy: "remote",
      roleTypes: "SDR|Inside Sales",
      compModel: "100% commission|MLM-style",
      redFlags: "pay-to-play|unpaid-training|mlm|ghost-recruiter",
    },
    {
      slug: "harborbase-cloud",
      name: "Harborbase Cloud",
      website: "https://example.com/harborbase",
      description: "Late-stage cloud-infra company, fully remote, methodical comp plans.",
      remotePolicy: "remote",
      roleTypes: "AE|AM|Sales Manager",
      compModel: "base+commission|W2",
      redFlags: "",
    },
  ];

  const companies = await Promise.all(
    companiesData.map((c) =>
      prisma.company.upsert({ where: { slug: c.slug }, update: c, create: c }),
    ),
  );
  const bySlug = Object.fromEntries(companies.map((c) => [c.slug, c]));

  const reviews: Array<{
    userIdx: number; slug: string; title: string; body: string;
    pay: number; leads: number; mgmt: number; legit: number; culture: number;
    anon?: boolean;
  }> = [
    { userIdx: 0, slug: "clearwave-saas", title: "Honest mid-market SaaS gig", pay: 4, leads: 4, mgmt: 4, legit: 5, culture: 4,
      body: "OTE was $140k ($70k base / $70k variable) and reps actually hit it. Inbound flow is real, outbound expectations are reasonable. Manager runs 1:1s like a pro." },
    { userIdx: 1, slug: "clearwave-saas", title: "Solid but quotas creeping up", pay: 3, leads: 4, mgmt: 4, legit: 5, culture: 4,
      body: "Comp is accurate but quota was raised 20% mid-year without lead-gen support catching up. Still W2, still legit, still better than 90% of remote SaaS." },
    { userIdx: 2, slug: "summitline-360", title: "Classic insurance-MLM trap", pay: 1, leads: 1, mgmt: 1, legit: 1, culture: 1,
      body: "100% commission 1099. They pressure you to buy 'leads' from their preferred vendor and recruit other reps for overrides. Quit after 6 weeks at -$400 net. Avoid." },
    { userIdx: 0, slug: "summitline-360", title: "If they ask you to pay for leads, run", pay: 1, leads: 1, mgmt: 2, legit: 1, culture: 2,
      body: "Posted as 'remote sales' but it's a downline play. The OTE numbers in the JD are top-1% earners; median rep makes nothing." },
    { userIdx: 1, slug: "northgate-ai", title: "Best remote AE seat I've had", pay: 5, leads: 4, mgmt: 5, legit: 5, culture: 5,
      body: "Real product, technical buyers, comp plan in writing and accurate. Manager protects the team. President's club is real." },
    { userIdx: 2, slug: "vendora-marketplace", title: "Lead pipe is bone dry", pay: 3, leads: 1, mgmt: 3, legit: 4, culture: 3,
      body: "Good comp on paper, base is fine. Problem is there's no inbound and outbound territories overlap. Hard to hit OTE without massive grind." },
    { userIdx: 0, slug: "globepoint-academy", title: "Sales 'bootcamp' is a feeder for MLMs", pay: 1, leads: 1, mgmt: 1, legit: 1, culture: 1,
      body: "Charged $500 'training fee', then placed me with a sketchy 1099 100%-comm shop. Got my money back via chargeback. Don't pay to interview." },
    { userIdx: 1, slug: "harborbase-cloud", title: "Adult environment, real money", pay: 5, leads: 4, mgmt: 5, legit: 5, culture: 4,
      body: "Enterprise cycles are long but comp accelerators are honest and management has been there a while. Genuinely remote — not 'remote until we change our minds'." },
  ];

  for (const r of reviews) {
    const existing = await prisma.review.findFirst({
      where: { userId: users[r.userIdx].id, companyId: bySlug[r.slug].id, title: r.title },
    });
    if (existing) continue;
    await prisma.review.create({
      data: {
        userId: users[r.userIdx].id,
        companyId: bySlug[r.slug].id,
        title: r.title,
        body: r.body,
        ratingPay: r.pay, ratingLeads: r.leads, ratingMgmt: r.mgmt, ratingLegit: r.legit, ratingCulture: r.culture,
        isAnonymous: r.anon ?? true,
      },
    });
  }

  const threadsData: Array<{ userIdx: number; slug?: string; title: string; body: string; replies: Array<{ userIdx: number; body: string }> }> = [
    {
      userIdx: 0,
      title: "How are you vetting comp plans before signing in 2026?",
      body: "Tired of OTE numbers that don't reflect anyone's W2. What questions are you asking recruiters now to filter?",
      replies: [
        { userIdx: 1, body: "Always ask: what % of reps hit OTE last quarter? If they dodge, I'm out." },
        { userIdx: 2, body: "I ask for top, median, and bottom-quartile W2 from last year. Nobody legit refuses." },
      ],
    },
    {
      userIdx: 2,
      slug: "summitline-360",
      title: "SummitLine recruiter just messaged me — anyone else?",
      body: "Got a LinkedIn DM about a 'remote sales agent' role at SummitLine 360. Vibe is off. Anyone here actually worked there?",
      replies: [
        { userIdx: 0, body: "Yeah see my review. Run." },
      ],
    },
    {
      userIdx: 1,
      slug: "northgate-ai",
      title: "Northgate AI interview — what to expect?",
      body: "Loop next week, AE role. Anyone been through it recently?",
      replies: [
        { userIdx: 2, body: "Mock discovery + a panel with the VP. They actually grade you on the framework, not vibes." },
      ],
    },
  ];

  for (const t of threadsData) {
    const existing = await prisma.thread.findFirst({
      where: { userId: users[t.userIdx].id, title: t.title },
    });
    if (existing) continue;
    const thread = await prisma.thread.create({
      data: {
        userId: users[t.userIdx].id,
        title: t.title,
        body: t.body,
        companyId: t.slug ? bySlug[t.slug].id : null,
      },
    });
    for (const r of t.replies) {
      await prisma.post.create({
        data: { threadId: thread.id, userId: users[r.userIdx].id, body: r.body },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
