# Repository guidance

Keep README.md focused on package usage and installation. Document development
checks, CI workflows, and release procedures in this file. This repository uses
Gitea at https://git.warky.dev; workflows belong in `.gitea/workflows/`.

## Development checks

`pnpm-workspace.yaml` explicitly allows esbuild install scripts through
`allowBuilds` for pnpm versions that require dependency build approval. Keep
approvals scoped to the dependencies that need them.

Run `pnpm test` for the test suite and `pnpm check:bundle` for a production build
with bundle checks. Builds fail on direct eval warnings. The bundle check measures
raw and gzip bytes for every emitted JavaScript file against
`scripts/bundle-budgets.json`; missing outputs and unbudgeted chunks also fail.
Review intentional size changes before updating budgets. Gitea Actions runs both commands on
pushes and pull requests via `.gitea/workflows/ci.yml`, using a runner with the
`ubuntu-latest` label. Action sources use explicit URLs so they do not depend on
the server’s default action host. No additional runtime dependencies are required by the
collection or sorting helpers.

## Publishing to Gitea Packages

`.gitea/workflows/publish.yml` publishes `@warkypublic/artemis-kit` when a `v*`
tag is pushed to Gitea or manually dispatched from the Actions UI. The
destination is
`https://git.warky.dev/api/packages/<owner>/npm/`, where `<owner>` is the Gitea
repository's user or organization (not necessarily the npm scope `warkypublic`).

1. The workflow uses the existing `PACKAGE_REGISTRY_TOKEN` Actions secret.
   It must have **Packages: Read & Write** access from a user allowed to publish
   under the repository owner. npm token authentication does not require the
   existing `PACKAGE_REGISTRY_USERNAME` secret. Do not put the token in the repository.
2. Run `pnpm exec changeset version` to apply pending changesets. Review and commit
   the updated version, changelog, and consumed changesets with the release changes.
3. Create and push a matching tag to the Gitea remote, for example `v1.1.0` for
   package version `1.1.0`. To dispatch manually, select that existing matching tag
   as the workflow run ref in the Actions UI; the workflow rejects branch refs and
   tags that do not exactly match the package version. It runs the tests and
   bundle checks, then publishes using pnpm so the `publishConfig` overrides point
   consumers to the built JavaScript and declarations.

Stable versions receive the `latest` dist-tag; prereleases receive `next`.
Existing package versions cannot be overwritten; release a new version instead.
This workflow adds Gitea as a publishing destination without changing the default
registry for local publishing. After the first upload, link the package to this
repository in the package settings to show it in the repository's Packages tab.
See the [Gitea npm registry documentation](https://docs.gitea.com/usage/packages/npm/)
and [package access rules](https://docs.gitea.com/usage/packages/overview/).
