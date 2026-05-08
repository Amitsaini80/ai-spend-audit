# TESTS

Automated test inventory will be maintained here as tests are added.

## Implemented automated tests

- `src/lib/audit.test.js` — verifies assignment-era plan aliases still resolve against current vendor pricing
- `src/lib/audit.test.js` — covers same-vendor downgrade logic for undersized Claude Team usage
- `src/lib/audit.test.js` — covers GitHub Copilot Business to Individual downgrade for a solo developer
- `src/lib/audit.test.js` — covers cheaper cross-vendor recommendation when fit stays comparable
- `src/lib/audit.test.js` — covers honest `keep` output when a plan is already efficient
- `src/lib/audit.test.js` — covers savings aggregation into monthly and annual totals

## How to run

Run:

`npm test`
