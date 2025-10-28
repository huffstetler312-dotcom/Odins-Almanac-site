<!-- Please fill out the sections below. The Copilot coding agent will use these to generate a complete PR description. -->

## Summary

- One-line summary of the change:

## Related issues

- Fixes / relates to: # (issue number)

## What I changed

- Files changed and a short explanation for each change.

## How to test / validate

- Local validation commands I ran (or the agent should run):

  ```bash
  # Example:
  cd server && npm install && npm start
  mvn -q package
  npx eslint .
  ```

- Manual test steps (if applicable):

## Checklist

- [ ] Code builds and runs locally
- [ ] ESLint/linters run (if JS changed)
- [ ] No secrets were committed
- [ ] CI (if present) passes
- [ ] PR description includes required env vars or placeholders

## Risk, rollback, and notes

- Risk level (low/med/high):
- Rollback plan or mitigations:

If this change touches payments or sensitive flows, add `@team-payments` (or appropriate owner) as reviewer and include manual verification steps.
