import { Controller, type UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { Input, Textarea, Select } from "@/components/ui";
import { INDUSTRY_OPTIONS, GOAL_OPTIONS } from "../../constants/formOptions";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

const industryOptions = INDUSTRY_OPTIONS.map((o) => ({ value: o, label: o }));
const goalOptions = GOAL_OPTIONS.map((o) => ({ value: o, label: o }));

export function Step01_BusinessGoals({ form }: StepProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">
          Tell us about your business
        </h2>
        <p className="mt-1 text-sm text-th-muted">
          Help us understand your business and goals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Business Name"
          register={register("businessName")}
          error={errors.businessName?.message}
          placeholder="Acme Inc."
        />

        <Select
          label="Industry"
          options={industryOptions}
          register={register("industry")}
          error={errors.industry?.message}
          placeholder="Select an industry"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Contact Name"
          register={register("contactName")}
          error={errors.contactName?.message}
        />

        <Input
          label="Contact Email"
          type="email"
          register={register("contactEmail")}
          error={errors.contactEmail?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Contact Phone"
          type="tel"
          register={register("contactPhone")}
          error={errors.contactPhone?.message}
          hint="Optional"
        />

        <Input
          label="Current Website URL"
          register={register("currentUrl")}
          error={errors.currentUrl?.message}
          placeholder="https://..."
          hint="Optional"
        />
      </div>

      <Select
        label="Primary Goal"
        options={goalOptions}
        register={register("primaryGoal")}
        error={errors.primaryGoal?.message}
        placeholder="What is the main goal of your website?"
      />

      <Textarea
        label="Target Audience"
        register={register("targetAudience")}
        error={errors.targetAudience?.message}
        placeholder="Describe your ideal customer..."
        rows={3}
      />

      <Controller
        control={form.control}
        name="competitors"
        render={({ field }) => {
          const textValue = (field.value ?? [])
            .map((c) => (c.notes ? `${c.url} — ${c.notes}` : c.url))
            .join("\n");

          return (
            <Textarea
              label="Competitors"
              value={textValue}
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .filter((l) => l.trim() !== "");
                const parsed = lines.map((line) => {
                  const [url, ...rest] = line.split("—").map((s) => s.trim());
                  return { url: url || "", notes: rest.join("—").trim() };
                });
                field.onChange(parsed);
              }}
              onBlur={field.onBlur}
              error={errors.competitors?.message}
              placeholder="List competitor websites (one per line)"
              hint="Optionally add notes with — separator, e.g. https://example.com — clean design"
              rows={4}
            />
          );
        }}
      />
    </div>
  );
}
