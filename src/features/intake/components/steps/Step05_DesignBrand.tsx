import { Controller, type UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { Chip, Textarea, FileUpload } from "@/components/ui";
import {
  VISUAL_STYLE_OPTIONS,
  TONE_OPTIONS,
} from "../../constants/formOptions";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

export function Step05_DesignBrand({ form, accent }: StepProps) {
  const { register, control, watch, setValue } = form;

  const visualStyles = watch("visualStyles") ?? [];
  const toneOfVoice = watch("toneOfVoice") ?? [];

  const toggleArrayItem = (
    field: "visualStyles" | "toneOfVoice",
    current: string[],
    item: string
  ) => {
    const next = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];
    setValue(field, next, { shouldDirty: true });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">Design & Brand</h2>
        <p className="mt-1 text-sm text-th-muted">
          Share your design preferences and brand identity.
        </p>
      </div>

      {/* Visual styles */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Visual Style
        </label>
        <div className="flex flex-wrap gap-2">
          {VISUAL_STYLE_OPTIONS.map((style) => (
            <Chip
              key={style}
              label={style}
              selected={visualStyles.includes(style)}
              onClick={() => toggleArrayItem("visualStyles", visualStyles, style)}
              accent={accent}
            />
          ))}
        </div>
      </div>

      {/* Tone of voice */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Tone of Voice
        </label>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((tone) => (
            <Chip
              key={tone}
              label={tone}
              selected={toneOfVoice.includes(tone)}
              onClick={() => toggleArrayItem("toneOfVoice", toneOfVoice, tone)}
              accent={accent}
            />
          ))}
        </div>
      </div>

      {/* Reference sites */}
      <Controller
        control={control}
        name="referenceSites"
        render={({ field }) => {
          const textValue = (field.value ?? [])
            .map((s) => (s.notes ? `${s.url} — ${s.notes}` : s.url))
            .join("\n");

          return (
            <Textarea
              label="Reference Sites"
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
              placeholder="List reference websites (one per line)"
              hint="Optionally add notes with — separator, e.g. https://example.com — love the layout"
              rows={4}
            />
          );
        }}
      />

      {/* Brand assets */}
      <div className="mb-5">
        <Textarea
          label="Brand Assets"
          register={register("brandAssets")}
          placeholder="Describe existing brand assets (logos, color palette, brand guidelines, etc.)"
          rows={3}
        />
      </div>

      {/* File uploads */}
      <Controller
        control={control}
        name="uploads"
        render={({ field }) => (
          <FileUpload
            label="Upload Files"
            files={field.value ?? []}
            onFilesChange={field.onChange}
            maxFiles={5}
          />
        )}
      />
    </div>
  );
}
