// ── Designer ──────────────────────────────────────────────────────────────────

export interface Designer {
  id: string;
  studio_name: string;
  slug: string;
  tagline: string;
  accent_color: string;
  logo_url: string;
  designer_email: string;
  bg_color: string;
  form_bg_colour: string;
  dashboard_bg_colour: string;
  dashboard_bar_colour: string;
  heading_font: string;
  body_font: string;
}

// ── Rates ─────────────────────────────────────────────────────────────────────

export interface PageRates {
  landing: number;
  inner: number;
  blog: number;
  ecommerce: number;
}

export interface AddonRates {
  contactForm: number;
  gallery: number;
  newsletter: number;
  seo: number;
  booking: number;
  ecommerce: number;
  livechat: number;
  multilanguage: number;
  blog: number;
  copywriting: number;
  photography: number;
  maintenance: number;
  training: number;
}

export interface Multipliers {
  simple: number;
  moderate: number;
  complex: number;
}

export interface Rates {
  id: string;
  designer_id: string;
  page_rates: PageRates;
  addon_rates: AddonRates;
  hourly_rate: number;
  multipliers: Multipliers;
  currency: string;
  vat_rate: number;
}

// ── Brief ─────────────────────────────────────────────────────────────────────

export type BriefStatus = "new" | "reviewed" | "quoted" | "contracted" | "archived";

export interface Brief {
  id: string;
  designer_id: string;
  client_name: string;
  client_email: string;
  business_name: string;
  industry: string;
  project_type: string;
  page_count: string;
  budget: string;
  brief_text: string;
  tags: BriefTags | null;
  quote: Quote | null;
  form_snapshot: Record<string, unknown>;
  status: BriefStatus;
  created_at: string;
}

export interface BriefTags {
  keywords: string[];
  techStack: string[];
  contentGaps: string[];
  riskFlags: string[];
}

// ── Quote ─────────────────────────────────────────────────────────────────────

export interface QuoteLineItem {
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  lineItems: QuoteLineItem[];
  subtotal: number;
  complexityLevel: "simple" | "moderate" | "complex";
  complexityMultiplier: number;
  total: number;
  currency: string;
  notes: string;
  estimatedHours: number;
}

// ── Contract ──────────────────────────────────────────────────────────────────

export interface ContractDeliverable {
  item: string;
  description: string;
}

export interface ContractMilestone {
  phase: string;
  weeks: string;
  deliverable: string;
}

export interface ContractPayment {
  milestone: string;
  percentage: number;
  amount: number;
}

export interface ContractData {
  scopeOfWork: string;
  deliverables: ContractDeliverable[];
  exclusions: string[];
  revisionPolicy: {
    designRevisions: number;
    developmentRevisions: number;
    additionalRate: number;
    description: string;
  };
  timeline: {
    totalWeeks: number;
    milestones: ContractMilestone[];
  };
  paymentSchedule: ContractPayment[];
  changeRequestProcess: string;
  ipTransfer: string;
  cancellationTerms: string;
  warranty: string;
}

export type ContractStatus = "draft" | "sent" | "signed";

export interface Contract {
  id: string;
  brief_id: string;
  designer_id: string;
  contract_data: ContractData;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

// ── Intake Form ───────────────────────────────────────────────────────────────

export interface Competitor {
  url: string;
  notes: string;
}

export interface ReferenceSite {
  url: string;
  notes: string;
}

export interface PageSpec {
  name: string;
  type: "landing" | "inner" | "blog" | "ecommerce";
  purpose: string;
}

export interface FileUpload {
  base64: string;
  mediaType: string;
  label: string;
}

export interface IntakeFormData {
  // Step 1: Business & Goals
  businessName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  currentUrl: string;
  primaryGoal: string;
  targetAudience: string;
  competitors: Competitor[];

  // Step 2: Project Scope
  projectType: "new" | "redesign";
  painPoints: string;
  contentMigration: string;
  features: string[];
  integrations: string;
  cmsPreference: string;

  // Step 3: Page Specifications
  pages: PageSpec[];

  // Step 4: Content & SEO
  contentReadiness: Record<string, string>;
  contentResponsibility: string;
  contentDeadline: string;
  copywritingNeeds: string;
  photographyNeeds: string;
  currentSeo: string;
  seoGoals: string;
  googleBusiness: string;
  analytics: string;
  domainStatus: string;

  // Step 5: Design & Brand
  visualStyles: string[];
  referenceSites: ReferenceSite[];
  brandAssets: string;
  toneOfVoice: string[];
  uploads: FileUpload[];

  // Step 6: Responsibilities & Access
  hostingResponsibility: string;
  domainResponsibility: string;
  thirdPartyAccess: string[];
  legalPagesResponsibility: string;
  accessibilityLevel: string;

  // Step 7: Process & Expectations
  timeline: string;
  revisionRounds: string;
  approvalProcess: string;
  decisionMakers: string;
  postLaunchTraining: string;
  postLaunchDocs: string;
  maintenanceScope: string;
  exclusions: string;
  changeRequestAwareness: boolean;

  // Step 8: Budget & Final
  budgetRange: string;
  budgetCurrency: string;
  launchDate: string;
  referralSource: string;
  additionalComments: string;

  // Step 9: E-commerce (conditional)
  ecommerceProductCount: string;
  ecommerceProductTypes: string[];
  ecommercePaymentGateways: string[];
  ecommerceShipping: string;
  ecommerceInventory: string;
  ecommerceImport: string;

  // Meta
  designerSlug?: string;
}
