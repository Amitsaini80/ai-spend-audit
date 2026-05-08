# PRICING_DATA

Verified: `2026-05-08`

## Notes and assumptions

- The assignment brief uses a few older names. I mapped them to current vendor pricing where the vendor has renamed the plan:
- `ChatGPT Team` is now `ChatGPT Business` as of August 29, 2025, per OpenAI Help.
- `Cursor Business` is effectively the current `Cursor Teams` self-serve team tier.
- For custom or usage-based plans, the audit engine treats those as manual-review or conditional-comparison cases instead of pretending there is a universal flat monthly equivalent.
- For ChatGPT Business, I used the current official Help Center pricing because it reflects the April 2, 2026 seat-price update more clearly than the public pricing page snippet.

## Cursor

- Hobby: $0/month — https://cursor.com/pricing — verified 2026-05-08
- Pro: $20/month — https://cursor.com/pricing — verified 2026-05-08
- Teams (`Business` equivalent for this assignment): $40/user/month — https://cursor.com/pricing — verified 2026-05-08
- Enterprise: custom — https://cursor.com/pricing — verified 2026-05-08

## GitHub Copilot

- Individual (`Copilot Pro`): $10/user/month — https://docs.github.com/copilot/managing-copilot/managing-copilot-as-an-individual-subscriber/billing-and-payments/about-billing-for-individual-copilot-plans — verified 2026-05-08
- Business: $19/user/month — https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/billing/organizations-and-enterprises — verified 2026-05-08
- Enterprise: $39/user/month — https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/billing/organizations-and-enterprises — verified 2026-05-08

## Claude

- Free: $0/month — https://claude.com/pricing — verified 2026-05-08
- Pro: $20/month billed monthly — https://claude.com/pricing and https://support.anthropic.com/en/articles/8325610-how-much-does-claude-pro-cost — verified 2026-05-08
- Max 5x: $100/month — https://claude.com/pricing and https://support.anthropic.com/en/articles/11049744-how-much-does-the-max-plan-cost — verified 2026-05-08
- Max 20x: $200/month — https://claude.com/pricing and https://support.anthropic.com/en/articles/11049744-how-much-does-the-max-plan-cost — verified 2026-05-08
- Team standard seat: $25/user/month billed monthly — https://claude.com/pricing — verified 2026-05-08
- Enterprise: $20/seat plus usage at API rates — https://claude.com/pricing — verified 2026-05-08
- API direct reference rates:
  - Claude Sonnet 4: $3/MTok input, $15/MTok output — https://www.anthropic.com/pricing — verified 2026-05-08
  - Claude Haiku 3.5: $0.80/MTok input, $4/MTok output — https://www.anthropic.com/pricing — verified 2026-05-08

## ChatGPT

- Plus: $20/month — https://openai.com/chatgpt/pricing/ — verified 2026-05-08
- Business (`Team` rename): $25/user/month billed monthly, $20/user/month billed annually — https://help.openai.com/en/articles/8792828 — verified 2026-05-08
- Enterprise: custom pricing — https://openai.com/chatgpt/pricing/ — verified 2026-05-08
- API direct reference rates:
  - GPT-5.4: $2.50/1M input tokens, $15/1M output tokens — https://openai.com/api/pricing/ — verified 2026-05-08
  - GPT-5.4 mini: $0.75/1M input tokens, $4.50/1M output tokens — https://openai.com/api/pricing/ — verified 2026-05-08

## Anthropic API direct

- Claude Sonnet 4: $3/MTok input, $15/MTok output — https://www.anthropic.com/pricing — verified 2026-05-08
- Claude Haiku 3.5: $0.80/MTok input, $4/MTok output — https://www.anthropic.com/pricing — verified 2026-05-08

## OpenAI API direct

- GPT-5.4: $2.50/1M input tokens, $15/1M output tokens — https://openai.com/api/pricing/ — verified 2026-05-08
- GPT-5.4 mini: $0.75/1M input tokens, $4.50/1M output tokens — https://openai.com/api/pricing/ — verified 2026-05-08

## Gemini

- Google AI Pro: $19.99/month (US pricing) — https://gemini.google/subscriptions/ — verified 2026-05-08
- Google AI Ultra: $249.99/month (US pricing) — https://gemini.google/subscriptions/ — verified 2026-05-08
- Gemini API: official pricing lives at https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-08

## Additional tool chosen

- Windsurf
- Free: $0/month — https://windsurf.com/pricing — verified 2026-05-08
- Pro: $20/month — https://windsurf.com/pricing — verified 2026-05-08
- Teams: $40/user/month — https://windsurf.com/pricing — verified 2026-05-08
- Enterprise: custom — https://windsurf.com/pricing — verified 2026-05-08

## How Day 2 uses this data

- Self-serve seat plans are compared directly in the audit engine.
- Enterprise and API plans are marked as custom or usage-based.
- The Day 2 audit engine only makes automatic savings recommendations when the comparison is defensible from public self-serve pricing plus the user’s own reported monthly spend.
