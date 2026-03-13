import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FormLayout } from "@/components/layout";
import { StepIndicator, Button, Spinner, Alert } from "@/components/ui";
import { useIntakeForm } from "../hooks/useIntakeForm";
import { API_BASE } from "@/lib/api";
import type { IntakeFormData, Designer } from "@/lib/types";

import { Step01_BusinessGoals } from "../components/steps/Step01_BusinessGoals";
import { Step02_ProjectScope } from "../components/steps/Step02_ProjectScope";
import { Step03_PageSpecs } from "../components/steps/Step03_PageSpecs";
import { Step04_ContentSeo } from "../components/steps/Step04_ContentSeo";
import { Step05_DesignBrand } from "../components/steps/Step05_DesignBrand";
import { Step06_Responsibilities } from "../components/steps/Step06_Responsibilities";
import { Step07_Process } from "../components/steps/Step07_Process";
import { Step08_Budget } from "../components/steps/Step08_Budget";
import { Step09_Ecommerce } from "../components/steps/Step09_Ecommerce";
import { Step10_Review } from "../components/steps/Step10_Review";

export default function IntakeFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [briefText, setBriefText] = useState("");
  const [error, setError] = useState("");

  const {
    form,
    step,
    setStep,
    totalSteps,
    stepLabels,
    isEcommerce,
    nextStep,
    prevStep,
    clearDraft,
  } = useIntakeForm(slug || "");

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE}/api/designer?slug=${slug}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setDesigner(data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  const accent = designer?.accent_color || "#3b82f6";
  const formBg = designer?.form_bg_colour || "";
  const bgColor = formBg || "var(--th-bg)";
  const headingFont = designer?.heading_font || "Inter";
  const bodyFont = designer?.body_font || "Inter";

  // Dynamically load Google Fonts for branding
  useEffect(() => {
    const fonts = new Set([headingFont, bodyFont].filter((f) => f && f !== "Inter"));
    if (fonts.size === 0) return;
    const families = [...fonts].map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&");
    const id = "branding-fonts";
    if (document.getElementById(id)) document.getElementById(id)!.remove();
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }, [headingFont, bodyFont]);

  const onSubmit = async (data: IntakeFormData) => {
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...data, designerSlug: slug };
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Submission failed" }));
        throw new Error(err.error || "Submission failed");
      }
      const result = await res.json();
      setBriefText(result.brief || "");
      clearDraft();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    }
    setSubmitting(false);
  };

  const getStepComponent = () => {
    const actualStep = !isEcommerce && step >= 8 ? step + 1 : step;
    const props = { form, accent };

    switch (actualStep) {
      case 0: return <Step01_BusinessGoals {...props} />;
      case 1: return <Step02_ProjectScope {...props} />;
      case 2: return <Step03_PageSpecs {...props} />;
      case 3: return <Step04_ContentSeo {...props} />;
      case 4: return <Step05_DesignBrand {...props} />;
      case 5: return <Step06_Responsibilities {...props} />;
      case 6: return <Step07_Process {...props} />;
      case 7: return <Step08_Budget {...props} />;
      case 8: return <Step09_Ecommerce {...props} />;
      case 9: return <Step10_Review {...props} onEditStep={setStep} />;
      default: return null;
    }
  };

  const isLastStep = step === totalSteps - 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-th-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-th-bg">
        <div className="text-center animate-[fade-in_0.4s_ease-out]">
          <div className="w-12 h-12 rounded-[12px] bg-th-surface-hover flex items-center justify-center mx-auto mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--th-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-[18px] font-semibold text-th-text mb-1.5">Studio not found</h1>
          <p className="text-[14px] text-th-muted">This link doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <FormLayout bgColor={bgColor}>
        <div
          className="px-10 py-14 text-center"
          style={{ fontFamily: `'${bodyFont}', sans-serif` }}
        >
          <div
            className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center text-white"
            style={{ backgroundColor: accent }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            className="text-[22px] font-semibold text-th-text tracking-[-0.02em] mb-2"
            style={{ fontFamily: `'${headingFont}', serif` }}
          >
            Brief submitted
          </h2>
          <p className="text-[14px] text-th-muted leading-relaxed max-w-sm mx-auto">
            Thank you for completing your project brief.{" "}
            {designer?.studio_name || "The designer"} will review your
            requirements and get back to you.
          </p>
          {briefText && (
            <div className="mt-10 text-left bg-th-surface rounded-[12px] p-6 text-[13px] text-th-secondary leading-[1.8] whitespace-pre-wrap max-h-96 overflow-y-auto border border-th-border-light">
              {briefText}
            </div>
          )}
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout bgColor={bgColor} maxWidth="860px">
      <div className="flex flex-col h-full" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
        {/* Header — fixed */}
        <div className="px-10 pt-8 pb-5 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            {designer?.logo_url && (
              <img
                src={designer.logo_url}
                alt={designer.studio_name}
                className="w-9 h-9 rounded-[8px] object-contain"
              />
            )}
            <div>
              <h1
                className="text-[17px] font-semibold text-th-text tracking-[-0.01em]"
                style={{ fontFamily: `'${headingFont}', serif` }}
              >
                {designer?.studio_name || "Design Brief"}
              </h1>
              {designer?.tagline && (
                <p className="text-[12px] text-th-muted">{designer.tagline}</p>
              )}
            </div>
          </div>

          <StepIndicator
            steps={stepLabels}
            currentStep={step + 1}
            accent={accent}
          />
        </div>

        {/* Form body — scrollable */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
          <div className="px-10 py-5 overflow-y-auto flex-1">
            {getStepComponent()}
          </div>

          {/* Navigation — fixed */}
          <div className="px-10 py-5 border-t border-th-border-light flex items-center justify-between shrink-0">
            <div>
              {step > 0 && (
                <Button type="button" variant="ghost" onClick={prevStep}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {error && <span className="text-[12px] text-[#FF453A]">{error}</span>}

              {isLastStep ? (
                <Button type="submit" accent={accent} loading={submitting}>
                  Submit Brief
                </Button>
              ) : (
                <Button type="button" accent={accent} onClick={nextStep}>
                  Continue
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
