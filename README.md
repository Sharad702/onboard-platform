# OnboardEasy

**Client onboarding, proposals, contracts & payments for Indian freelancers and small agencies.**

- **Name:** OnboardEasy  
- **Target users:** Indian freelancers, small agencies (e.g. vibe-coding studios)  
- **Tech:** Next.js 14 (App Router), Supabase, Tailwind, Razorpay, AI (Claude/Grok), Resend, Slack/Telegram/WhatsApp

---

## Features (full launch)

| Area | Features |
|------|----------|
| **Freelancer dashboard** | Clients list, add/edit client, per-client view: checklist, milestones, progress bar, analytics (revenue forecast, win rate, avg project value) |
| **AI core** | Proposal generator (brief → PDF), custom checklist + contract (GST, milestones), auto-invoicing (GST + Razorpay links) |
| **Client portal** | Magic link (no password), progress view, file upload, e-sign contract, payments, feedback |
| **Notifications** | Slack/Telegram reminders, WhatsApp Business API (reminders, forms, payments) |
| **Payments** | Razorpay: payment links, invoices, refunds, **SaaS subscriptions** (OnboardEasy plans) |
| **Offboarding** | Project end → auto feedback form + testimonial request |
| **Admin** | Subscription management (Razorpay Subscriptions) |

---

## Pricing at launch

| Plan | Price | Limits |
|------|--------|--------|
| **Free** | ₹0 | 3 clients/month |
| **Basic** | ₹999/mo (~$12) | Core features |
| **Pro** | ₹1999/mo (~$24) | + WhatsApp + Client portal |
| **Agency** | ₹3999/mo (~$48) | Multi-user + analytics |

---

## Tech stack

- **Framework:** Next.js 14+ (App Router) — frontend + API in one repo  
- **Database:** Supabase (PostgreSQL, Auth, Storage)  
- **AI:** Claude 3.5 Sonnet or Grok + LangChain for flows  
- **Payments:** Razorpay (invoices, payment links, subscriptions)  
- **Notifications:** Slack webhooks, Telegram Bot API, WhatsApp Business API (Meta)  
- **Auth:** Supabase Auth (freelancer), magic links (client portal)  
- **Storage:** Supabase Storage or AWS S3  
- **Hosting:** Vercel  
- **Email:** Resend / React Email  
- **UI:** Tailwind CSS, Recharts for analytics  

**Rough monthly cost at launch:** ₹2000–4000 (scales with usage).

---

## 8-week build plan

| Week | Focus |
|------|--------|
| **1–2** | Foundation: Next.js + Supabase (auth, schema), dashboard skeleton (clients list, add client), basic client portal (magic link) |
| **3–4** | AI core + docs: proposal, checklist, contract, invoice prompts; Razorpay (test): payment links, invoices, subscriptions; Google Docs templates; PDF (react-pdf / pdf-lib) |
| **5** | Client portal full: progress tracker, file upload, e-sign (checkbox + timestamp), payment buttons, magic link email |
| **6** | Notifications: Slack/Telegram, WhatsApp Business API, automated flows (e.g. milestone due → multi-channel remind) |
| **7** | Polish: analytics dashboard (Recharts), feedback/offboarding flow, responsive (mobile-first) |
| **8** | Testing + launch: E2E (real client flow), security (rate limit, validation), landing page, Razorpay subscription for SaaS |

---

## Project structure (current)

```
src/
  app/
    page.tsx                 # Landing
    login/                   # Magic link sign-in
    auth/callback/           # OAuth/magic link callback
    auth/signout/
    dashboard/               # Freelancer dashboard
      page.tsx               # Clients list
      analytics/
      clients/
        new/                 # Add client form
        [id]/                # Client detail, edit, proposal, checklist, invoice
        [id]/projects/
          new/
          [projectId]/       # Project + milestones, progress bar
    portal/
      link/[clientId]/       # Generate & send magic link
      view/                  # Client portal (token in query)
      invalid|expired/
    api/
      portal/magic-link/     # POST: create portal token
  lib/
    supabase/                # client, server, middleware, service (for portal token)
    utils.ts
supabase/
  migrations/
    001_initial_schema.sql   # profiles, clients, projects, milestones, tokens, invoices, subscriptions, RLS
```

---

## Getting started

1. **Clone and install**
   ```bash
   cd "onboard ai"
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In SQL Editor, run `supabase/migrations/001_initial_schema.sql`.
   - In Authentication → URL Configuration, set Site URL and Redirect URLs (e.g. `http://localhost:3000`, `http://localhost:3000/auth/callback`).
   - Copy project URL and anon key (and service role key for portal token validation).

3. **Env**
   ```bash
   cp .env.example .env.local
   ```
   Fill at least:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for client portal token lookup)
   - **Telegram (optional):** For workspace Telegram bot, set `NEXT_PUBLIC_APP_URL` to your public app URL (e.g. `https://yourapp.vercel.app`). On Vercel, `VERCEL_URL` is set automatically.
   - **Telegram local (no ngrok):** Run `npm run telegram:poll` in a separate terminal to receive bot updates locally. Add the bot in workspace settings first, then send `/start` to the bot on Telegram.

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Sign in with email (magic link), then use Dashboard → Add client → Client detail → Get client portal link.

---

## Done in Week 1–2 (this repo)

- [x] Next.js 14 + Tailwind + TypeScript + ESLint  
- [x] Supabase: schema (profiles, clients, projects, milestones, client_portal_tokens, invoices, subscriptions), RLS, trigger for new user → profile  
- [x] Auth: magic link login, callback, sign out, dashboard protected  
- [x] Freelancer dashboard: clients list, add client, edit client, client detail with projects & quick actions (proposal, checklist, invoice placeholders)  
- [x] Projects: create project, project detail with milestones and progress bar  
- [x] Client portal: generate magic link (API), portal view by token (service-role validation), invalid/expired pages  
- [x] Placeholder routes: analytics, proposal, checklist, invoice (to be implemented in Week 3–4)  

Next: **Week 3–4** — AI prompts, Razorpay (test), PDF generation, Google Docs templates.
# onboard-platform
# onboard-platform
