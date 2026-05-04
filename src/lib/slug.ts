export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function tagsToArray(s: string | null | undefined): string[] {
  if (!s) return [];
  return s.split("|").map((t) => t.trim()).filter(Boolean);
}

export function arrayToTags(arr: string[]): string {
  return arr.map((t) => t.trim()).filter(Boolean).join("|");
}
