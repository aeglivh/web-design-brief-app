import { Controller, type UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { Input, Select, Textarea, RadioGroup } from "@/components/ui";
import {
  CONTENT_READINESS_OPTIONS,
  SEO_OPTIONS,
} from "../../constants/formOptions";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

const CONTENT_CATEGORIES = [
  "Homepage copy",
  "About page",
  "Service descriptions",
  "Blog posts",
  "Testimonials",
  "Team bios",
  "FAQ",
  "Legal pages",
] as const;

const readinessOptions = CONTENT_READINESS_OPTIONS.map((o) => ({
  value: o,
  label: o,
}));

const seoOptions = SEO_OPTIONS.map((o) => ({ value: o, label: o }));

const domainOptions = [
  { value: "I own my domain", label: "I own my domain" },
  { value: "Need to purchase", label: "Need to purchase" },
  { value: "Not sure", label: "Not sure" },
];

const analyticsOptions = [
  { value: "Google Analytics set up", label: "Google Analytics set up" },
  { value: "No analytics yet", label: "No analytics yet" },
  { value: "Other analytics tool", label: "Other analytics tool" },
];

const googleBusinessOptions = [
  { value: "Yes, verified", label: "Yes, verified" },
  { value: "Yes, not verified", label: "Yes, not verified" },
  { value: "No", label: "No" },
  { value: "Not sure", label: "Not sure" },
];

const contentResponsibilityOptions = [
  { value: "client", label: "I'll provide all content" },
  { value: "designer", label: "Designer to write content" },
  { value: "shared", label: "Shared responsibility" },
];

export function Step04_ContentSeo({ form, accent }: StepProps) {
  const { register, control } = form;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">Content & SEO</h2>
        <p className="mt-1 text-sm text-th-muted">
          Tell us about your content readiness and SEO needs.
        </p>
      </div>

      {/* Content readiness matrix */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-1.5">
          Content Readiness
        </label>
        <div className="rounded-[10px] border border-th-border-light bg-th-surface p-3">
          {CONTENT_CATEGORIES.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between gap-3 py-1.5"
            >
              <span className="text-sm text-th-secondary">{category}</span>
              <Controller
                control={control}
                name="contentReadiness"
                render={({ field }) => (
                  <select
                    className="rounded-[10px] border border-th-border bg-th-surface px-2 py-1 text-xs text-th-secondary outline-none focus:border-th-border focus:ring-[3px] focus:ring-th-border-light"
                    value={(field.value ?? {})[category] ?? ""}
                    onChange={(e) => {
                      const updated = { ...(field.value ?? {}), [category]: e.target.value };
                      field.onChange(updated);
                    }}
                  >
                    <option value="">Select...</option>
                    {readinessOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content responsibility */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Content Responsibility
        </label>
        <Controller
          control={control}
          name="contentResponsibility"
          render={({ field }) => (
            <RadioGroup
              name="contentResponsibility"
              options={contentResponsibilityOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              accent={accent}
            />
          )}
        />
      </div>

      {/* Content deadline */}
      <div className="mb-5">
        <Input
          label="Content Delivery Deadline"
          type="date"
          register={register("contentDeadline")}
          hint="Optional"
        />
      </div>

      {/* Copywriting & Photography */}
      <div className="mb-5">
        <Textarea
          label="Copywriting Needs"
          register={register("copywritingNeeds")}
          placeholder="Describe any copywriting needs..."
          hint="Optional"
          rows={3}
        />
      </div>

      <div className="mb-5">
        <Textarea
          label="Photography Needs"
          register={register("photographyNeeds")}
          placeholder="Photography or video needs..."
          hint="Optional"
          rows={3}
        />
      </div>

      {/* SEO section */}
      <div>
        <h3 className="text-sm font-semibold text-th-secondary mb-3">SEO</h3>
      </div>

      <div className="mb-5">
        <Select
          label="Current SEO Status"
          options={seoOptions}
          register={register("currentSeo")}
          placeholder="Select..."
        />
      </div>

      <div className="mb-5">
        <Textarea
          label="SEO Goals"
          register={register("seoGoals")}
          placeholder="What are your SEO goals?"
          hint="Optional"
          rows={3}
        />
      </div>

      {/* Domain & Analytics */}
      <div>
        <h3 className="text-sm font-semibold text-th-secondary mb-3">
          Domain & Analytics
        </h3>
      </div>

      <div className="mb-5">
        <Select
          label="Domain Status"
          options={domainOptions}
          register={register("domainStatus")}
          placeholder="Select..."
        />
      </div>

      <div className="mb-5">
        <Select
          label="Analytics"
          options={analyticsOptions}
          register={register("analytics")}
          placeholder="Select..."
        />
      </div>

      <div className="mb-5">
        <Select
          label="Google Business Profile"
          options={googleBusinessOptions}
          register={register("googleBusiness")}
          placeholder="Select..."
        />
      </div>
    </div>
  );
}
