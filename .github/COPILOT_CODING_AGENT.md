# Copilot Coding Agent — Onboarding & Repository Guide

This file provides repository-specific instructions to help an automated Copilot coding agent (and contributors) work safely and effectively in this repository.

Keep this document short and actionable. If something here becomes out of date, update it alongside the code change.

## Repository overview

- Primary languages/tools: Node.js (server), static client, and Maven (Java site build).
- Layout (important folders):
  - `server/` — Node/Express server (runs the API and Stripe routes).
  - `client/public/` — Static frontend files.
  - `pom.xml` — Maven project used to build site artifacts in `target/`.
  - `index.js` — top-level Node entry used for local convenience scripts.

## Quick run & build (developer commands)

Use these commands to quickly run or build the project locally. Run them from the repository root unless noted.

- Install dependencies (server):

  ```bash
  cd server
  npm install
  npm start   # runs `node index.js`
  # server listens on the port configured in server/index.js (default: 3000 or as configured)
  ```

- Static client: open `client/public/index.html` in the browser for a local prototype (no build step).

- Maven site build (produces files under `target/site`):

  ```bash
  mvn -q package
  ```

## Tests & linters

- There are no automated tests in the repository currently.
- ESLint exists as a dev dependency in the root `package.json`. Run linting from root if you add JS files:

  ```bash
  # from repository root
  npx eslint .
  ```

If you add tests, please include a short `npm test` script or a `maven-surefire-plugin` config so the agent can run them automatically.

## CI / workflows

- The repository already contains `.github/workflows/azure-webapp.yml`. Any changes that affect deployment should include the CI impact in the PR description.

## Sensitive configuration & secrets

Do not commit secrets or private keys. Common environment values the agent must not write into code directly:

- `STRIPE_SECRET_KEY` — used by `server/routes/stripe.js`.
- `STRIPE_*_PRICE_ID` — price IDs referenced by the Stripe routes (`STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`, etc.).
- `APP_BASE_URL` — canonical base URL used for success/cancel redirects.

If a change requires secrets, the agent should add a descriptive placeholder and instructions in the PR describing required environment variables and how to set them in the target environment/CI.

## What the agent is allowed to do

- Create small, focused changes that are self-contained (bug fixes, small features, docs, tests).
- Open a draft PR for larger work and mark it as WIP; include a short description of next steps.
- Run local build/test commands (the ones listed above) and report the results in the PR.

## What the agent should NOT do

- Do not commit secrets or hard-coded API keys.
- Do not modify deployment or infra files (CI, production deployment) without at least one human reviewer.
- Do not publish new packages or bump versions that affect production deployments without a maintainer sign-off.

## PR conventions & requirements

For the agent-created PRs, include the following in the PR description:

1. Short summary of the change.
2. Files changed and why.
3. Commands run locally (build/lint) and their results.
4. Any new environment variables required and sample placeholder values.
5. Risks and rollback instructions if applicable.

If the change touches Stripe or payment flows, add `@team-payments` (or the repo's payment owners) as reviewer and include manual test steps.

## Local validation checklist (agent should run these automatically when applicable)

- Run `cd server && npm install && npm start` and verify server starts successfully.
- Run `mvn -q package` and verify the Maven build completes without errors.
- Run `npx eslint .` if JavaScript/Node files changed.

## Repository-specific assumptions (inferred)

- The Express server in `server/` is the primary runtime for any changes touching backend code.
- The client is primarily static and served from `client/public/` or from the server `public/` directory in production.

If these assumptions are wrong or change, update this file immediately.

## Contact / maintainers

If unsure, the agent should request a human reviewer. See `GITHUB_TOKEN_AND_PUSH_GUIDE.md` for push/PR guidance for humans.

---
Small, actionable docs like this help reduce iterating on trivial PRs. Keep it updated.
