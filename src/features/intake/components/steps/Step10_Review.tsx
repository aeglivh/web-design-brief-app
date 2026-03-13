import type { UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import { Card, Badge } from "@/components/ui";
import { STEP_LABELS } from "../../schemas/intakeSchema";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
  accent: string;
}

interface ReviewStepProps extends StepProps {
  onEditStep: (step: number) => void;
}

/* ── Helper: only renders when value is truthy ─────────────────────────────── */

function ReviewField({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  if (value === undefined || value === null || value === "" || value === false)
    return null;

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return (
      <div className="py-1.5">
        <dt className="text-[13px] font-medium text-th-secondary">
          {label}
        </dt>
        <dd className="mt-1 flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <Badge key={i} variant="neutral">
              {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </Badge>
          ))}
        </dd>
      </div>
    );
  }

  if (value === true) {
    return (
      <div className="py-1.5">
        <dt className="text-[13px] font-medium text-th-secondary">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-th-text">Yes</dd>
      </div>
    );
  }

  return (
    <div className="py-1.5">
      <dt className="text-[13px] font-medium text-th-secondary">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-th-text">{String(value)}</dd>
    </div>
  );
}

/* ── Section wrapper ───────────────────────────────────────────────────────── */

function ReviewSection({
  stepIndex,
  label,
  accent,
  onEdit,
  children,
}: {
  stepIndex: number;
  label: string;
  accent: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-th-text">
            {stepIndex + 1}. {label}
          </h3>
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-medium hover:underline"
            style={{ color: accent }}
          >
            Edit
          </button>
        </div>
      }
    >
      <dl className="divide-y divide-th-border-light">{children}</dl>
    </Card>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */

export function Step10_Review({ form, accent, onEditStep }: ReviewStepProps) {
  const v = form.getValues();

  const hasEcommerce = (v.features ?? []).includes("E-commerce / Shop");

  const competitorUrls = (v.competitors ?? [])
    .map((c) => (c.notes ? `${c.url} — ${c.notes}` : c.url))
    .filter(Boolean);

  const referenceUrls = (v.referenceSites ?? [])
    .map((r) => (r.notes ? `${r.url} — ${r.notes}` : r.url))
    .filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="text-lg font-semibold text-th-text">
          Review Your Brief
        </h2>
        <p className="mt-1 text-sm text-th-muted">
          Please review your answers before submitting.
        </p>
      </div>

      {/* 1. Business & Goals */}
      <ReviewSection
        stepIndex={0}
        label={STEP_LABELS[0]}
        accent={accent}
        onEdit={() => onEditStep(0)}
      >
        <ReviewField label="Business Name" value={v.businessName} />
        <ReviewField label="Industry" value={v.industry} />
        <ReviewField label="Contact Name" value={v.contactName} />
        <ReviewField label="Contact Email" value={v.contactEmail} />
        <ReviewField label="Contact Phone" value={v.contactPhone} />
        <ReviewField label="Current Website" value={v.currentUrl} />
        <ReviewField label="Primary Goal" value={v.primaryGoal} />
        <ReviewField label="Target Audience" value={v.targetAudience} />
        <ReviewField label="Competitors" value={competitorUrls} />
      </ReviewSection>

      {/* 2. Project Scope */}
      <ReviewSection
        stepIndex={1}
        label={STEP_LABELS[1]}
        accent={accent}
        onEdit={() => onEditStep(1)}
      >
        <ReviewField
          label="Project Type"
          value={v.projectType === "new" ? "New website" : "Redesign"}
        />
        <ReviewField label="Pain Points" value={v.painPoints} />
        <ReviewField label="Content Migration" value={v.contentMigration} />
        <ReviewField label="Features" value={v.features} />
        <ReviewField label="CMS Preference" value={v.cmsPreference} />
        <ReviewField label="Integrations" value={v.integrations} />
      </ReviewSection>

      {/* 3. Page Specs */}
      <ReviewSection
        stepIndex={2}
        label={STEP_LABELS[2]}
        accent={accent}
        onEdit={() => onEditStep(2)}
      >
        {(v.pages ?? []).length > 0 ? (
          <div className="py-1.5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[12px] font-medium text-th-muted">
                  <th className="pb-2 pr-3">Name</th>
                  <th className="pb-2 pr-3">Type</th>
                  <th className="pb-2">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-th-border-light">
                {v.pages.map((page, i) => (
                  <tr key={i} className="text-th-secondary">
                    <td className="py-1.5 pr-3">{page.name}</td>
                    <td className="py-1.5 pr-3">{page.type}</td>
                    <td className="py-1.5">{page.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-1.5 text-sm text-th-muted italic">
            No pages added
          </p>
        )}
      </ReviewSection>

      {/* 4. Content & SEO */}
      <ReviewSection
        stepIndex={3}
        label={STEP_LABELS[3]}
        accent={accent}
        onEdit={() => onEditStep(3)}
      >
        <ReviewField
          label="Content Responsibility"
          value={v.contentResponsibility}
        />
        <ReviewField label="Content Deadline" value={v.contentDeadline} />
        <ReviewField label="Copywriting Needs" value={v.copywritingNeeds} />
        <ReviewField label="Photography Needs" value={v.photographyNeeds} />
        <ReviewField label="Current SEO" value={v.currentSeo} />
        <ReviewField label="SEO Goals" value={v.seoGoals} />
        <ReviewField label="Domain Status" value={v.domainStatus} />
        <ReviewField label="Analytics" value={v.analytics} />
        <ReviewField label="Google Business" value={v.googleBusiness} />
      </ReviewSection>

      {/* 5. Design & Brand */}
      <ReviewSection
        stepIndex={4}
        label={STEP_LABELS[4]}
        accent={accent}
        onEdit={() => onEditStep(4)}
      >
        <ReviewField label="Visual Styles" value={v.visualStyles} />
        <ReviewField label="Tone of Voice" value={v.toneOfVoice} />
        <ReviewField label="Reference Sites" value={referenceUrls} />
        <ReviewField label="Brand Assets" value={v.brandAssets} />
        {(v.uploads ?? []).length > 0 && (
          <ReviewField
            label="Uploads"
            value={`${v.uploads.length} file(s) attached`}
          />
        )}
      </ReviewSection>

      {/* 6. Responsibilities */}
      <ReviewSection
        stepIndex={5}
        label={STEP_LABELS[5]}
        accent={accent}
        onEdit={() => onEditStep(5)}
      >
        <ReviewField
          label="Hosting Responsibility"
          value={v.hostingResponsibility}
        />
        <ReviewField
          label="Domain Responsibility"
          value={v.domainResponsibility}
        />
        <ReviewField
          label="Third-Party Access"
          value={v.thirdPartyAccess}
        />
        <ReviewField
          label="Legal Pages Responsibility"
          value={v.legalPagesResponsibility}
        />
        <ReviewField
          label="Accessibility Level"
          value={v.accessibilityLevel}
        />
      </ReviewSection>

      {/* 7. Process */}
      <ReviewSection
        stepIndex={6}
        label={STEP_LABELS[6]}
        accent={accent}
        onEdit={() => onEditStep(6)}
      >
        <ReviewField label="Revision Rounds" value={v.revisionRounds} />
        <ReviewField label="Approval Process" value={v.approvalProcess} />
        <ReviewField label="Decision Makers" value={v.decisionMakers} />
        <ReviewField
          label="Post-Launch Training"
          value={v.postLaunchTraining}
        />
        <ReviewField label="Maintenance Scope" value={v.maintenanceScope} />
        <ReviewField label="Exclusions" value={v.exclusions} />
        <ReviewField
          label="Change Request Awareness"
          value={v.changeRequestAwareness}
        />
      </ReviewSection>

      {/* 8. Budget */}
      <ReviewSection
        stepIndex={7}
        label={STEP_LABELS[7]}
        accent={accent}
        onEdit={() => onEditStep(7)}
      >
        <ReviewField label="Budget Range" value={v.budgetRange} />
        <ReviewField label="Currency" value={v.budgetCurrency} />
        <ReviewField label="Referral Source" value={v.referralSource} />
        <ReviewField
          label="Additional Comments"
          value={v.additionalComments}
        />
      </ReviewSection>

      {/* 9. E-commerce (conditional) */}
      {hasEcommerce && (
        <ReviewSection
          stepIndex={8}
          label={STEP_LABELS[8]}
          accent={accent}
          onEdit={() => onEditStep(8)}
        >
          <ReviewField
            label="Product Count"
            value={v.ecommerceProductCount}
          />
          <ReviewField
            label="Product Types"
            value={v.ecommerceProductTypes}
          />
          <ReviewField
            label="Payment Gateways"
            value={v.ecommercePaymentGateways}
          />
          <ReviewField label="Shipping" value={v.ecommerceShipping} />
          <ReviewField
            label="Inventory Tracking"
            value={
              v.ecommerceInventory === "yes"
                ? "Yes"
                : v.ecommerceInventory === "no"
                  ? "No"
                  : undefined
            }
          />
          <ReviewField
            label="Data Import"
            value={
              v.ecommerceImport === "yes"
                ? "Yes, importing from existing system"
                : v.ecommerceImport === "no"
                  ? "No, starting fresh"
                  : undefined
            }
          />
        </ReviewSection>
      )}
    </div>
  );
}
