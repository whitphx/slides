# Releasing packages

Workspace packages without `"private": true` are published to npm. Today that is only
[`slidev-addon-annotate`](packages/slidev-addon-annotate); decks, themes and the index site
are private.

## Release a new version

In a pull request:

1. Bump `version` in the package's `package.json` (and in `.claude-plugin/plugin.json`
   if the package has one).
2. Add a `## <version>` section to its `CHANGELOG.md`. This section becomes the GitHub
   release notes.

The **Packages** workflow checks this on the PR. It also packs each package the way it
will be published and lints the tarball (publint, are-the-types-wrong).

Merging to `main` runs the **Release** workflow (`.github/workflows/release.yml`):

1. **plan:** lists packages whose version isn't on npm or has no GitHub release.
2. **pack:** installs, tests and packs them with `pnpm pack`. pnpm applies `publishConfig`,
   and `prepack` builds them. This job has no publish rights.
3. **publish:** in the `npm` environment, publishes the tarballs with npm's trusted
   publishing, then creates a `<name>@<version>` tag and GitHub release for each.
   This job never checks out or runs repository code.

Re-running the workflow is safe: anything already published or released is skipped.

## One-time setup

npm can only add a trusted publisher to a package that already exists, so the first
version is published by hand.

1. **First publish, from your machine** (needs your npm login and 2FA):

   ```sh
   pnpm install
   cd packages/slidev-addon-annotate
   pnpm pack                        # builds and applies publishConfig; npm alone would skip it
   npm publish ./slidev-addon-annotate-0.1.0.tgz --access public
   ```

   Publish the tarball, not the directory: `npm publish` in the directory ignores
   `publishConfig.exports` and would publish the TypeScript entry points.
   The Release workflow then only creates the GitHub release for 0.1.0. Run it from the
   Actions tab (**Release → Run workflow**) or let the next merge do it.

2. **Trusted publisher:** on npmjs.com, open the package's **Settings → Trusted
   Publisher**, choose **GitHub Actions** and enter:
   - Organization or user: `whitphx`
   - Repository: `slides`
   - Workflow filename: `release.yml`
   - Environment name: `npm`

   A new trusted publisher expires if it isn't used for a publish within 2 days. So add it
   when the next release PR is ready to merge, not ahead of time.

3. **Lock it down** (recommended): after a CI publish has succeeded, set **Publishing
   access** to *Require two-factor authentication and disallow tokens*. Trusted publishing
   keeps working.

4. **Optional:** in the repository's **Settings → Environments → npm**, add yourself as a
   required reviewer, so every publish waits for your approval. The workflow creates the
   environment on its first run if it doesn't exist.

Provenance attestations are added automatically, because the repository is public and
publishing goes through trusted publishing.
