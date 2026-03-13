export interface BriefSection {
  heading: string;
  bullets: string[];
  paragraphs: string[];
}

const SECTION_HEADS = [
  "project overview",
  "design direction",
  "sitemap",
  "content status",
  "seo assessment",
  "technical scope",
  "designer notes",
  "responsibilities",
  "process",
  "risk flags",
];

function isHead(line: string): boolean {
  if (/^\d+[\.\:\)]\s+\S/.test(line)) return true;
  const lower = line.toLowerCase();
  return SECTION_HEADS.some((h) => lower.startsWith(h));
}

export function parseBrief(raw: string): BriefSection[] {
  if (!raw) return [];
  const text = raw
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#+\s*/gm, "");
  const lines = text.split("\n");
  const sections: BriefSection[] = [];
  let cur: BriefSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isHead(line)) {
      if (cur) sections.push(cur);
      cur = { heading: line, bullets: [], paragraphs: [] };
    } else if (cur) {
      if (/^[-•]\s/.test(line)) {
        cur.bullets.push(line.replace(/^[-•]\s*/, ""));
      } else {
        cur.paragraphs.push(line);
      }
    }
  }
  if (cur) sections.push(cur);
  return sections;
}
