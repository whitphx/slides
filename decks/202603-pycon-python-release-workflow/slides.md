---
theme: ../../themes/triangle
title: "A reliable development/release workflow for open source Python libraries"
drawings:
  persist: false
mdc: true
themeConfig:
  primary: '#36709E'
defaults:
  transition: slide-left
transition: fade-out
addons:
  - fancy-arrow
  - window-mockup
---

<h1 text-5xl leading-16>
A reliable dev/release workflow<br>
for OSS Python libraries
</h1>

---

<h1>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div class="portfolio" w-130 mt-6 v-click="1">

- <span class="heading">Created</span>: <span class="item"><img src="/portfolio/awesome_emacs_keymap.svg">Awesome Emacs Keymap</span>, <span class="item"><img src="/portfolio/stlite.png">Stlite: In-browser Streamlit</span>, <span class="item">🎈 Streamlit-WebRTC</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio-Lite: Serverless Gradio</span>, <span class="item">🤗 Transformers.js.py</span>
- <span class="heading">Contributed to</span>: <span class="item"><img src="/portfolio/streamlit-mark-color.svg" style="height: 0.8em;">Streamlit</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio</span>
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🌏APAC, 🇪🇺Euro, 🇹🇼TW, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT</span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item">🐍SciPyData2026</span>

<div absolute top-48 right-0>
<a href="https://github.com/whitphx" target="_blank" rel="noopener noreferrer">
<img src="/github_whitphx.png" alt="GitHub @whitphx" w="400px">
</a>
</div>

</div>

<div absolute left-12 bottom-10 w-min flex="~ gap-1" items-center justify-center v-click="2">
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

<style>
  .portfolio {
    font-size: 1.0rem;
  }
  .item {
    height: 1.8rem;
    line-height: 1.0rem;
    font-weight: 300;
    display: inline-flex;
    align-items: center;

    img {
      height: 1.0em;
      margin-right: 0.25em;
    }
  }
</style>

---

# Case study: `streamlit-webrtc`

<div grid="~ cols-2" gap-8 mt-4>

<div>

<v-clicks>

- Python library published to **PyPI**
- Open source, external contributors
- Multi-platform, multi-Python-version support
- **100+ releases** so far
- Past talk: [EuroPython 2022](https://av.tib.eu/media/60846)

</v-clicks>

</div>

<div flex="~ col" items-center>

<img src="/github_repo.png" alt="streamlit-webrtc GitHub repository" w="100%" rounded-lg border="~ gray/20">

</div>

</div>

---

# How do you release a Python package?

<div mt-4>

<v-clicks>

- The simplest way: run `python -m build` and `twine upload` **on your local machine**
- Works, but: depends on your environment, easy to forget steps, no audit trail
- Most mature projects move this to **CI/CD** — reproducible, automated, traceable

</v-clicks>

</div>

<div v-click mt-6 op80>

This talk focuses on **CI-based release workflows** — specifically with GitHub Actions, which the official Python packaging guide also uses.

</div>

---

# A common starting point

The [PyPA packaging guide](https://packaging.python.org/en/latest/guides/publishing-package-distribution-releases-using-github-actions-ci-cd-workflows/) and GitHub's starter template:

<div grid="~ cols-2" gap-6 mt-2>

<div v-click="1" border="~ gray/30 rounded-lg" p-3 bg-gray:5>

**"Publish Python Package"** template

```
release-build → pypi-publish
```

- Triggers on GitHub Release
- Build + publish only
- No tests, no changelog

</div>

<div v-click="2" border="~ gray/30 rounded-lg" p-3 bg-gray:5>

**PyPA packaging guide** workflow

```
build → publish-to-pypi
      → publish-to-testpypi
```

- Trusted Publishing (OIDC)
- Build/publish separation
- Still no tests or changelog

</div>

</div>

<div v-click="3" mt-4 op80>

Great foundations — but a growing OSS library needs more.

</div>

---

# Goal of this talk

<div mt-8 text-2xl>

<v-clicks>

- **Maximize safety** — prevent bad releases, protect secrets
- **Minimize manual effort** — automate versioning, changelogs, publishing
- **Lower the contribution barrier** — make it easy to do the right thing

</v-clicks>

</div>

<div v-click mt-8 text-center text-xl>

Build a release pipeline where the **only human decision** is merging a PR.

</div>

---

# Agenda

<div mt-6 text-2xl>

<v-clicks>

- 🧪 **Test & Build** — multi-env testing, idempotent builds
- 📝 **Change Management** — changelog + automated versioning
- 🔒 **Security** — handling untrusted PRs, securing releases
- 🧑‍💻 **Developer Experience** — making it easy for contributors

</v-clicks>

</div>

---
layout: section
---

# 🧪 Test & Build Strategy

<div mt-4 op70>
Catch bugs before they reach users — across every supported environment.
</div>

---

# Multi-environment testing

<div mt-4>

Testing across Python versions and dependency combinations:

</div>

```yaml {*|3-8|9-11|12-18}{maxHeight:'300px'}
jobs:
  test-python:
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12", "3.13"]
        streamlit-version:
          - "" # latest
          - "1.45.0"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - name: Install specific Streamlit version
        if: matrix.streamlit-version != ''
        run: pip install streamlit==${{ matrix.streamlit-version }}
      - run: pytest
```

<div v-click mt-2 op80>

Test the **edges of your compatibility matrix** — oldest and newest supported versions.

Tools like `tox` / `nox` can manage this too — here we use GitHub Actions matrix directly for parallel runs and simpler CI integration.

</div>

---

# Idempotent builds and artifact passing

<div mt-2>

Build the package **once**, then pass the artifact to all downstream jobs:

</div>

```yaml {*|1-9|10-14}{maxHeight:'300px'}
jobs:
  build:
    needs: [test-python, test-frontend]
    steps:
      - run: python -m build
      - uses: actions/upload-artifact@v4
        with:
          name: dist-${{ github.sha }}
          path: dist/
  publish:
    needs: build
    steps:
      - uses: actions/download-artifact@v4
      - uses: pypa/gh-action-pypi-publish@release/v1
```

<div v-click mt-2 op80>

The wheel that passes tests is the **exact same wheel** that gets published — no second build, no environment drift.

</div>

---

# What triggers a release?

<div mt-4>

A common pattern: pushing a **version tag** triggers the release pipeline.

</div>

```yaml {*|3-4}
# test-build.yml
on:
  push:
    tags: ["v*"]  # Only version tags
```

<div v-click mt-4>

`git tag v1.2.3 && git push --tags` → CI builds and publishes.

But **who creates the tag, and how do they decide the version?**

</div>

---
layout: section
---

# 📝 Changelog & Versioning

<div mt-4 op70>
Three problems, one story — automate them together.
</div>

---

# Three problems to solve

<div mt-6 text-xl>

<v-clicks>

1. **Changelog** — how do you maintain CHANGELOG.md?
2. **Version bumping** — how do you decide the next version and create a git tag?
3. **Package version** — how does the built wheel know its `__version__`?

</v-clicks>

</div>

<div v-click mt-6 op80 text-lg>

These are **coupled** — what changed determines the next version, and the version must reach the built package.

</div>

---

# Phase 1: Everything manual

<div mt-2 text-sm>

| Problem | Solution |
|---|---|
| Changelog | Edit CHANGELOG.md **by hand** before release |
| Version bump | Manually edit `version = "..."` in pyproject.toml, commit, tag |
| Package version | **Hardcoded** in `pyproject.toml` |

</div>

<div v-click mt-2>

```toml
[project]
version = "0.49.4"  # manually edited for each release
```

</div>

<div v-click mt-2 op80>

Everything done by hand — easy to forget the changelog, easy to get the version wrong.

</div>

---

# Phase 2: `bump-my-version`

<div mt-2 text-sm>

| Problem | Solution |
|---|---|
| Changelog | Still **manual** |
| Version bump | **`bump-my-version`** — updates pyproject.toml + creates git tag |
| Package version | Still hardcoded (but `bump-my-version` keeps it in sync) |

</div>

<div v-click mt-2>

```shell
$ bump-my-version bump minor --tag --commit
# Updates version = "0.49.4" → "0.50.0" in pyproject.toml
# Creates commit + git tag v0.50.0
```

</div>

<div v-click mt-2 op80>

No manual file editing for versions. But the **human still picks** patch vs. minor, and changelog is still manual.

</div>

---

# Phase 3: `hatch-vcs` eliminates hardcoded version

<div mt-2 text-sm>

| Problem | Solution |
|---|---|
| Changelog | Still **manual** |
| Version bump | Still `bump-my-version` (human picks level, but now only creates **git tag** — no file updates) |
| Package version | **`hatch-vcs`** — reads the git tag at build time |

</div>

<div v-click="1" mt-2>

```toml
[project]
dynamic = ["version"]        # no more hardcoded string

[tool.hatch.version]
source = "vcs"               # version = latest git tag
```

</div>

<div v-click="2" mt-2 op80>

Bonus: `hatch-vcs` generates **dev versions** (e.g., `0.64.6.dev17+g8476028`) for non-tagged builds — useful for preview wheels.

</div>

---
layout: statement
---

## Changelog and version bumping<br>are still manual — can we automate them?

---

# Approaches to automate changelog & versioning

Both work by **aggregating structured inputs** — they differ in the source:

<div grid="~ cols-2" gap-6 mt-4>

<div v-click="1" border="~ sky/30 rounded-lg" p-2 bg-sky:5>

**Conventional Commits**

<div v-click="2">

Input: **commit messages**

```
feat: add locale-aware dates
fix: handle null timezone
BREAKING CHANGE: drop Python 3.9
```

</div>

<div v-click="3">

Tools parse `feat:`→minor, `fix:`→patch, `BREAKING CHANGE:`→major

Tools: `semantic-release`, `commitizen`, `release-please`

</div>

</div>

<div v-click="4" border="~ emerald/30 rounded-lg" p-2 bg-emerald:5>

**Changelog fragments**

<div v-click="5">

Input: **dedicated files** per PR

```md
### Added
- Locale-aware date formatting
### Fixed
- Handle null timezone
```

</div>

<div v-click="6">

Categories map to SemVer levels

Tools: `Changesets` (JS), `scriv` / `towncrier` (Python)

</div>

</div>

</div>

---

# Comparing the two approaches

<div grid="~ cols-2" gap-6 mt-2>

<div>

**Conventional Commits**

<v-clicks>

- Version intent tied to **commit messages**
- Requires discipline on every commit
- Squash merges lose granularity (PR title must follow the convention instead)
- Changelog reads like a git log

</v-clicks>

</div>

<div>

**Changelog fragments**

<v-clicks at="5">

- Version intent is a **dedicated file** — reviewed in the PR
- Typically one fragment per PR (multiple are fine too)
- Survives squash/rebase; easy to edit **after merge**
- Changelog is **human-written prose**

</v-clicks>

</div>

</div>

<div v-click="9" mt-2 text-center op80>

I prefer fragments — but both are valid. Choose what fits your team.

</div>

---

# Changesets: the full package (JS)

<div mt-4>

[Changesets](https://github.com/changesets/changesets) provides **both** a local CLI tool and a GitHub Action:

</div>

<div grid="~ cols-2" gap-6 mt-4>

<div v-click="1">

**Local tool** (`@changesets/cli`)

- `changeset add` → create a fragment
- `changeset version` → aggregate fragments, bump versions, update changelog

</div>

<div v-click="2">

**CI automation** (`changesets/action`)

- On merge → opens a "Release PR" that runs `changeset version`
- Merging the Release PR → publishes packages

</div>

</div>

<div v-click="3" mt-4 op80>

One ecosystem: fragment authoring, version calculation, changelog generation, **and** the CI release flow.

</div>

---

# Python equivalents?

<div mt-2>

[`scriv`](https://github.com/nedbat/scriv) and [`towncrier`](https://github.com/twisted/towncrier) manage changelog fragments for Python.

</div>

<div grid="~ cols-2" gap-6 mt-2>

<div>

```toml
# pyproject.toml (scriv)
[tool.scriv]
categories = [
  "Added", "Changed", "Deprecated",
  "Removed", "Fixed", "Security",
  "Chore"
]
format = "md"
md_header_level = 2
```

</div>

<div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ scriv create --edit
# changelog.d/20260316_whitphx.md
```

</WindowMockup>

<div mt-4 v-click="1">

```md
### Fixed
- Resolved WebSocket reconnection
  timeout on slow networks
```

</div>

</div>

</div>

<div v-click="2" mt-2 op80>

But these tools **only handle changelogs**. No version calculation, no CI release flow — unlike Changesets which covers all three.

</div>

---

# Phase 4: Filling the gaps

<div mt-2 text-sm>

| Problem | Changesets (JS) | streamlit-webrtc (Python) |
|---|---|---|
| Changelog | `changeset version` | `scriv collect` |
| Version bump | `changeset version` | **custom script** reads fragment categories |
| Git tag | `changesets/action` | **custom CI workflow** (`changelog.yml`) |
| Package version | `package.json` | `hatch-vcs` (reads git tag) |

</div>

<div v-click mt-2 op80>

I wrote two things to close the gap:

1. **`get_bump_version_level.py`** — reads fragment categories, returns `major`/`minor`/`patch`
2. **`changelog.yml`** — GitHub Actions workflow replicating the Changesets release flow

</div>

---

# Custom version calculation

<div mt-2>

Fragment categories carry **semantic intent** — a small script maps them to SemVer levels:

</div>

```py {*|1-9|11-18}{maxHeight:'300px'}
CATEGORY_SEMVER_MAP = {
    "Added":      "minor",   # New features
    "Changed":    "minor",   # Behavior changes
    "Deprecated": "minor",   # Deprecation notices
    "Removed":    "major",   # Breaking changes!
    "Fixed":      "patch",   # Bug fixes
    "Security":   "patch",   # Security patches
    "Chore":      "patch",   # Maintenance
}

def get_bump_level():
    scriv = Scriv()
    frags = scriv.fragments_to_combine()
    entries = scriv.combine_fragments(frags)
    # Parse categories from combined changelog
    # Return the highest priority:
    #   major > minor > patch
    return max_level(entries)
```

<div v-click mt-2 op80>

~40 lines of Python. The same fragments that generate the changelog also determine the version.

</div>

---

# Custom CI release workflow

<div mt-2>

A GitHub Actions workflow that replicates what `changesets/action` does:

</div>

```yaml {*|1-5|6-12|13-19}{maxHeight:'300px'}
# changelog.yml (key parts — full workflow is ~145 lines)
on:
  push:
    branches: [main]
steps:
  - run: bump_level=$(python get_bump_version_level.py)
  # If fragments exist → create/update Release PR
  - if: bump_level != ''
    run: |
      next_version=$(bump-my-version show --increment $bump_level new_version)
      scriv collect --version $next_version
      gh pr create --title "Release $next_version" ...
  # If no fragments → this is the merged Release PR → tag & release
  - if: bump_level == ''
    run: |
      bump_level_prev=$(git checkout HEAD~1 && python get_bump_version_level.py)
      bump-my-version bump $bump_level_prev --tag --no-commit
      git push --follow-tags  # triggers build & publish
```

<div v-click mt-2 op80>

One workflow, two behaviors — driven by the **presence or absence** of fragment files.

</div>

---

# The complete tool chain

<div mt-2>

How all the tools work together in Phase 4:

</div>

<div mt-2 text-sm>

| Problem | Tool | Role |
|---|---|---|
| **Changelog** | `scriv` | Fragment authoring + aggregation into CHANGELOG.md |
| **Version bump** | Custom script + CI workflow | Reads categories → determines level → creates git tag |
| **Package version** | `hatch-vcs` | Reads git tag at build time → sets `__version__` |

</div>

<div v-click="1" mt-2 op80>

`scriv` and `hatch-vcs` are off-the-shelf; the custom script and workflow **connect** them.

</div>

<div v-click="2" mt-2 op80>

Bonus: `hatch-vcs` gives us **dev versions** for free (e.g., `0.64.6.dev17+g8476028`) — useful for preview wheels.

</div>

---

# The release flow

<div grid="~ cols-4" gap-2 mt-2>

<div v-click="1" flex="~ col" items-center>
<img src="/action_create_pr.png" alt="Action: create Release PR" w="100%" rounded-lg border="~ gray/20">
<div op70 text-xs text-center>1. Fragments detected → create PR</div>
</div>

<div v-click="2" flex="~ col" items-center>
<img src="/release_pr.png" alt="Release PR" w="100%" rounded-lg border="~ gray/20">
<div op70 text-xs text-center>2. Release PR with changelog</div>
</div>

<div v-click="3" flex="~ col" items-center>
<img src="/action_release.png" alt="Action: tag and release" w="100%" rounded-lg border="~ gray/20">
<div op70 text-xs text-center>3. Merged → create git tag</div>
</div>

<div v-click="4" flex="~ col" items-center>
<img src="/github_release.png" alt="GitHub Release" w="100%" rounded-lg border="~ gray/20">
<div op70 text-xs text-center>4. Published release</div>
</div>

</div>

---
layout: section
---

# 🔒 Security

<div mt-4 op70>
Open source means untrusted code runs in your CI — GitHub Actions has specific pitfalls.
</div>

---

# The untrusted PR problem

<div mt-2>

In GitHub Actions, different event types run in **different execution contexts**:

</div>

<div grid="~ cols-2" gap-6 mt-2>

<div v-click="1" border="~ red/50 rounded-lg" p-3 bg-red:10>

**`pull_request` event**

Runs **the PR author's code** — external contributors can execute arbitrary code in your CI.

Read-only `GITHUB_TOKEN`, no access to secrets — but you can't deploy or publish from here.

</div>

<div v-click="2" border="~ emerald/50 rounded-lg" p-3 bg-emerald:10>

**`workflow_run` event**

Runs in the **default branch context** — only code that's been merged into `main` executes.

Has access to secrets — safe for deployment and publishing.

</div>

</div>

<div v-click="3" mt-4 op80>

**Key principle**: run tests/builds on `pull_request` (no secrets needed), run deploys on `workflow_run` (secrets safe).

</div>

---

# Workflow separation in practice

<div mt-4>

GitHub Actions lets you split CI into **separate workflow files** with different trigger contexts and permissions:

</div>

<div grid="~ cols-3" gap-3 mt-2 text-sm>

<div v-click="1">

**test-build.yml**

```yaml
on:
  push:
  pull_request:
# Tests, builds wheel
# ⚠️ NO secrets
```

</div>

<div v-click="2">

**post-build.yml**

```yaml
on:
  workflow_run:
    workflows: ["test-build"]
    types: [completed]
# ✅ Has secrets
```

</div>

<div v-click="3">

**changelog.yml**

```yaml
on:
  push:
    branches: [main]
# Release PRs + tagging
```

</div>

</div>

<div v-click="4" mt-2 op80>

`workflow_run` runs in the **default branch context** — only reviewed, merged code executes with access to secrets.

</div>

---

# Signing and provenance

<div mt-4>

The final piece: **how do users trust the package?**

</div>

<div mt-2>

<v-clicks>

- **Trusted Publishing** (PyPI) — GitHub Actions OIDC authenticates directly, no API tokens
- **Sigstore signing** — ephemeral certificates, verifiable provenance
- **GitHub Release** — signed artifacts attached for auditing

</v-clicks>

</div>

<div v-click="4">

```yaml {*|3,5}{at:5}
  publish-to-pypi:
    permissions:
      id-token: write  # Required for trusted publishing
    steps:
      - uses: pypa/gh-action-pypi-publish@release/v1
        # No token needed! OIDC handles auth
```

</div>

---
layout: section
---

# 🧑‍💻 Developer Experience

<div mt-4 op70>
Make it easy to contribute correctly — so you spend less time on review.
</div>

---

# Making it easy for contributors

<div mt-6 text-xl>

<v-clicks>

- **`scriv create --edit`** — one command to add a changelog entry
  - Template guides contributors through the categories
- **PR preview wheels** — deployed to Cloudflare Pages, with a `pip install` command posted as a PR comment
  - Reviewers can test changes before merge

</v-clicks>

</div>

<div v-click mt-6 border="~ sky/50 rounded-lg" p-4 bg-sky:10 text-lg>

The easier it is to contribute correctly, the less time you spend on review.

</div>

---

# PR preview wheels

<div mt-2>

Every PR gets a deployable wheel. This runs in `workflow_run` — deploying needs **secrets** unavailable in `pull_request` context.

</div>

<div grid="~ cols-2" gap-4 mt-2>

<div>

```yaml {*|2|4-5|8-13}{maxHeight:'240px'}
  deploy-preview-wheel:
    if: workflow_run.event == 'pull_request'
    steps:
      - uses: actions/download-artifact@v4
      - uses: cloudflare/wrangler-action@v3
        # Deploy wheel to Cloudflare Pages
      # Post pip install command as PR comment:
      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              body: '📦 pip install <url>'
            })
```

</div>

<div v-click flex="~ col" items-center>

<img src="/pr_preview_comment.png" alt="PR preview wheel comment" w="100%" rounded-lg border="~ gray/20">

<div mt-2 op70 text-sm text-center>

Actual PR comment with `pip install` link

</div>

</div>

</div>

---
layout: section
---

# Putting It All Together

---

# The full release lifecycle

From code change to published package:

<div mt-4 flex="~ col" gap-3>

<div v-click="1" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-sky:20 flex items-center justify-center text-sky font-bold shrink-0>1</div>
<div>Contributor opens PR with code + <code>scriv</code> fragment</div>
</div>

<div v-click="2" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-sky:20 flex items-center justify-center text-sky font-bold shrink-0>2</div>
<div>CI tests, builds wheel, deploys <strong>preview wheel</strong></div>
</div>

<div v-click="3" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-sky:20 flex items-center justify-center text-sky font-bold shrink-0>3</div>
<div>PR merges → CI opens <strong>"Preview changelog"</strong> PR</div>
</div>

<div v-click="4" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-emerald:20 flex items-center justify-center text-emerald font-bold shrink-0>4</div>
<div>Maintainer reviews changelog, merges the PR</div>
</div>

<div v-click="5" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-emerald:20 flex items-center justify-center text-emerald font-bold shrink-0>5</div>
<div>CI creates <strong>git tag</strong> → publishes to <strong>PyPI</strong></div>
</div>

<div v-click="6" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-emerald:20 flex items-center justify-center text-emerald font-bold shrink-0>6</div>
<div><strong>GitHub Release</strong> with Sigstore-signed artifacts</div>
</div>

</div>

<div v-click="7" mt-4 text-center text-xl>

One human decision → everything else is automated.

</div>

---

# Key takeaways

<div mt-6 text-xl>

<v-clicks>

- **Single source of truth** — git tags for versions, changelog fragments for changes
- **Automate the boring parts** — version calculation, changelog assembly, publishing
- **Keep humans in the loop** — review the changelog PR before release
- **Security by design** — separate trusted/untrusted CI contexts
- **Lower the barrier** — preview wheels, contributor-friendly tooling
- **Steal ideas across ecosystems** — Changesets (JS) → scriv + automation (Python)

</v-clicks>

</div>

---

# Resources

<div mt-6 text-lg>

<div flex="~ col" gap-4>

<div flex="~ gap-2" items-center>
<div i-ri-github-line text-2xl op50 />
<div><a href="https://github.com/whitphx/streamlit-webrtc" target="_blank">whitphx/streamlit-webrtc</a> — the project used as case study</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-github-line text-2xl op50 />
<div><a href="https://github.com/nedbat/scriv" target="_blank">nedbat/scriv</a> — changelog fragment management</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-github-line text-2xl op50 />
<div><a href="https://github.com/changesets/changesets" target="_blank">changesets/changesets</a> — the JS inspiration</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-link text-2xl op50 />
<div><a href="https://docs.pypi.org/trusted-publishers/" target="_blank">PyPI Trusted Publishers</a> — OIDC-based publishing</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-link text-2xl op50 />
<div><a href="https://www.sigstore.dev/" target="_blank">Sigstore</a> — artifact signing and verification</div>
</div>

</div>

</div>

---

<h1>Thank you!</h1>

<div mt-10 text-2xl>

Slides & contact:

</div>

<div mt-6 flex="~ col" gap-3 text-xl>

<div flex="~ gap-2" items-center>
<div i-ri-user-3-line op50 text-2xl />
<a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-github-line op50 text-2xl />
<a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">github.com/whitphx</a>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-twitter-x-line op50 text-2xl />
<a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">@whitphx</a>
</div>

</div>
