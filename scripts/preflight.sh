#!/usr/bin/env bash
set -euo pipefail

echo "=== Preflight check ==="

if [ -n "$(git status --porcelain)" ]; then
  echo "FAIL: uncommitted changes present"
  echo ""
  git status --short
  echo ""
  echo "Commit or stash these before deploying."
  exit 1
fi
echo "OK: working directory clean"

git fetch origin --quiet

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null || git rev-parse origin/main)
BASE=$(git merge-base @ @{u} 2>/dev/null || git merge-base @ origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "OK: local matches origin/main"
elif [ "$LOCAL" = "$BASE" ]; then
  echo "FAIL: local is behind origin/main"
  echo "Run: git pull --rebase origin main"
  exit 1
elif [ "$REMOTE" = "$BASE" ]; then
  echo "OK: local is ahead of origin/main (ready to push)"
else
  echo "FAIL: local and origin/main have diverged"
  echo "Resolve the divergence before deploying."
  exit 1
fi

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "WARN: VERCEL_TOKEN not set, skipping production-state check"
else
  CURRENT_PROD=$(curl -s \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v6/deployments?projectId=jespermakes-website&target=production&limit=1&state=READY" \
    | grep -o '"meta":{[^}]*"githubCommitSha":"[^"]*"' \
    | grep -o '"githubCommitSha":"[^"]*"' \
    | cut -d'"' -f4 || echo "")

  if [ -z "$CURRENT_PROD" ]; then
    echo "WARN: could not fetch current production commit from Vercel"
  else
    echo "Current production commit: $CURRENT_PROD"
    echo "Local HEAD: $LOCAL"

    if git merge-base --is-ancestor "$CURRENT_PROD" "$LOCAL" 2>/dev/null; then
      echo "OK: local HEAD includes the current production commit"
    else
      echo "FAIL: local HEAD does NOT include the current production commit"
      echo ""
      echo "This means you'd be deploying a state that MISSES work already in production."
      echo "The plywood incident happened because of exactly this. STOP."
      echo ""
      echo "Fix: git pull --rebase origin main, then re-run this script."
      exit 1
    fi
  fi
fi

echo ""
echo "=== Preflight PASSED — safe to push ==="
exit 0
