# debrieft

A white-label platform for web designers: client intake forms, AI-powered briefs, instant quotes, and contract generation.

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS 4, React Router, React Hook Form + Zod
- **Backend**: Vercel Serverless Functions (Node.js, `/api/` directory)
- **Database**: Supabase (Postgres + Auth + Row Level Security)
- **AI**: Anthropic Claude API (brief generation, quote scoping, contract drafting)
- **Email**: Resend
- **Hosting**: Vercel (CI/CD from GitHub)
- **Domain**: debrieft.app (Hostinger DNS → Vercel)

## Branch Strategy

- `main` — the app (login, dashboard, intake form, brief/quote/contract)
- `waitlist` — landing page served at debrieft.app (Preview environment in Vercel)

## Project Structure

```
src/
  app/           — router.tsx (entry point, route definitions)
  assets/        — SVGs (favicon, app icon)
  components/    — shared UI (Button, Input, Alert, ColorPicker, Spinner, layout)
  features/
    auth/        — login/signup, Supabase auth hook
    brief/       — brief display components
    contract/    — contract modal, generation hook
    dashboard/   — main dashboard page, brief list, brief modal, hooks
    intake/      — multi-step client intake form (10 steps)
    quote/       — quote table, quote modal
    settings/    — branding form, branding preview, rates form
    splash/      — splash page (currently unused, root redirects to /login)
  lib/           — api helpers, theme, types, utilities
  styles/        — globals.css (Tailwind imports, CSS vars, animations)

api/
  _helpers.js    — barrel export for shared utilities
  _internal/     — cors, auth helpers
  _prompts/      — Claude prompts (brief, quote, contract)
  _schemas/      — Zod validation schemas
  _templates/    — email HTML templates
  designer.js    — CRUD for designer profile/branding
  briefs.js      — list/delete briefs
  generate.js    — intake form submission → Claude brief generation
  extract.js     — extract summary from brief text
  quote.js       — generate quote from brief
  contract.js    — generate/save contract
  rates.js       — designer hourly rates + pricing
  send-email.js  — send emails via Resend
```

## Routes

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/` | Root | No | Redirects to `/login` or `/dashboard` |
| `/login` | LoginPage | No | Email/password sign in + sign up |
| `/dashboard` | DashboardPage | Yes | Briefs list, branding settings, rates |
| `/studio/:slug` | IntakeFormPage | No | Public client intake form (branded) |

## Key Flows

### Client Intake → Brief
1. Client visits `/studio/{slug}` (public)
2. Fills out 10-step form (business goals, scope, pages, content, design, etc.)
3. On submit → `POST /api/generate` → Claude generates structured brief
4. Brief saved to `briefs` table, designer notified via email (Resend)

### Brief → Quote → Contract
1. Designer views brief in dashboard → clicks "Generate Quote"
2. `POST /api/quote` → Claude scopes work using designer's rates
3. Quote attached to brief → designer clicks "Generate Contract"
4. `POST /api/contract` → Claude drafts contract from quote + brief

### Branding
- Designer configures: studio name, logo, accent color, form background, dashboard colors, fonts
- Settings saved via `PUT /api/designer`
- Intake form dynamically loads branding (colors, fonts via Google Fonts)
- Live preview in dashboard settings tab

## Database (Supabase)

Three tables: `designers`, `rates`, `briefs` — all with RLS enabled.
- `designers` — public read (for intake form branding), owner write
- `rates` — owner only
- `briefs` — owner only (service role inserts from API)

## Environment Variables (Vercel)

| Variable | Used by |
|----------|---------|
| `VITE_SUPABASE_URL` | Frontend (client auth) |
| `VITE_SUPABASE_ANON_KEY` | Frontend (client auth) |
| `SUPABASE_URL` | API (server-side) |
| `SUPABASE_SERVICE_KEY` | API (server-side, bypasses RLS) |
| `ANTHROPIC_API_KEY` | API (Claude calls) |
| `RESEND_API_KEY` | API (email sending) |

## Development

```bash
npm run dev        # starts both Vite + API dev server
npm run dev:ui     # Vite only
npm run dev:api    # API dev server only
npm run build      # production build
```

Requires `.env` with the above variables for local development.

## Known Quirks

- Tailwind CSS 4 spacing classes (mb-8, etc.) don't work reliably — use inline styles: `style={{ marginBottom: 32 }}`
- Animated border glow on waitlist page uses JS `requestAnimationFrame` to animate a `--glow-angle` CSS variable on a `conic-gradient` (`@property` CSS animation doesn't work with Tailwind 4 / Vite)
- Google Fonts for branding are loaded dynamically via injected `<link>` tags (not statically imported)
- API responses for `/api/designer` use `Cache-Control: no-store` to prevent stale branding data
