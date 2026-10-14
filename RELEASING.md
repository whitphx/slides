# Releasing packages

Workspace packages without `"private": true` are published to npm. Today that is only
[`slidev-addon-review-annotations`](packages/slidev-addon-review-annotations); decks, themes and the index site
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
   1. **plan:** lists the packages whose version this commit bumped and that aren't on
      npm yet.
   2. **pack:** installs, tests and packs them with `pnpm pack`. pnpm applies
      `publishConfig`, and `prepack` builds them. This job has no publish rights.
   3. **publish:** in the `npm` environment, never checking out or running repository
      code:
      - drafts a `<name>@<version>` GitHub release, whose notes are the version's
        `CHANGELOG.md` section;
      - **stages** the tarball on npm with `npm stage publish`, through trusted publishing
        and with provenance. A staged version isn't public yet.
4. **Approve the staged version** with 2FA:
   - on npmjs.com, in the package's **Staged Packages** tab; or
   - with `npm stage list slidev-addon-review-annotations`, then `npm stage approve <stage-id>`.

   Approving makes the version public. To drop it instead, use **Reject** or
   `npm stage reject <stage-id>`.
5. **Publish the draft GitHub release** (**Releases** → the draft → **Publish release**).
   This creates the `<name>@<version>` tag on the commit that bumped the version.

If the publish job fails, re-run it. A release draft that already exists is kept, and a
version already on npm is skipped. Don't re-run after a version has been staged: staging
the same version again fails until it is approved or rejected. Pushes that don't bump a
version never stage anything. To retry a version that isn't on npm, run the workflow by
hand (**Actions → Release → Run workflow**).

The Version Packages PR is created with the workflow's token, so GitHub doesn't run other
workflows on it. Close and reopen it, or push to it, if you want CI on it.

The **Packages** workflow checks every PR that touches a package. It checks the release
metadata (`scripts/release-plan.mjs --check`), then packs each package the way it will be
published and lints the tarball with publint and are-the-types-wrong.

Changesets is used for versioning only. Publishing is done by our own jobs rather than
`changeset publish`, because Changesets can't stage, and so the job that holds publish
rights never runs repository code.

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
   npx setup-npm-trusted-publish@2.2.0 slidev-addon-review-annotations
   ```

   This publishes version `0.0.0`. It has only a `package.json` and a README saying it is
   a placeholder for setting up trusted publishing. The package in this repository starts
   at `0.0.0` too, so CI doesn't try to republish it.
3. **Configure the trusted publisher** at
   `https://www.npmjs.com/package/slidev-addon-review-annotations/access`. Choose **GitHub Actions**
   and enter:
   - Organization or user: `whitphx`
   - Repository: `slides`
   - Workflow filename: `release.yml`
   - Environment name: `npm`
   - Allowed actions: leave `npm publish` unchecked. `npm stage publish`, which is all CI
     uses, is always allowed.

   A new trusted publisher expires if no publish uses it within 2 days. So configure it
   when the first Version Packages PR is ready to merge.
4. **Merge the Version Packages PR**, then approve the staged version and publish the
   draft release as above.
5. **Lock it down** (recommended): on the same page, set publishing access to *Require
   two-factor authentication and disallow tokens*. Staging through trusted publishing
   keeps working.

Provenance attestations are added automatically, because the repository is public and
publishing goes through trusted publishing.
