#!/usr/bin/env bash
set -euo pipefail

FEATURE="${1:-}"
if [ -z "$FEATURE" ]; then
  echo "Usage: ./scripts/log-deploy.sh \"<feature description>\""
  exit 1
fi

DATE=$(date +%Y-%m-%d)
COMMIT=$(git rev-parse --short HEAD)

ENTRY="## $DATE

**Feature:** $FEATURE
**Commit:** $COMMIT
**Notes:**
"

TEMP=$(mktemp)
head -n 9 .deployed-state.md > "$TEMP"
echo "" >> "$TEMP"
echo "$ENTRY" >> "$TEMP"
tail -n +10 .deployed-state.md >> "$TEMP"
mv "$TEMP" .deployed-state.md

echo "Added entry for $DATE — $FEATURE"
