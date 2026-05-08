# AI Spend Audit

AI Spend Audit is a free web app concept for startup founders and engineering managers who want a fast, credible second opinion on whether they are overspending on AI tooling. The product is designed to deliver instant savings recommendations, then convert high-savings users into Credex leads.

This repository is being built as a 7-day submission for the Credex Web Development Intern assignment. The project currently has a verified pricing dataset, a first deterministic audit engine, and automated tests for the recommendation logic, with the frontend flow still to be built.

## Status

Current milestone: Day 2 completed.

## Planned stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Backend/API: Supabase or a lightweight serverless backend
- Email: Resend
- Deployment: Vercel
- Testing: Node test runner for the audit engine right now, with broader app testing to follow

## Completed so far

- Assignment requirements translated into a concrete build checklist
- Git-ready project root structure created
- Required root documentation files started
- Architecture and implementation direction documented
- Official pricing data collected and documented for the supported tools
- A normalized pricing catalog added in `src/data/pricing.js`
- A deterministic audit engine added in `src/lib/audit.js`
- Automated tests added for alias resolution, downgrade logic, alternative recommendations, honest keep cases, and savings aggregation

## Next step

Day 3 will focus on the actual app scaffold, spend-input form, local state persistence, and the first real results page wired to the audit engine.
