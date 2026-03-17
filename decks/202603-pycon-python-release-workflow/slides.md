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

# Context: `streamlit-webrtc`

A Streamlit component for real-time video/audio processing.

<div grid="~ cols-2" gap-8 mt-8>

<div>

<v-clicks>

- Python + TypeScript (frontend component)
- Published to **PyPI**
- Open source, external contributors
- Multi-platform, multi-Python-version support
- ~50 releases so far

</v-clicks>

</div>

<div flex="~ col" items-center>

<img src="/streamlit_webrtc_demo.gif" alt="streamlit-webrtc demo" w="90%" rounded-lg>

</div>

</div>

---
layout: statement
---

## Beyond `git push` → PyPI

<div mt-4 op70 text-xl>
What does a mature OSS library actually need?
</div>

---

# Agenda

<div mt-4 text-xl>

<v-clicks>

- 🧪 **Test & Build** — multi-env testing, idempotent builds
- 📝 **Change Management** — changelog + automated versioning
- 🔒 **Security** — handling untrusted PRs, securing releases
- 📖 **Documentation** — automated docs deployment
- 🧑‍💻 **Developer Experience** — making it easy for contributors

</v-clicks>

</div>

---
layout: section
---

# 🧪 Test & Build Strategy

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

<div v-click mt-4 op80>

Test the **edges of your compatibility matrix** — oldest and newest supported versions.

</div>

---

# Building distributable packages

<div mt-4>

Use `hatch-vcs` to derive the version from **git tags** — single source of truth:

</div>

<div grid="~ cols-2" gap-6 mt-4>

<div>

```toml
# pyproject.toml
[build-system]
requires = ["hatchling", "hatch-vcs"]
build-backend = "hatchling.build"

[tool.hatch.version]
source = "vcs"

[project]
dynamic = ["version"]
```

</div>

<div v-click="1">

<WindowMockup title="Terminal" dark codeblock>

```shell
$ git tag v0.64.5
$ python -m build
Building wheel...
streamlit_webrtc-0.64.5-py3-none-any.whl
```

</WindowMockup>

<div mt-4 op80 text-sm>

No hardcoded version strings anywhere — the git tag **is** the version.

</div>

</div>

</div>

---

# Build artifacts in CI

<div mt-6>

Build once, reuse the artifact for all downstream jobs:

</div>

```yaml {*|5-7|8-12}
  build:
    needs: [test-python, test-frontend]
    steps:
      - run: python -m build
      - uses: actions/upload-artifact@v4
        with:
          name: dist-${{ github.sha }}
          path: dist/
  # Later jobs download the same artifact
  # → no rebuilding, guaranteed same bits
```

<div v-click mt-4 text-lg>

The wheel that passes tests is the **exact same wheel** that gets published.

</div>

---
layout: section
---

# 📝 Change Management

---
layout: statement
---

## How do you keep track of changes<br>and decide the next version number?

---

# The problem

<div mt-6>

<v-clicks>

- Writing changelogs retroactively is painful and error-prone
- Deciding "is this a patch or minor?" at release time is hard
- CHANGELOG.md merge conflicts when multiple PRs land
- Manual versioning invites mistakes

</v-clicks>

</div>

<div v-click mt-8 text-xl>

**Idea**: each PR carries its own changelog entry and version hint.
</div>

---

# Existing approaches

<div mt-4>

<v-clicks>

- **Conventional Commits** — encode intent in commit messages
  - `feat:`, `fix:`, `BREAKING CHANGE:` → auto-generate changelog & version
  - Tools: `semantic-release`, `commitizen`, `release-please`
- **Changelog fragments** — each PR adds a separate file describing the change
  - A bot aggregates fragments at release time
  - Tools: `Changesets` (JS), `scriv` / `towncrier` (Python)
- **Manual** — maintainer writes changelog and bumps version by hand

</v-clicks>

</div>

---

# Why Changesets-style?

<div grid="~ cols-2" gap-6 mt-2>

<div>

**Conventional Commits**

<v-clicks>

- Version intent tied to **commit messages**
- Requires discipline on every commit
- Squash merges lose granularity
- Changelog reads like a git log

</v-clicks>

</div>

<div v-click="1">

**Changelog fragments**

<v-clicks at="5">

- Version intent is a **dedicated file** — reviewed in the PR
- One fragment per PR, not per commit
- Survives squash/rebase; easy to edit **after merge**
- Changelog is **human-written prose**

</v-clicks>

</div>

</div>

<div v-click mt-4 text-center text-lg>

Fragments decouple **"what changed"** from **"how it was committed"**.

</div>

---

# Inspiration: Changesets (JS ecosystem)

<div mt-4>

In the JavaScript world, [Changesets](https://github.com/changesets/changesets) solves this:

</div>

<div grid="~ cols-2" gap-6 mt-4>

<div>

<v-clicks>

1. Developer adds a "changeset" file with their PR
2. File declares: **patch / minor / major** + description
3. On merge, a bot opens a "Version Packages" PR
4. Merging that PR → release

</v-clicks>

</div>

<div v-click="1">

```md
---
"@my-org/utils": minor
---

Added `formatDate()` helper function
for locale-aware date formatting.
```

<div mt-2 op70 text-sm>

A changeset file — lives alongside the code change.

</div>

</div>

</div>

---

# Python equivalent: scriv

<div mt-4>

[`scriv`](https://github.com/nedbat/scriv) is a changelog management tool for Python projects.

</div>

<div grid="~ cols-2" gap-6 mt-4>

<div>

```toml
# pyproject.toml
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
# Creates a fragment file:
# changelog.d/20260316_120000_whitphx.md
```

</WindowMockup>

<div mt-4 v-click="1">

```md
### Fixed
- Resolved WebSocket reconnection
  timeout on slow networks
```

<div op70 text-sm mt-1>

Each PR gets its own fragment file — no merge conflicts!

</div>

</div>

</div>

</div>

---

# Automated version calculation

<div mt-2>

Mapping changelog categories → SemVer bump level (inspired by Changesets):

</div>

```py {*|1-9|11-18}{maxHeight:'340px'}
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

<div v-click op80 mt-2>

The fragments **declare intent** — the version follows automatically.

</div>

---

# The release flow

Two-phase automation, inspired by Changesets' "Version Packages" PR:

<div mt-2>

<div flex="~ col" gap-2>

<div v-click="1" data-id="phase1" border="~ sky/50 rounded-lg" p-2 bg-sky:10 text-sm>

**Phase 1: Changelog Preview PR** (automated)

1. PR with changelog fragments merges to `main`
2. CI runs `scriv collect` → aggregates fragments into CHANGELOG.md
3. CI calculates version via `get_bump_version_level.py`
4. Opens a "Preview changelog" PR

</div>

<div v-click="2" data-id="phase2" border="~ emerald/50 rounded-lg" p-2 bg-emerald:10 text-sm>

**Phase 2: Release** (merge the preview PR)

1. Maintainer reviews changelog, merges the PR
2. CI creates a **git tag** with the calculated version
3. Tag triggers build → test → **publish to PyPI**

</div>

</div>

</div>

<div v-click="3" mt-2 text-center>

Human reviews the changelog. Machine handles the rest.

</div>

---
layout: section
---

# 🔒 Security

---

# The untrusted PR problem

<div mt-4>

When external contributors open PRs, the CI runs their code:

</div>

<div grid="~ cols-2" gap-6 mt-6>

<div v-click="1" border="~ red/50 rounded-lg" p-4 bg-red:10>

**Dangerous: single workflow**

```yaml
on: pull_request
jobs:
  test-and-deploy:
    # Tests run PR author's code
    # Same job has PyPI token 😱
```

<div mt-2 op80 text-sm>

A malicious PR could exfiltrate secrets.

</div>

</div>

<div v-click="2" border="~ emerald/50 rounded-lg" p-4 bg-emerald:10>

**Safe: separated workflows**

```yaml
# test-build.yml (PR context)
# → No secrets, just test & build

# post-build.yml (main context)
# → Has secrets, only runs after
#   test-build completes on main
```

<div mt-2 op80 text-sm>

Secrets never exposed to PR code.

</div>

</div>

</div>

---

# Workflow separation in practice

<div mt-4>

Three workflows, each with a clear responsibility:

</div>

```yaml {*}{maxHeight:'300px'}
# 1️⃣ test-build.yml — triggers on PRs and pushes
on: [push, pull_request]
# Runs tests, builds wheel, uploads artifact
# ⚠️ NO access to secrets

# 2️⃣ post-build.yml — triggers AFTER test-build
on:
  workflow_run:
    workflows: ["test-build"]
    types: [completed]
# Downloads artifact, publishes to PyPI, creates GitHub Release
# ✅ Runs in main branch context → has secrets

# 3️⃣ changelog.yml — triggers on push to main
on:
  push:
    branches: [main]
# Manages changelog preview PRs and version tagging
```

<div v-click mt-2 op80>

Key insight: `workflow_run` runs in the **target branch context** (main), not the PR branch — so secrets are safe.

</div>

---

# Signing and provenance

<div mt-4>

The final piece: **how do users trust the package?**

</div>

<div mt-2>

<v-clicks>

- **Trusted Publishing** (PyPI) — GitHub OIDC authenticates directly, no API tokens
- **Sigstore signing** — ephemeral certificates, verifiable provenance
- **GitHub Release** — signed artifacts attached for auditing

</v-clicks>

</div>

```yaml {*|3-5}{at:4}
  publish-to-pypi:
    permissions:
      id-token: write  # Required for trusted publishing
    steps:
      - uses: pypa/gh-action-pypi-publish@release/v1
        # No token needed! OIDC handles auth
```

---
layout: section
---

# 📖 Documentation

---

# Automated docs deployment

<div mt-4>

Docs are built and deployed as part of the same CI pipeline:

</div>

<div grid="~ cols-2" gap-6 mt-4>

<div>

```yaml
  docs-build:
    steps:
      - run: make docs
      - uses: actions/upload-artifact@v4
        with:
          name: docs
          path: docs/_build/

  docs-deploy:
    needs: [docs-build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: peaceiris/actions-gh-pages@v4
```

</div>

<div v-click="1">

<v-clicks>

- Docs are **always built** (catches broken docs early)
- Only **deployed on main** (no stale previews)
- Same pipeline = docs stay in sync with code
- Consider deploying **versioned docs** for libraries with multiple supported versions

</v-clicks>

</div>

</div>

---
layout: section
---

# 🧑‍💻 Developer Experience

---

# Making it easy for contributors

<div mt-4>

A contributor-friendly workflow lowers the barrier to participation:

</div>

<div mt-4>

<v-clicks>

- **`scriv create --edit`** — one command to add a changelog entry
  - Template guides contributors through the categories
- **PR preview wheels** — deployed to Cloudflare Pages, with a `pip install` command posted as a PR comment
  - Reviewers can test changes before merge
- **Clear CONTRIBUTING.md** — documents the full workflow
- **Automated formatting/linting** — pre-commit hooks and CI checks

</v-clicks>

</div>

<div v-click mt-6 border="~ sky/50 rounded-lg" p-4 bg-sky:10>

The easier it is to contribute correctly, the less time you spend on review.

</div>

---

# PR preview wheels

<div mt-4>

Every PR gets a deployable wheel — reviewers can test with one command:

</div>

```yaml {*|6-8|10-15}{maxHeight:'320px'}
  deploy-preview-wheel:
    if: github.event.workflow_run.event == 'pull_request'
    steps:
      - uses: actions/download-artifact@v4
        # Download the built wheel
      - uses: cloudflare/wrangler-action@v3
        with:
          command: pages deploy dist/ --project-name=my-preview
      # Post a comment on the PR:
      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              body: '🧪 Preview: `pip install <url>`'
            })
```

<div v-click mt-4 op80>

Contributors and reviewers can **try changes immediately** — no local checkout needed.

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

<div mt-6>

<v-clicks>

- **Single source of truth** — git tags for versions, changelog fragments for changes
- **Automate the boring parts** — version calculation, changelog assembly, publishing
- **Keep humans in the loop** — review the changelog PR before release
- **Security by design** — separate trusted/untrusted CI contexts
- **Lower the barrier** — preview wheels, clear docs, contributor-friendly tooling
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
