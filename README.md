# AI Spend Audit

AI Spend Audit is a free web app concept for startup founders and engineering managers who want a fast, credible second opinion on whether they are overspending on AI tooling. The product is designed to deliver instant savings recommendations, then convert high-savings users into Credex leads.

This repository is being built as a 7-day submission for the Credex Web Development Intern assignment. The project currently has a verified pricing dataset, a deterministic audit engine, automated tests for the recommendation logic, a Day 3 interactive prototype for the spend-input and results flow, and a Day 4 backend path for saving audits and capturing leads.

## Status

Current milestone: Day 4 backend and lead-capture flow completed.

## Planned stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Backend/API: Supabase or a lightweight serverless backend
- Email: Resend
- Deployment: Vercel
- Testing: Node test runner for the audit engine right now, with broader app testing to follow

## Local run

Install dependencies:

`npm install`

Run the API server in one terminal:

`npm run api`

Run the frontend in another terminal:

`npm run dev`

Optional email env vars can be copied from `.env.example`.

## Completed so far

- Assignment requirements translated into a concrete build checklist
- Git-ready project root structure created
- Required root documentation files started
- Architecture and implementation direction documented
- Official pricing data collected and documented for the supported tools
- A normalized pricing catalog added in `src/data/pricing.js`
- A deterministic audit engine added in `src/lib/audit.js`
- Automated tests added for alias resolution, downgrade logic, alternative recommendations, honest keep cases, and savings aggregation
- A Vite React app scaffold added with an interactive spend form and results dashboard in `src/App.jsx`
- Local draft persistence added so the form state survives page reloads
- A first visual results page added to expose per-tool recommendations and total savings
- A Day 4 Express API server added in `server.js`
- Audit snapshots can now be saved before lead capture
- Lead capture now happens after value is shown, with honeypot and basic rate limiting
- Transactional email is wired to work when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured

## Next step

Day 5 will focus on AI-generated summaries, shareable public result pages, and the public-facing audit URL flow.
