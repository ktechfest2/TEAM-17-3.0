# Verification record

Verified locally on 2026-11-19 with Node.js 22.23.2, Next.js 16.4.6, Windows and installed Chrome in headless mode. Browser tests use a **390 × 844** viewport against a production build. Desktop screenshots use 1440 × 1000.

## Checks

- `npm run lint`: passed, no warnings. Browser-local, already-compressed evidence images intentionally use native `img` rather than an external image optimizer.
- `npm run typecheck`: passed.
- `npm test`: **39 tests** covering comparator, identifier conflicts/unknown placeholders, normalization, missing values, duplicates, numeric bounds, image validation and optional extraction boundaries.
- `npm run build`: passed, all application routes built.
- `npm run test:e2e`: **8 browser tests**, including a fresh upload/manual-entry path and keyboard confirmation.
- Automated axe checks on landing, review and report screens: no detected WCAG A/AA violations in the selected rules. This is not a certification or a substitute for screen-reader/user testing.
- Desktop landing/report and narrow-mobile review screenshots inspected. A synthetic print-to-PDF sample is included.
- npm installation audit: zero reported vulnerabilities at installation time; this is not an ongoing security guarantee.

## Acceptance mapping

| Requirement             | Evidence                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Matching documents      | Unit and browser tests return Match after both confirmations                           |
| 85 vs 185               | Unit, fresh-upload and demo browser tests display signed +100                          |
| Mismatched polling unit | Browser test blocks comparison; unit tests cover every identifier field                |
| Unreadable number       | Unit/browser tests show Insufficient evidence; null is never zero                      |
| No AI key               | Browser test receives unavailable extraction response then completes manually          |
| Refresh and reopen      | Browser test resumes EC8A draft after reload and reopens completed local report        |
| Bad file/count input    | Unit validation, forged PNG browser upload and negative-count browser test             |
| Mobile and keyboard     | 390px flow has no horizontal page overflow; keyboard skip and confirmation tested      |
| Optional provider       | Mocked structured-output/refusal/failure tests; no live credential-backed call claimed |
| Offline draft           | Open-page offline edit saved, then observed after reconnect and refresh                |

## Known verification limits

No public deployment could be tested: Vercel denied project creation with HTTP 403. No real Android hardware, screen reader, live OCR accuracy benchmark or measured three-minute user study was run. Camera capture behavior is browser/device dependent. No fresh offline page-load support, cloud sync, certified audit trail or authenticity determination is claimed.
