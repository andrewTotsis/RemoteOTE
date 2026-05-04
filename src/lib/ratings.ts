import type { Review } from "@prisma/client";

export function reviewAvg(r: Pick<Review, "ratingPay" | "ratingLeads" | "ratingMgmt" | "ratingLegit" | "ratingCulture">) {
  return (r.ratingPay + r.ratingLeads + r.ratingMgmt + r.ratingLegit + r.ratingCulture) / 5;
}

export function aggregate(reviews: Array<Pick<Review, "ratingPay" | "ratingLeads" | "ratingMgmt" | "ratingLegit" | "ratingCulture">>) {
  if (reviews.length === 0) {
    return { count: 0, overall: 0, pay: 0, leads: 0, mgmt: 0, legit: 0, culture: 0 };
  }
  const sum = reviews.reduce(
    (a, r) => ({
      pay: a.pay + r.ratingPay,
      leads: a.leads + r.ratingLeads,
      mgmt: a.mgmt + r.ratingMgmt,
      legit: a.legit + r.ratingLegit,
      culture: a.culture + r.ratingCulture,
    }),
    { pay: 0, leads: 0, mgmt: 0, legit: 0, culture: 0 },
  );
  const n = reviews.length;
  const pay = sum.pay / n;
  const leads = sum.leads / n;
  const mgmt = sum.mgmt / n;
  const legit = sum.legit / n;
  const culture = sum.culture / n;
  const overall = (pay + leads + mgmt + legit + culture) / 5;
  return { count: n, overall, pay, leads, mgmt, legit, culture };
}
