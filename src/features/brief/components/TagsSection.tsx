import type { BriefTags } from "@/lib/types";

interface TagsSectionProps {
  tags?: BriefTags | null;
  accent?: string;
}

export function TagsSection({ tags, accent }: TagsSectionProps) {
  if (!tags) return null;
  const acc = accent || "#3b82f6";
  const hasTech = (tags.techStack?.length ?? 0) > 0;
  const hasKeys = (tags.keywords?.length ?? 0) > 0;
  if (!hasTech && !hasKeys) return null;

  return (
    <div className="mb-7">
      <div className="border-t-[1.5px] border-th-border-light my-2 mb-5" />
      {hasKeys && (
        <div className="flex gap-3.5 mb-2.5">
          {tags.keywords.map((k, i) => (
            <span
              key={i}
              className="text-[13px] font-medium text-th-text"
              style={{ color: acc }}
            >
              {k}
            </span>
          ))}
        </div>
      )}
      {hasTech && (
        <div className="flex flex-wrap gap-2">
          {tags.techStack.map((t, i) => (
            <span
              key={i}
              className="bg-th-surface-hover text-th-secondary rounded-md px-3 py-1 text-xs"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
