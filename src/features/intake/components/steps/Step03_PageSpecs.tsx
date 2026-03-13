import { useFieldArray, type UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { Input, Select, Button } from "@/components/ui";
import { PAGE_TYPE_OPTIONS } from "../../constants/formOptions";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

const pageTypeOptions = PAGE_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export function Step03_PageSpecs({ form, accent }: StepProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pages",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">
          Page Specifications
        </h2>
        <p className="mt-1 text-sm text-th-muted">
          List the pages your website needs.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-th-border bg-th-surface p-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px_1fr_40px] sm:items-end">
              <Input
                label="Page Name"
                register={register(`pages.${index}.name`)}
                error={errors.pages?.[index]?.name?.message}
                placeholder="e.g. Home"
              />

              <Select
                label="Type"
                options={pageTypeOptions}
                register={register(`pages.${index}.type`)}
                error={errors.pages?.[index]?.type?.message}
                placeholder="Select type"
              />

              <Input
                label="Purpose"
                register={register(`pages.${index}.purpose`)}
                error={errors.pages?.[index]?.purpose?.message}
                placeholder="Brief description of this page's goal"
              />

              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mb-0.5 flex h-[42px] w-[42px] items-center justify-center rounded border border-th-border text-th-muted transition-colors hover:border-[#FF453A]/30 hover:text-[#FF453A]"
                  aria-label={`Remove page ${index + 1}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {errors.pages?.root?.message && (
        <p className="text-[11px] text-[#FF453A]">{errors.pages.root.message}</p>
      )}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        accent={accent}
        onClick={() =>
          append({ name: "", type: "inner", purpose: "" })
        }
      >
        + Add Page
      </Button>
    </div>
  );
}
