export const INDUSTRY_OPTIONS = [
  "E-commerce",
  "SaaS / Tech",
  "Agency / Consultancy",
  "Health & Wellness",
  "Real Estate",
  "Finance / Insurance",
  "Education",
  "Hospitality / F&B",
  "Non-Profit",
  "Personal Brand",
  "Creative / Portfolio",
  "Construction / Trades",
  "Legal",
  "Automotive",
  "Other",
] as const;

export const GOAL_OPTIONS = [
  "Generate leads",
  "Sell products online",
  "Build brand awareness",
  "Provide information",
  "Showcase portfolio",
  "Book appointments",
  "Membership / Community",
  "Support existing customers",
  "Other",
] as const;

export const FEATURE_OPTIONS = [
  "Contact form",
  "Blog",
  "E-commerce / Shop",
  "Booking / Calendar",
  "User accounts / Login",
  "Newsletter signup",
  "Live chat",
  "Gallery / Portfolio",
  "Testimonials",
  "FAQ section",
  "Maps / Locations",
  "Social media feeds",
  "Video background",
  "Multi-language",
  "Search functionality",
  "File downloads",
  "Job listings",
  "Events calendar",
  "Payment processing",
  "CRM integration",
] as const;

export const CMS_OPTIONS = [
  "WordPress",
  "Webflow",
  "Shopify",
  "Squarespace",
  "Custom CMS",
  "No preference",
  "Other",
] as const;

export const PAGE_TYPE_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "about", label: "About" },
  { value: "services", label: "Services" },
  { value: "contact", label: "Contact" },
  { value: "blog", label: "Blog" },
  { value: "portfolio", label: "Portfolio / Gallery" },
  { value: "pricing", label: "Pricing" },
  { value: "faq", label: "FAQ" },
  { value: "testimonials", label: "Testimonials" },
  { value: "team", label: "Team / About Us" },
  { value: "landing", label: "Landing Page" },
  { value: "product", label: "Product Page" },
  { value: "category", label: "Category / Archive" },
  { value: "legal", label: "Legal / Policy" },
  { value: "custom", label: "Custom Page" },
] as const;

export const CONTENT_READINESS_OPTIONS = [
  "Ready to go",
  "Partially ready",
  "Needs writing",
  "Need copywriter",
] as const;

export const SEO_OPTIONS = [
  "Not important",
  "Basic SEO setup",
  "Full SEO strategy",
  "Already have SEO agency",
] as const;

export const VISUAL_STYLE_OPTIONS = [
  "Minimal & Clean",
  "Bold & Vibrant",
  "Elegant & Luxurious",
  "Playful & Fun",
  "Corporate & Professional",
  "Rustic & Organic",
  "Dark & Moody",
  "Light & Airy",
] as const;

export const TONE_OPTIONS = [
  "Professional",
  "Friendly & Approachable",
  "Authoritative",
  "Casual & Conversational",
  "Inspirational",
  "Technical",
  "Luxurious",
  "Playful",
] as const;

export const BUDGET_OPTIONS = [
  "Under $1,000",
  "$1,000 – $3,000",
  "$3,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000 – $25,000",
  "$25,000+",
  "Not sure yet",
] as const;

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
  { value: "CHF", label: "CHF" },
  { value: "NZD", label: "NZD" },
] as const;

export const HOSTING_OPTIONS = [
  "I'll provide hosting",
  "Designer to recommend/set up",
  "Already have hosting",
  "Not sure",
] as const;

export const DOMAIN_OPTIONS = [
  "I own my domain",
  "I need to purchase one",
  "Designer to handle",
  "Not sure",
] as const;

export const ACCESSIBILITY_OPTIONS = [
  { value: "none", label: "Not required" },
  { value: "a", label: "WCAG Level A — Basic" },
  { value: "aa", label: "WCAG Level AA — Standard" },
  { value: "aaa", label: "WCAG Level AAA — Highest" },
] as const;

export const REVISION_OPTIONS = [
  { value: 1, label: "1 round" },
  { value: 2, label: "2 rounds" },
  { value: 3, label: "3 rounds" },
  { value: 5, label: "5 rounds" },
  { value: 0, label: "Unlimited" },
] as const;

export const REFERRAL_OPTIONS = [
  "Google search",
  "Social media",
  "Referral / Word of mouth",
  "Directory listing",
  "Returning client",
  "Other",
] as const;

export const PAYMENT_GATEWAY_OPTIONS = [
  "Stripe",
  "PayPal",
  "Square",
  "Klarna / Afterpay",
  "Bank transfer",
  "Other",
  "Not sure",
] as const;

export const SHIPPING_OPTIONS = [
  "Flat rate",
  "Weight-based",
  "Free shipping",
  "Real-time carrier rates",
  "Local pickup only",
  "Not applicable",
] as const;

export const TIMELINE_OPTIONS = [
  "ASAP",
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "No rush",
  "Not sure",
] as const;
