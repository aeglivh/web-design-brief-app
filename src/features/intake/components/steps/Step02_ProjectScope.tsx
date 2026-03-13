import type { UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { Textarea, Select, Chip, RadioGroup } from "@/components/ui";
import { FEATURE_OPTIONS, CMS_OPTIONS } from "../../constants/formOptions";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

const cmsOptions = CMS_OPTIONS.map((o) => ({ value: o, label: o }));

export function Step02_ProjectScope({ form, accent }: StepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const projectType = watch("projectType");
  const features = watch("features") ?? [];

  function toggleFeature(feature: string) {
    const next = features.includes(feature)
      ? features.filter((f) => f !== feature)
      : [...features, feature];
    setValue("features", next, { shouldValidate: true });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">Project Scope</h2>
        <p className="mt-1 text-sm text-th-muted">
          Define the type and scope of your project.
        </p>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Project Type
        </label>
        <RadioGroup
          name="projectType"
          options={[
            { value: "new", label: "Brand new website" },
            { value: "redesign", label: "Redesign existing site" },
          ]}
          value={projectType}
          onChange={(val) =>
            setValue("projectType", val as "new" | "redesign", {
              shouldValidate: true,
            })
          }
          accent={accent}
        />
        {errors.projectType?.message && (
          <p className="mt-1 text-[11px] text-[#FF453A]">
            {errors.projectType.message}
          </p>
        )}
      </div>

      {projectType === "redesign" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="rounded-[12px] border border-th-border-light bg-th-surface p-5">
          <Textarea
            label="Pain Points"
            register={register("painPoints")}
            error={errors.painPoints?.message}
            placeholder="What's not working with your current site?"
            rows={3}
          />

          <Textarea
            label="Content Migration"
            register={register("contentMigration")}
            error={errors.contentMigration?.message}
            placeholder="Any content that must be migrated?"
            rows={3}
          />
        </div>
      )}

      <div>
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Features
        </label>
        <div className="flex flex-wrap gap-2">
          {FEATURE_OPTIONS.map((feature) => (
            <Chip
              key={feature}
              label={feature}
              selected={features.includes(feature)}
              onClick={() => toggleFeature(feature)}
              accent={accent}
            />
          ))}
        </div>
        {errors.features?.message && (
          <p className="mt-1.5 text-[11px] text-[#FF453A]">
            {errors.features.message}
          </p>
        )}
      </div>

      <Select
        label="CMS Preference"
        options={cmsOptions}
        register={register("cmsPreference")}
        error={errors.cmsPreference?.message}
        placeholder="Select a CMS"
      />

      <Textarea
        label="Integrations"
        register={register("integrations")}
        error={errors.integrations?.message}
        placeholder="e.g., Mailchimp, Stripe, Google Maps..."
        rows={3}
      />
    </div>
  );
}
