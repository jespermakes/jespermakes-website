#!/usr/bin/env bash
set -uo pipefail

echo "=== Postflight smoke test ==="

URLS=(
  "https://jespermakes.com/"
  "https://jespermakes.com/blog"
  "https://jespermakes.com/shop"
  "https://jespermakes.com/tools"
  "https://jespermakes.com/title-lab"
  "https://jespermakes.com/storyteller"
  "https://jespermakes.com/box-joint-jig"
  "https://jespermakes.com/rubio"
  "https://jespermakes.com/about"
  "https://jespermakes.com/contact"
)

FAILED=0

for url in "${URLS[@]}"; do
  STATUS=$(curl -o /dev/null -s -w "%{http_code}" -L "$url" --max-time 15)
  if [ "$STATUS" = "200" ]; then
    echo "OK $STATUS $url"
  else
    echo "!!! $STATUS $url"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "=== All ${#URLS[@]} URLs returned 200 ==="
  exit 0
else
  echo "=== $FAILED URL(s) failed ==="
  exit 1
fi
