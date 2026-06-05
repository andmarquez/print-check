#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="print-check"
GITHUB_USER="${GITHUB_USER:-andsiosa}"

echo "→ Checking GitHub CLI auth..."
if ! gh auth status &>/dev/null; then
  echo "Run: gh auth login"
  exit 1
fi

echo "→ Creating GitHub repo ${GITHUB_USER}/${REPO_NAME}..."
gh repo create "${REPO_NAME}" --public --source=. --remote=origin --push --description "Premium AI-powered STL pre-flight analyzer for 3D printing"

echo "→ Enabling GitHub Pages..."
gh api "repos/${GITHUB_USER}/${REPO_NAME}/pages" \
  -X POST \
  -f build_type=workflow \
  -f source[branch]=main \
  -f source[path]=/ 2>/dev/null || echo "(Pages may already be configured)"

echo ""
echo "✓ Done! Site will be live at:"
echo "  https://${GITHUB_USER}.github.io/${REPO_NAME}/"
