.PHONY: release

# Usage: make release [BUMP=patch|minor|major]
release:
	@BUMP=$(BUMP) ./scripts/release.sh
