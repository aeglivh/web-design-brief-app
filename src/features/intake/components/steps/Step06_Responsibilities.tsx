import { Controller, type UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { Chip, RadioGroup } from "@/components/ui";
import {
  HOSTING_OPTIONS,
  DOMAIN_OPTIONS,
  ACCESSIBILITY_OPTIONS,
} from "../../constants/formOptions";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

const hostingOptions = HOSTING_OPTIONS.map((o) => ({ value: o, label: o }));
const domainOptions = DOMAIN_OPTIONS.map((o) => ({ value: o, label: o }));
const accessibilityOptions = ACCESSIBILITY_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

const THIRD_PARTY_OPTIONS = [
  "Google Analytics",
  "Google Search Console",
  "Social media accounts",
  "Payment gateway",
  "Email service",
  "CRM",
  "Other",
] as const;

const legalPagesOptions = [
  { value: "client", label: "I'll provide legal pages" },
  { value: "designer", label: "Designer to create" },
  { value: "not_needed", label: "Not needed" },
];

export function Step06_Responsibilities({ form, accent }: StepProps) {
  const { control, watch, setValue } = form;

  const thirdPartyAccess = watch("thirdPartyAccess") ?? [];

  const toggleThirdParty = (item: string) => {
    const next = thirdPartyAccess.includes(item)
      ? thirdPartyAccess.filter((v) => v !== item)
      : [...thirdPartyAccess, item];
    setValue("thirdPartyAccess", next, { shouldDirty: true });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">
          Responsibilities & Access
        </h2>
        <p className="mt-1 text-sm text-th-muted">
          Clarify who handles what.
        </p>
      </div>

      {/* Hosting responsibility */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Hosting
        </label>
        <Controller
          control={control}
          name="hostingResponsibility"
          render={({ field }) => (
            <RadioGroup
              name="hostingResponsibility"
              options={hostingOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              direction="column"
              accent={accent}
            />
          )}
        />
      </div>

      {/* Domain responsibility */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Domain
        </label>
        <Controller
          control={control}
          name="domainResponsibility"
          render={({ field }) => (
            <RadioGroup
              name="domainResponsibility"
              options={domainOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              direction="column"
              accent={accent}
            />
          )}
        />
      </div>

      {/* Third party access */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Third-Party Access Needed
        </label>
        <div className="flex flex-wrap gap-2">
          {THIRD_PARTY_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              label={opt}
              selected={thirdPartyAccess.includes(opt)}
              onClick={() => toggleThirdParty(opt)}
              accent={accent}
            />
          ))}
        </div>
      </div>

      {/* Legal pages */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Legal Pages
        </label>
        <Controller
          control={control}
          name="legalPagesResponsibility"
          render={({ field }) => (
            <RadioGroup
              name="legalPagesResponsibility"
              options={legalPagesOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              accent={accent}
            />
          )}
        />
      </div>

      {/* Accessibility */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Accessibility Level
        </label>
        <Controller
          control={control}
          name="accessibilityLevel"
          render={({ field }) => (
            <RadioGroup
              name="accessibilityLevel"
              options={accessibilityOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              direction="column"
              accent={accent}
            />
          )}
        />
      </div>
    </div>
  );
}
