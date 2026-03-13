import type { UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { RadioGroup, Select, Textarea } from "@/components/ui";
import {
  BUDGET_OPTIONS,
  CURRENCY_OPTIONS,
  REFERRAL_OPTIONS,
} from "../../constants/formOptions";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

const budgetOptions = BUDGET_OPTIONS.map((o) => ({ value: o, label: o }));
const referralOptions = REFERRAL_OPTIONS.map((o) => ({ value: o, label: o }));

export function Step08_Budget({ form, accent }: StepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const budgetRange = watch("budgetRange") ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">
          Budget & Final Details
        </h2>
        <p className="mt-1 text-sm text-th-muted">
          Help us understand your budget and how you found us.
        </p>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Budget Range
        </label>
        <RadioGroup
          name="budgetRange"
          options={budgetOptions}
          value={budgetRange}
          onChange={(val) =>
            setValue("budgetRange", val, { shouldValidate: true })
          }
          direction="column"
          accent={accent}
        />
        {errors.budgetRange?.message && (
          <p className="mt-1 text-[11px] text-[#FF453A]">
            {errors.budgetRange.message}
          </p>
        )}
      </div>

      <Select
        label="Currency"
        options={[...CURRENCY_OPTIONS]}
        register={register("budgetCurrency")}
        error={errors.budgetCurrency?.message}
        placeholder="Select currency"
      />

      <Select
        label="How did you find us?"
        options={referralOptions}
        register={register("referralSource")}
        error={errors.referralSource?.message}
        placeholder="Select an option"
      />

      <Textarea
        label="Anything else you'd like us to know?"
        register={register("additionalComments")}
        error={errors.additionalComments?.message}
        rows={4}
      />
    </div>
  );
}
