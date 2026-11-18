# ResultTrace project write-up

## What and why

ResultTrace is a focused document-comparison tool. It helps someone inspect agreement or differences between party figures they have reviewed in two sources for the same Nigerian election, contest and polling unit. Its central design choice is to separate transcription, identity review and deterministic comparison.

## How it works

A responsive Next.js application stores the original images and comparison records in browser IndexedDB. JPEG/PNG/WebP inputs are checked by type, size and signature; browser decoding catches invalid images. A compressed preview makes source review practical. The original’s SHA-256 hash is recorded for byte identification.

Each source has independent identifiers and party rows. Identifiers must be known and equal after case/whitespace normalization. Missing party counts remain unknown; they never become zero. Human confirmation is required, and subsequent edits clear it. Party names are not fuzzily matched. Audit snapshots preserve before/after entered values and confirmation states.

Reports show signed deltas, both source previews, per-source identities, timestamps, provenance, review notes and original fingerprints. JSON includes current original images and the audit history. Print styling produces a concise PDF through the browser.

## AI and tool disclosure

**Yes, AI was used.** Codex assisted with architecture, application code, synthetic fixture code, tests, styling and documentation. GitHub and Vercel integrations were used for repository and deployment operations. No attempt is made to conceal AI assistance.

An optional **OpenAI Responses API** adapter targets `gpt-4.1-mini` by default, after consulting current official vision/model/structured-output documentation. It uses a server-only credential, strict schema and Zod validation, bounded input and a 25-second provider timeout. Suggested rows remain editable and unconfirmed. Images are treated as data, not instructions. Unreadable values are null. The no-key path is tested; **no successful live extraction is claimed**. Provider behavior tests are mocked.

No image-generation model was used: clearly synthetic sample forms are drawn using browser canvas. No real election result data, INEC logo or official seal is included.

## Engineering choices and tradeoffs

- Manual path first: deterministic, credential-free and fully demonstrable.
- Local-only records reduce service dependencies and unnecessary personal-data collection, but require users to download important reports.
- No service worker: editing works offline in an open page, but a fresh offline load is not promised.
- No silent abbreviation merging: humans explicitly reconcile labels.
- No third-party font downloads: system typography keeps the application self-contained.
- No project-wide license selected without organizer/team approval.

## What is verified and what remains

See `VERIFICATION.md` for actual checks. Deployment was attempted in the connected Vercel team and denied with HTTP 403; no public deployment is claimed. The team still needs a verified live URL and a presentation video of at most three minutes. This build does not validate eligibility against the organizer’s actual hackathon time window.

**Difference detected does not establish fraud, manipulation, or legal validity.**
