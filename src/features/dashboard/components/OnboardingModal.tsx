import { useState } from "react";
import { Modal, Input, Button, Alert } from "@/components/ui";
import { toSlug } from "@/lib/utils";

interface OnboardingModalProps {
  onDone: (data: { studio_name: string; slug: string }) => void;
  onCreate: (studioName: string, slug: string) => Promise<unknown>;
}

export function OnboardingModal({ onDone, onCreate }: OnboardingModalProps) {
  const [studioName, setStudioName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudioName(e.target.value);
    setSlug(toSlug(e.target.value));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await onCreate(studioName, slug);
      onDone(data as { studio_name: string; slug: string });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
    setSaving(false);
  };

  return (
    <Modal open onClose={() => {}} size="sm">
      <div
        className="px-8 py-10 rounded-[24px]"
        style={{
          background: "linear-gradient(135deg, var(--th-surface-hover) 0%, var(--th-surface) 100%)",
        }}
      >
        <div className="w-8 h-8 rounded-lg bg-th-surface-hover flex items-center justify-center mb-5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-th-text">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <h2 className="text-[18px] font-medium text-th-text tracking-[-0.02em] mb-1">
          Set up your studio
        </h2>
        <p className="text-[13px] text-th-muted leading-relaxed mb-7">
          This creates your branded client form at{" "}
          <span className="text-th-secondary font-medium font-mono text-[12px]">
            yoursite.com/studio/your-slug
          </span>
        </p>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Studio name"
            type="text"
            required
            value={studioName}
            onChange={handleNameChange}
            placeholder="Pixel Studio"
          />
          <Input
            label="URL slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="pixel-studio"
            hint="Lowercase letters, numbers, hyphens. 2-60 characters."
          />
          <div className="pt-1">
            <Button type="submit" fullWidth loading={saving}>
              Get started
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
