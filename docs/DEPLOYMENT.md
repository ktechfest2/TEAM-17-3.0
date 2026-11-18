# Deployment status and exact next steps

The app passes a local Next.js production build. No database or environment variable is required for the manual demo.

## Attempted deployment

- Intended team: `elijah-ntans-projects` (`team_nfyBQUenoynXgL0eo3zGJUQM`).
- Intended project: `resulttrace`.
- Intended source: `ktechfest2/TEAM-17-3.0`, branch `codex/resulttrace`.
- Result: **HTTP 403 forbidden** — “You don't have permission to create the project.”
- No authenticated local Vercel CLI configuration/token was available for a fallback.
- No deployment URL is invented or claimed verified.

## Resolve and deploy

Use a Vercel account/team role that can create projects, and grant its GitHub integration access to the assigned repository. In the Vercel dashboard, import **ktechfest2/TEAM-17-3.0**, choose **Next.js**, use the repository root, and select **codex/resulttrace** as the production branch. Leave optional OCR disabled. Deploy and open the production URL in a signed-out browser.

Alternatively, from this repository with an authorized Vercel login:

```sh
npx vercel login
npx vercel link --project resulttrace --scope elijah-ntans-projects
npx vercel deploy --prod --scope elijah-ntans-projects
```

Choose the intended team/project in the link prompts. If linking cannot create the project, resolve team permissions first. Do not create a different GitHub repository.

## Public verification

1. Open the live URL without an authenticated Vercel session.
2. Run the synthetic +100 flow, including both human confirmations.
3. Refresh and reopen from Saved comparisons on that same browser/origin.
4. Check both images and the disclaimer in print preview.
5. Confirm `/api/extract` gracefully reports unavailable with no credentials.
6. Record the actual URL and deployed commit in README and the submission checklist.

Do not transfer localhost IndexedDB expectations to the live URL: storage is per origin. Do not enable paid public extraction without rate/access controls and a provider budget.
