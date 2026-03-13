import { Controller, type UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { Input, Select, Textarea, RadioGroup, Card } from "@/components/ui";
import {
  TIMELINE_OPTIONS,
  REVISION_OPTIONS,
} from "../../constants/formOptions";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

const timelineOptions = TIMELINE_OPTIONS.map((o) => ({ value: o, label: o }));
const revisionOptions = REVISION_OPTIONS.map((o) => ({
  value: String(o.value),
  label: o.label,
}));

const postLaunchTrainingOptions = [
  { value: "yes", label: "Yes, I need training" },
  { value: "no", label: "No training needed" },
];

const postLaunchDocsOptions = [
  { value: "yes", label: "Yes, provide documentation" },
  { value: "no", label: "Not needed" },
];

export function Step07_Process({ form, accent }: StepProps) {
  const { register, control } = form;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">
          Process & Expectations
        </h2>
        <p className="mt-1 text-sm text-th-muted">
          Set expectations for the project workflow.
        </p>
      </div>

      {/* Timeline */}
      <div className="mb-5">
        <Select
          label="Desired Timeline"
          options={timelineOptions}
          register={register("timeline")}
          placeholder="Select..."
        />
      </div>

      {/* Revision rounds */}
      <div className="mb-5">
        <Select
          label="Revision Rounds"
          options={revisionOptions}
          register={register("revisionRounds")}
          placeholder="Select..."
        />
      </div>

      {/* Approval process */}
      <div className="mb-5">
        <Textarea
          label="Approval Process"
          register={register("approvalProcess")}
          placeholder="Describe your approval process..."
          hint="Optional"
          rows={3}
        />
      </div>

      {/* Decision makers */}
      <div className="mb-5">
        <Input
          label="Decision Makers"
          register={register("decisionMakers")}
          placeholder="Who are the key decision makers?"
          hint="Optional"
        />
      </div>

      {/* Post-launch training */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Post-Launch Training
        </label>
        <Controller
          control={control}
          name="postLaunchTraining"
          render={({ field }) => (
            <RadioGroup
              name="postLaunchTraining"
              options={postLaunchTrainingOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              accent={accent}
            />
          )}
        />
      </div>

      {/* Post-launch docs */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-th-secondary mb-2">
          Post-Launch Documentation
        </label>
        <Controller
          control={control}
          name="postLaunchDocs"
          render={({ field }) => (
            <RadioGroup
              name="postLaunchDocs"
              options={postLaunchDocsOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              accent={accent}
            />
          )}
        />
      </div>

      {/* Maintenance scope */}
      <div className="mb-5">
        <Textarea
          label="Maintenance Scope"
          register={register("maintenanceScope")}
          placeholder="Describe ongoing maintenance needs..."
          hint="Optional"
          rows={3}
        />
      </div>

      {/* Exclusions */}
      <div className="mb-5">
        <Textarea
          label="Exclusions"
          register={register("exclusions")}
          placeholder="List anything you want explicitly excluded from the project scope..."
          hint="Being clear about exclusions prevents misunderstandings later."
          rows={3}
        />
      </div>

      {/* Change request awareness */}
      <Controller
        control={control}
        name="changeRequestAwareness"
        render={({ field }) => (
          <Card className="mb-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={field.value ?? false}
                onChange={(e) => field.onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-th-border accent-blue-500"
                style={accent ? { accentColor: accent } : undefined}
              />
              <div>
                <p className="text-sm font-medium text-th-text">
                  Change Request Acknowledgement
                </p>
                <p className="mt-1 text-xs text-th-muted leading-relaxed">
                  I understand that changes outside the agreed project scope may
                  incur additional charges. A formal change request process will
                  be used to document and approve any scope modifications.
                </p>
              </div>
            </label>
          </Card>
        )}
      />
    </div>
  );
}
