# Releasing packages

Workspace packages without `"private": true` are published to npm. Today that is only
[`slidev-addon-annotate`](packages/slidev-addon-annotate); decks, themes and the index site
are private and are never versioned or published.

Releases are managed with [Changesets](https://github.com/changesets/changesets).

## Release a change

1. **Add a changeset** in the pull request that makes a user-facing change:

   ```sh
   pnpm changeset
   ```

   Pick the package and the bump (patch, minor or major), and write a short summary for
   the changelog. Commit the generated `.changeset/*.md` file with the change. A PR that
   doesn't need a release (docs, tests, decks) needs no changeset.
2. **Merge the PR.** The **Release** workflow opens (or updates) a **Version Packages**
   pull request. It contains `changeset version`'s output:
   - bumped versions;
   - `CHANGELOG.md` entries that link the PRs;
   - `.claude-plugin/plugin.json` versions kept in step.
3. **Merge the Version Packages PR** when you want to release. The **Release** workflow
   then runs `.github/workflows/release.yml`:
   1. **plan:** lists the packages whose version isn't on npm yet.
   2. **pack:** installs, tests and packs them with `pnpm pack`. pnpm applies
      `publishConfig`, and `prepack` builds them. This job has no publish rights.
   3. **publish:** in the `npm` environment, publishes the tarballs with npm's trusted
      publishing. This job never checks out or runs repository code. It then creates a
      `<name>@<version>` tag and GitHub release, whose notes are the version's
      `CHANGELOG.md` section.

If a publish or release step fails, re-run the failed jobs. Anything already published or
released is skipped.

The Version Packages PR is created with the workflow's token, so GitHub doesn't run other
workflows on it. Close and reopen it, or push to it, if you want CI on it.

The **Packages** workflow checks every PR that touches a package. It checks the release
metadata (`scripts/release-plan.mjs --check`), then packs each package the way it will be
published and lints the tarball with publint and are-the-types-wrong.

Changesets is used for versioning only. Publishing is done by our own jobs rather than
`changeset publish`, so the job that holds publish rights never runs repository code.

## One-time setup for a new package

npm only lets you configure trusted publishing on a package that already exists. So the
package name is first claimed with a placeholder, and the real first version comes from CI.
This uses [`setup-npm-trusted-publish`](https://github.com/azu/setup-npm-trusted-publish),
as described in [npmパッケージを最初からGitHub Actionsでリリースする方法](https://eiji.page/blog/npm-first-publish/).

1. **Repository settings** (once per repository):
   - In **Settings → Actions → General**, enable *Allow GitHub Actions to create and
     approve pull requests*, so the workflow can open the Version Packages PR.
   - Optionally, in **Settings → Environments → npm**, add yourself as a required reviewer,
     so every publish waits for your approval. The workflow creates the environment on its
     first run if it doesn't exist.
2. **Publish a placeholder** from your machine (needs your npm login):

   ```sh
   npx setup-npm-trusted-publish@2.2.0 slidev-addon-annotate
   ```

   This publishes version `0.0.0`. It has only a `package.json` and a README saying it is
   a placeholder for setting up trusted publishing. The package in this repository starts
   at `0.0.0` too, so CI doesn't try to republish it.
3. **Configure the trusted publisher** at
   `https://www.npmjs.com/package/slidev-addon-annotate/access`. Choose **GitHub Actions**
   and enter:
   - Organization or user: `whitphx`
   - Repository: `slides`
   - Workflow filename: `release.yml`
   - Environment name: `npm`

   A new trusted publisher expires if no publish uses it within 2 days. So configure it
   when the first Version Packages PR is ready to merge.
4. **Merge the Version Packages PR.** CI publishes the first real version with
   provenance.
5. **Lock it down** (recommended): on the same page, set publishing access to *Require
   two-factor authentication and disallow tokens*. Trusted publishing keeps working.

Provenance attestations are added automatically, because the repository is public and
publishing goes through trusted publishing.
