'use strict';

const { z } = require('zod');

const s = (max = 500) => z.string().max(max).transform(v => v.trim());

const generateSchema = z.object({
  // Step 1 — Business & Goals
  businessName:    s(200),
  industry:        s(100),
  contactName:     s(120),
  contactEmail:    z.string().email().max(254),
  contactPhone:    s(30).default(''),
  currentUrl:      s(500).default(''),
  primaryGoal:     s(100),
  targetAudience:  s(1500).default(''),
  competitors:     z.array(z.object({
    url:   s(500).default(''),
    notes: s(300).default(''),
  })).max(3).default([]),

  // Step 2 — Project Scope
  projectType:     s(20),
  painPoints:      s(1500).default(''),
  contentMigration: s(1500).default(''),
  features:        z.array(s(60)).max(20).default([]),
  integrations:    s(1000).default(''),
  cmsPreference:   s(60).default(''),

  // Step 3 — Page Specifications
  pages:           z.array(z.object({
    name:    s(100).default(''),
    type:    s(20).default('inner'),
    purpose: s(500).default(''),
  })).max(30).default([]),

  // Step 4 — Content & SEO
  contentReadiness:      z.record(z.string(), s(30)).default({}),
  contentResponsibility: s(200).default(''),
  contentDeadline:       s(30).default(''),
  copywritingNeeds:      s(1000).default(''),
  photographyNeeds:      s(1000).default(''),
  currentSeo:            s(1000).default(''),
  seoGoals:              s(1000).default(''),
  googleBusiness:        s(20).default(''),
  analytics:             s(20).default(''),
  domainStatus:          s(30).default(''),

  // Step 5 — Design & Brand
  visualStyles:    z.array(s(60)).max(8).default([]),
  referenceSites:  z.array(z.object({
    url:   s(500).default(''),
    notes: s(500).default(''),
  })).max(3).default([]),
  brandAssets:     s(1000).default(''),
  toneOfVoice:     z.array(s(60)).max(4).default([]),
  uploads:         z.array(z.object({
    base64:    z.string().max(6_000_000),
    mediaType: z.string(),
    label:     s(60).default(''),
  })).max(5).default([]),

  // Step 6 — Responsibilities & Access
  hostingResponsibility:    s(200).default(''),
  domainResponsibility:     s(200).default(''),
  thirdPartyAccess:         z.array(s(100)).max(10).default([]),
  legalPagesResponsibility: s(200).default(''),
  accessibilityLevel:       s(20).default(''),

  // Step 7 — Process & Expectations
  timeline:               s(200).default(''),
  revisionRounds:         s(100).default(''),
  approvalProcess:        s(500).default(''),
  decisionMakers:         s(500).default(''),
  postLaunchTraining:     s(200).default(''),
  postLaunchDocs:         s(200).default(''),
  maintenanceScope:       s(500).default(''),
  exclusions:             s(2000).default(''),
  changeRequestAwareness: z.boolean().default(false),

  // Step 8 — Budget & Final
  budgetRange:        s(60).default(''),
  budgetCurrency:     s(10).default('CHF'),
  launchDate:         s(30).default(''),
  referralSource:     s(200).default(''),
  additionalComments: s(2000).default(''),

  // Step 9 — E-commerce (conditional)
  ecommerceProductCount:    s(50).default(''),
  ecommerceProductTypes:    z.array(s(60)).max(5).default([]),
  ecommercePaymentGateways: z.array(s(60)).max(5).default([]),
  ecommerceShipping:        s(500).default(''),
  ecommerceInventory:       s(200).default(''),
  ecommerceImport:          s(200).default(''),

  // Meta
  designerSlug:    s(80).optional(),
});

module.exports = { generateSchema };
