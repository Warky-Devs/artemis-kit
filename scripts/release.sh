#!/usr/bin/env bash
# Creates a changeset from commits since the last one, versions the
# package, tags the result, and pushes the tag to the git remote.
set -euo pipefail

BUMP="${BUMP:-patch}"
case "$BUMP" in
  patch|minor|major) ;;
  *) echo "BUMP must be patch, minor, or major (got: $BUMP)" >&2; exit 1 ;;
esac

PACKAGE_NAME=$(node -p "require('./package.json').name")

LAST_CHANGESET_COMMIT=$(git log -1 --format=%H -- '.changeset/*.md' || true)
if [ -n "$LAST_CHANGESET_COMMIT" ]; then
  RANGE="${LAST_CHANGESET_COMMIT}..HEAD"
else
  RANGE="HEAD"
fi

COMMITS=$(git log --format='- %s' "$RANGE" -- . ':!.changeset')
if [ -z "$COMMITS" ]; then
  echo "No commits found since the last changeset ($RANGE); nothing to release." >&2
  exit 1
fi

CHANGESET_FILE=".changeset/release-$(date +%Y%m%d%H%M%S).md"
{
  echo "---"
  echo "\"$PACKAGE_NAME\": $BUMP"
  echo "---"
  echo
  echo "$COMMITS"
} > "$CHANGESET_FILE"

echo "Created $CHANGESET_FILE:"
cat "$CHANGESET_FILE"

pnpm changeset version

NEW_VERSION=$(node -p "require('./package.json').version")
TAG="v${NEW_VERSION}"

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Tag $TAG already exists" >&2
  exit 1
fi

git add -A
git commit -m "RELEASING: Releasing 1 package(s)"
git tag "$TAG"
git push origin HEAD "$TAG"

echo "Released and pushed $TAG"
