# Instructions for Claude Code on jespermakes.com

You are Claude Code working on jespermakes.com. You own the full development cycle: code, test, push, merge, verify. There is no separate deploy agent — what you ship is what goes live.

You do not improvise, you do not take shortcuts, and you follow the rules in this file without exception.

## Session-start protocol (MANDATORY)

At the start of every new session — especially after `/new` or any context reset — do this BEFORE taking any other action:

1. Run `git status`
2. Run `git fetch origin`
3. Run `git log --oneline -5` (local) and compare to `git log origin/main --oneline -5`
4. Confirm you are on `main` and not behind origin (and not dirty)
5. Report the full output to Jesper before proceeding

Do NOT skip this. Do NOT summarize it to "looks good" without showing the output. The whole point is that you don't know what happened in previous sessions — the git log does. If the working directory is dirty or local is behind/ahead of origin in a way you didn't expect, surface it and ask before doing anything else.

## Development workflow (MANDATORY)

Every change — feature, fix, doc, anything — goes through a feature branch and a Vercel preview before it touches production.

### 1. Branch off main

```bash
git checkout main
git pull origin main
git checkout -b feature/<description>
```

Branch names are lowercase, hyphenated, and describe the change: `feature/box-joint-spacing-fix`, `feature/workbench-comments`, `fix/login-redirect`, etc.

### 2. Do the work

Make the change. Commit as you go with clear messages.

### 3. Preflight: typecheck + build

Before pushing, both must pass clean from the repo root:

```bash
npx tsc --noEmit
npm run build
```

If either fails, fix it. Do not push, do not merge, do not deploy with TypeScript errors. Vercel runs the same build and will fail the preview if you skip this — better to catch it locally than waste a CI cycle.

### 4. Push the branch

```bash
git push origin feature/<description>
```

### 5. Wait for the Vercel preview

Vercel auto-builds a preview from every pushed branch. Wait ~60 seconds, then report the preview URL so it can be checked:

```
https://jespermakes-website-git-feature-<description>-jespermakes.vercel.app
```

If the build fails on Vercel, fix it on the branch and push again. Do NOT merge until the preview build is green.

### 6. Merge to main

Once the preview build passes:

```bash
git checkout main
git pull origin main
git merge feature/<description>
git push origin main
```

Vercel auto-deploys production from `main`. Pushing to main IS the deploy.

### 7. Postflight: smoke-test production

Wait ~90 seconds after pushing to main for the production deploy to finish, then verify the homepage is up:

```bash
curl -o /dev/null -s -w "%{http_code}\n" https://jespermakes.com/
```

It must return 200. If it doesn't, alert Jesper immediately with the URL and status code. Do not attempt to "fix" it without confirmation.

If `./scripts/postflight.sh` exists in the repo, run that instead — it covers more URLs.

### 8. Clean up the branch

```bash
git branch -d feature/<description>
git push origin --delete feature/<description>
```

## Emergency deploys

If there's a genuine emergency where you need to bypass the preview-first flow (security issue, site completely down), you may push a hotfix directly to `main` — but only after:

1. Asking Jesper in plain language: "This bypasses the preview-first workflow. Are you sure?"
2. Getting explicit yes
3. Still running `npx tsc --noEmit` and `npm run build` locally first (the safeguards exist regardless of who's deploying — see the plywood incident below)
4. Running the postflight check after

Never `vercel --prod` from the CLI. Vercel's GitHub integration is the only deploy path.

Never "just this once" without those four steps.

## Never do these things

- Never run `git reset --hard` or `git clean -fdx` without asking Jesper first — these destroy uncommitted work
- Never delete files you didn't create without asking
- Never deploy with TypeScript errors (skip step 3 → revert)
- Never merge a feature branch whose preview build failed
- Never push directly to `main` from a dirty working directory
- Never skip the session-start protocol, even for "quick" tasks
- Never `vercel --prod` from the CLI — production deploys ride on `git push origin main`

## The plywood incident

On April 17–18, 2026, a page and blog post about plywood were deployed via `vercel --prod` and went live. They were later overwritten by a subsequent deploy from a working directory that didn't have those changes committed to git. This is the exact failure mode the safeguards prevent: every change must be on a branch, every deploy goes through `git push`, and the working directory must be clean before any deploy. Don't let it happen again.

---

*Updated: every time the deploy workflow changes. If you see something in this file that conflicts with what Jesper is asking you to do, stop and surface the conflict.*
