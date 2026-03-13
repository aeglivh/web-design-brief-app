import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { intakeSchema, STEP_FIELDS, STEP_LABELS } from "../schemas/intakeSchema";
import type { IntakeFormData } from "@/lib/types";

export function useIntakeForm(designerSlug: string) {
  const STORAGE_KEY = `intake-draft-${designerSlug}`;

  const DEFAULTS: IntakeFormData = {
    businessName: "",
    industry: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    currentUrl: "",
    primaryGoal: "",
    targetAudience: "",
    competitors: [],
    projectType: "new",
    painPoints: "",
    contentMigration: "",
    features: [],
    integrations: "",
    cmsPreference: "",
    pages: [{ name: "Home", type: "landing", purpose: "" }],
    contentReadiness: {},
    contentResponsibility: "",
    contentDeadline: "",
    copywritingNeeds: "",
    photographyNeeds: "",
    currentSeo: "",
    seoGoals: "",
    googleBusiness: "",
    analytics: "",
    domainStatus: "",
    visualStyles: [],
    referenceSites: [],
    brandAssets: "",
    toneOfVoice: [],
    uploads: [],
    hostingResponsibility: "",
    domainResponsibility: "",
    thirdPartyAccess: [],
    legalPagesResponsibility: "",
    accessibilityLevel: "none",
    timeline: "",
    revisionRounds: "2",
    approvalProcess: "",
    decisionMakers: "",
    postLaunchTraining: "",
    postLaunchDocs: "",
    maintenanceScope: "",
    exclusions: "",
    changeRequestAwareness: false,
    budgetRange: "",
    budgetCurrency: "CHF",
    launchDate: "",
    referralSource: "",
    additionalComments: "",
    ecommerceProductCount: "",
    ecommerceProductTypes: [],
    ecommercePaymentGateways: [],
    ecommerceShipping: "",
    ecommerceInventory: "",
    ecommerceImport: "",
    designerSlug,
  };

  // Load draft from localStorage
  let initialValues = DEFAULTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      initialValues = { ...DEFAULTS, ...parsed, designerSlug };
    }
  } catch {
    // ignore parse errors, use defaults
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema) as any,
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const { watch, trigger } = form;

  // Auto-save to localStorage with debounce
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const subscription = watch((values) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
        } catch {
          // ignore storage errors
        }
      }, 500);
    });

    return () => {
      clearTimeout(timerRef.current);
      subscription.unsubscribe();
    };
  }, [watch, STORAGE_KEY]);

  // Step tracking (0-based)
  const [step, setStep] = useState(0);

  // Check if e-commerce step should show
  const features = watch("features");
  const isEcommerce = Array.isArray(features) && features.includes("E-commerce / Shop");

  // Total steps: 10 if ecommerce, 9 if not (skip step index 8 = e-commerce)
  const totalSteps = isEcommerce ? 10 : 9;

  // Step labels filtered based on ecommerce
  const stepLabels = isEcommerce
    ? STEP_LABELS
    : STEP_LABELS.filter((_, i) => i !== 8);

  // Validate only fields belonging to the current step
  const validateStep = useCallback(async (): Promise<boolean> => {
    // Map display step to schema step (1-based keys in STEP_FIELDS)
    let schemaStep: number;
    if (!isEcommerce && step >= 8) {
      schemaStep = step + 2;
    } else {
      schemaStep = step + 1;
    }

    const fields = STEP_FIELDS[schemaStep];
    if (!fields || fields.length === 0) return true;

    const result = await trigger(fields as (keyof IntakeFormData)[]);
    return result;
  }, [step, isEcommerce, trigger]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [STORAGE_KEY]);

  const nextStep = useCallback(async () => {
    const valid = await validateStep();
    if (!valid) return;

    if (!isEcommerce && step === 7) {
      setStep(8);
    } else {
      setStep((s) => Math.min(s + 1, totalSteps - 1));
    }
  }, [validateStep, isEcommerce, step, totalSteps]);

  const prevStep = useCallback(() => {
    if (!isEcommerce && step === 8) {
      setStep(7);
    } else {
      setStep((s) => Math.max(s - 1, 0));
    }
  }, [isEcommerce, step]);

  return {
    form,
    step,
    setStep,
    totalSteps,
    stepLabels,
    isEcommerce,
    validateStep,
    clearDraft,
    nextStep,
    prevStep,
  };
}
