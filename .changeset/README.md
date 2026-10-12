# Changesets

Describe each user-facing change to a published package (one without `"private": true`)
with a changeset: run `pnpm changeset`, pick the packages and the bump, and commit the
generated Markdown file with the change. Merging it to `main` opens a "Version Packages"
pull request; merging that one publishes. See [RELEASING.md](../RELEASING.md).
