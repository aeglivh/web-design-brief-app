import { parseBrief } from "../lib/parseBrief";
import { TagsSection } from "./TagsSection";
import type { BriefTags } from "@/lib/types";

interface BriefDisplayProps {
  brief: string;
  tags?: BriefTags | null;
  accent?: string;
}

export function BriefDisplay({ brief, tags, accent }: BriefDisplayProps) {
  const acc = accent || "#3b82f6";
  const sections = parseBrief(brief);

  return (
    <div>
      {sections.length === 0 && brief && (
        <pre className="text-sm leading-[1.9] text-th-secondary whitespace-pre-wrap break-words m-0">
          {brief}
        </pre>
      )}

      {sections.map((sec, i) => (
        <div key={i} className="mb-7">
          <div
            className="text-[15px] font-semibold text-white py-1.5 px-3.5 mb-3.5 rounded-sm"
            style={{ backgroundColor: acc }}
          >
            {sec.heading}
          </div>
          {sec.bullets.length > 0 && (
            <ul className="m-0 pl-5 list-none">
              {sec.bullets.map((b, j) => (
                <li
                  key={j}
                  className="text-sm leading-[1.8] text-th-secondary mb-1.5 pl-2 relative"
                >
                  <span
                    className="absolute -left-3 font-semibold"
                    style={{ color: acc }}
                  >
                    &bull;
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {sec.paragraphs.map((p, j) => (
            <p key={j} className="text-sm leading-[1.8] text-th-secondary mb-2.5">
              {p}
            </p>
          ))}
        </div>
      ))}

      <TagsSection tags={tags} accent={acc} />
    </div>
  );
}
