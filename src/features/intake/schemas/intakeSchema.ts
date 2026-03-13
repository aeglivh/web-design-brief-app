import { z } from "zod";

// ── Step 1: Business & Goals ─────────────────────────────────────────────────

export const step1Schema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Select an industry"),
  contactName: z.string().min(1, "Your name is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().optional(),
  currentUrl: z.string().optional(),
  primaryGoal: z.string().min(1, "Select a primary goal"),
  targetAudience: z.string().optional(),
  competitors: z
    .array(z.object({ url: z.string(), notes: z.string() }))
    .default([]),
});

// ── Step 2: Project Scope ────────────────────────────────────────────────────

export const step2Schema = z.object({
  projectType: z.enum(["new", "redesign"]),
  painPoints: z.string().optional(),
  contentMigration: z.string().optional(),
  features: z.array(z.string()).default([]),
  cmsPreference: z.string().optional(),
  integrations: z.string().optional(),
});

// ── Step 3: Page Specs ───────────────────────────────────────────────────────

export const step3Schema = z.object({
  pages: z
    .array(
      z.object({
        name: z.string().min(1, "Page name is required"),
        type: z.string().min(1),
        purpose: z.string().optional(),
      })
    )
    .min(1, "Add at least one page"),
});

// ── Step 4: Content & SEO ────────────────────────────────────────────────────

export const step4Schema = z.object({
  contentReadiness: z.record(z.string(), z.string()).default({}),
  contentResponsibility: z.string().optional(),
  contentDeadline: z.string().optional(),
  copywritingNeeds: z.string().optional(),
  photographyNeeds: z.string().optional(),
  currentSeo: z.string().optional(),
  seoGoals: z.string().optional(),
  googleBusiness: z.string().optional(),
  analytics: z.string().optional(),
  domainStatus: z.string().optional(),
});

// ── Step 5: Design & Brand ───────────────────────────────────────────────────

export const step5Schema = z.object({
  visualStyles: z.array(z.string()).default([]),
  referenceSites: z
    .array(z.object({ url: z.string(), notes: z.string() }))
    .default([]),
  brandAssets: z.string().optional(),
  toneOfVoice: z.array(z.string()).default([]),
  uploads: z
    .array(
      z.object({
        base64: z.string(),
        mediaType: z.string(),
        label: z.string(),
      })
    )
    .default([]),
});

// ── Step 6: Responsibilities ─────────────────────────────────────────────────

export const step6Schema = z.object({
  hostingResponsibility: z.string().optional(),
  domainResponsibility: z.string().optional(),
  thirdPartyAccess: z.array(z.string()).default([]),
  legalPagesResponsibility: z.string().optional(),
  accessibilityLevel: z.string().optional().default("none"),
});

// ── Step 7: Process ──────────────────────────────────────────────────────────

export const step7Schema = z.object({
  timeline: z.string().optional(),
  revisionRounds: z.string().optional().default("2"),
  approvalProcess: z.string().optional(),
  decisionMakers: z.string().optional(),
  postLaunchTraining: z.string().optional(),
  postLaunchDocs: z.string().optional(),
  maintenanceScope: z.string().optional(),
  exclusions: z.string().optional(),
  changeRequestAwareness: z.boolean().optional().default(false),
});

// ── Step 8: Budget ───────────────────────────────────────────────────────────

export const step8Schema = z.object({
  budgetRange: z.string().optional(),
  budgetCurrency: z.string().optional().default("CHF"),
  launchDate: z.string().optional(),
  referralSource: z.string().optional(),
  additionalComments: z.string().optional(),
});

// ── Step 9: E-commerce (conditional) ─────────────────────────────────────────

export const step9Schema = z.object({
  ecommerceProductCount: z.string().optional(),
  ecommerceProductTypes: z.array(z.string()).default([]),
  ecommercePaymentGateways: z.array(z.string()).default([]),
  ecommerceShipping: z.string().optional(),
  ecommerceInventory: z.string().optional(),
  ecommerceImport: z.string().optional(),
});

// ── Step 10: Review (no fields) ──────────────────────────────────────────────

export const step10Schema = z.object({});

// ── Meta ─────────────────────────────────────────────────────────────────────

const metaSchema = z.object({
  designerSlug: z.string().optional(),
});

// ── Combined schema ──────────────────────────────────────────────────────────

export const intakeSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema)
  .merge(step8Schema)
  .merge(step9Schema)
  .merge(step10Schema)
  .merge(metaSchema);

export type IntakeFormValues = z.infer<typeof intakeSchema>;

// ── Step metadata ────────────────────────────────────────────────────────────

export const STEP_FIELDS: Record<number, string[]> = {
  1: [
    "businessName",
    "industry",
    "contactName",
    "contactEmail",
    "contactPhone",
    "currentUrl",
    "primaryGoal",
    "targetAudience",
    "competitors",
  ],
  2: [
    "projectType",
    "painPoints",
    "contentMigration",
    "features",
    "cmsPreference",
    "integrations",
  ],
  3: ["pages"],
  4: [
    "contentReadiness",
    "contentResponsibility",
    "contentDeadline",
    "copywritingNeeds",
    "photographyNeeds",
    "currentSeo",
    "seoGoals",
    "googleBusiness",
    "analytics",
    "domainStatus",
  ],
  5: ["visualStyles", "referenceSites", "brandAssets", "toneOfVoice", "uploads"],
  6: [
    "hostingResponsibility",
    "domainResponsibility",
    "thirdPartyAccess",
    "legalPagesResponsibility",
    "accessibilityLevel",
  ],
  7: [
    "timeline",
    "revisionRounds",
    "approvalProcess",
    "decisionMakers",
    "postLaunchTraining",
    "postLaunchDocs",
    "maintenanceScope",
    "exclusions",
    "changeRequestAwareness",
  ],
  8: ["budgetRange", "budgetCurrency", "launchDate", "referralSource", "additionalComments"],
  9: [
    "ecommerceProductCount",
    "ecommerceProductTypes",
    "ecommercePaymentGateways",
    "ecommerceShipping",
    "ecommerceInventory",
    "ecommerceImport",
  ],
  10: [],
};

export const STEP_LABELS: string[] = [
  "Business & Goals",
  "Project Scope",
  "Page Specs",
  "Content & SEO",
  "Design & Brand",
  "Responsibilities",
  "Process",
  "Budget",
  "E-commerce",
  "Review",
];
