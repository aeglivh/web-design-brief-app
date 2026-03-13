'use strict';

const { z } = require('zod');

const ratesSchema = z.object({
  page_rates: z.object({
    landing:    z.number().min(0),
    inner:      z.number().min(0),
    blog:       z.number().min(0),
    ecommerce:  z.number().min(0),
  }),
  addon_rates: z.object({
    contactForm:    z.number().min(0),
    gallery:        z.number().min(0),
    newsletter:     z.number().min(0),
    seo:            z.number().min(0),
    booking:        z.number().min(0),
    ecommerce:      z.number().min(0),
    livechat:       z.number().min(0),
    multilanguage:  z.number().min(0),
    blog:           z.number().min(0),
    copywriting:    z.number().min(0),
    photography:    z.number().min(0),
    maintenance:    z.number().min(0),
    training:       z.number().min(0),
  }),
  hourly_rate: z.number().min(0),
  multipliers: z.object({
    simple:   z.number().min(0),
    moderate: z.number().min(0),
    complex:  z.number().min(0),
  }),
  currency: z.string().max(10).default('CHF'),
  vat_rate: z.number().min(0).max(100).default(0),
});

module.exports = { ratesSchema };
