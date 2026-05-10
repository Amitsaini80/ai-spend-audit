# DEVLOG

## Day 1 - 2026-05-07
**Hours worked:** 3
**What I did:** Read the full assignment closely, translated it into a concrete execution plan, chose an initial stack direction, created the repository root files, drafted the architecture and data flow, and started the pricing research scaffold. I also identified the highest-risk requirements early: pricing accuracy, shareable public result pages, user interviews, and maintaining real progress across at least 5 distinct calendar days.
**What I learned:** The assignment is weighted as much toward product judgment and entrepreneurial thinking as it is toward coding. The audit logic needs to be finance-literate and explainable, so the recommendation engine should be deterministic and strongly tied to sourced pricing data.
**Blockers / what I'm stuck on:** Official pricing data collection will take careful manual verification because every number must trace back to a vendor source. I also still need to finalize whether the backend will be Supabase or another lightweight hosted option based on setup friction.
**Plan for tomorrow:** Build the pricing model and audit engine first, define recommendation rules, and start the required automated tests in parallel.

## Day 2 - 2026-05-08
**Hours worked:** 4
**What I did:** Verified current pricing against official vendor sources for Cursor, GitHub Copilot, Claude, ChatGPT, OpenAI API, Anthropic API, Gemini, and Windsurf. Updated `PRICING_DATA.md` with dated source links and noted naming changes where the assignment brief is older than the current pricing pages. Built the first deterministic audit engine in `src/lib/audit.js`, added a normalized plan catalog in `src/data/pricing.js`, wrote automated tests covering alias resolution, downgrade logic, cheaper alternatives, honest keep cases, and savings aggregation, ran the tests locally, and committed the Day 2 work.
**What I learned:** The market changed materially between the assignment brief and submission week. ChatGPT Team has been renamed to Business, and some vendors now mix flat seat pricing with usage-based add-ons or flexible credits. That means the audit engine needs to separate straightforward seat-price comparisons from custom or usage-based plans instead of pretending they are all equally comparable.
**Blockers / what I'm stuck on:** The repo still does not have the frontend app scaffold, spend-input form, or results UI, so the audit engine is only wired as a standalone module right now. Gemini and API-direct pricing also need more nuanced workload normalization later if I want richer recommendations without becoming hand-wavy.
**What I did not do yet:** I did not build the frontend flow, local persistence, backend, email capture, AI summary, shareable result pages, CI, or deployment today.
**Plan for tomorrow:** Start the actual app scaffold and spend-input flow, connect persistent local state, and render the first real audit results page using the Day 2 engine.

## Day 3 - 2026-05-09
**Hours worked:** 4
**What I did:** Installed the frontend dependencies, turned the repo into a runnable Vite React app, and built the first real Day 3 prototype UI. Added a persistent spend-input form in `src/App.jsx`, connected it to the Day 2 audit engine, and rendered an on-screen results view with total monthly savings, annual savings, and per-tool recommendation cards. Also added the initial app styling in `src/styles.css`, Vite entry files, and basic `dev`, `build`, and `preview` scripts.
**What I learned:** The audit engine becomes much easier to reason about once it is exposed through a simple interactive form instead of staying as a standalone module. Small frontend details, like how plan options react to tool changes and how draft persistence behaves, matter a lot for making the prototype feel real.
**Blockers / what I'm stuck on:** This is still a client-only prototype. There is no backend, lead capture, email workflow, AI-generated summary, shareable result URL, or Open Graph layer yet. The current UI is also in JavaScript React files even though TypeScript remains the longer-term preference.
**What I did not do yet:** I did not implement the backend, local database storage, rate limiting, transactional email, AI summary generation, result sharing, CI, deployment, or screenshots today.
**Plan for tomorrow:** Start the backend path, choose the data store, add lead capture after the results view, and prepare the project for the AI summary feature.

## Day 4 - 2026-05-10
**Hours worked:** 4
**What I did:** Added the first backend path for the project. Installed server dependencies, created `server.js` with `POST /api/audits` and `POST /api/leads`, added file-backed persistence for audit and lead records, wired in a honeypot field and basic rate limiting, and added optional transactional email support through Resend when environment variables are present. On the frontend, I connected the results view to the backend with a post-value lead capture flow in `src/App.jsx`, added API helpers in `src/lib/api.js`, and updated the UI so users can save an audit first and then submit their email after seeing the result.
**What I learned:** The product flow starts feeling much more credible once the audit can be saved and tied to a lead record instead of existing only in local state. I also learned that even a minimal abuse-protection layer changes the UI and API contract enough that it is worth designing early instead of bolting on later.
**Blockers / what I'm stuck on:** The persistence layer is file-backed for now, which is good enough for local development but still needs to be replaced or mirrored with a hosted backend for the final deployed submission. Resend wiring is in place, but I still need real environment variables to test a full send end-to-end. Public shareable audit pages and AI-generated summaries are also still missing.
**What I did not do yet:** I did not implement the final hosted database, public share URLs, Open Graph previews, AI summary generation, CI, or deployment today.
**Plan for tomorrow:** Add the AI-generated summary path, start generating public audit pages from saved records, and prepare the project for shareable result URLs.

## Day 5 - YYYY-MM-DD
**Hours worked:** X
**What I did:** ...
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...

## Day 6 - YYYY-MM-DD
**Hours worked:** X
**What I did:** ...
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...

## Day 7 - YYYY-MM-DD
**Hours worked:** X
**What I did:** ...
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...
