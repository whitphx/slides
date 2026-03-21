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

<!-- Hey everyone! So this talk is basically a collection of small tips, ideas, and things I learned while developing and maintaining an open source Python package. I hope some of these inspire you — just pick up whatever sounds useful for your own projects. -->

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

<!-- I'm Yuichiro Tachibana, or whitphx online. I build and maintain several open source projects in the Python ecosystem, and today's talk comes from that experience. -->

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

<!-- So this is the project I'll use as a case study. It's a Python library on PyPI, developed with external contributors, over 100 releases now. The workflow I'm showing you evolved over years of maintaining this. If you want to know what the library actually does, I gave a talk about it at EuroPython 2022 — link's on the slide. -->

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

<!-- OK so how do you actually release a Python package? The simplest way — just build and upload from your laptop. That works, but it's fragile. Depends on your local env, easy to skip steps. So most mature projects move this to CI/CD. And for this talk, we'll focus on GitHub Actions, which is also what the official Python packaging guide uses. -->

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

<!-- So these are the two most common starting points you'll find. GitHub's template is pretty minimal — just build and publish. The PyPA guide is better — separates build and publish, uses Trusted Publishing. But neither of them includes testing, changelog management, or any security considerations for open source. We need to build on top of these. -->

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

<!-- So here's what we're going for. Safety, automation, and developer experience. By the end of this talk, you'll see a pipeline where the only thing a human needs to do is review and merge a PR. Everything else? Automated. -->

---

# Agenda

<div mt-6 text-2xl>

<v-clicks>

- 🧪 **Test & Build** — idempotent builds, artifact passing
- 📝 **Change Management** — changelog + automated versioning
- 🔒 **Security** — handling untrusted PRs, securing releases
- 🧑‍💻 **Developer Experience** — making it easy for contributors

</v-clicks>

</div>

<!-- We'll go through four areas. First, idempotent builds and how releases get triggered. Then the biggest chunk — automating changelogs and versioning together. After that, security stuff specific to GitHub Actions. And finally, developer experience — preview wheels and tooling for contributors. Again, these are tips I picked up over time, so take what's useful for you. -->

---
layout: section
---

# 🧪 Test & Build Strategy

<div mt-4 op70>
Build once, test thoroughly, publish the exact same artifact.
</div>

<!-- Alright, let's start with the foundation — building and releasing. -->

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

<!-- This is a really important principle — idempotent builds. You build the wheel once, upload it as an artifact, then download that exact same artifact when it's time to publish. Never rebuild at publish time. That way there's zero chance of environment drift between what you tested and what actually gets shipped. -->

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

<!-- OK so we've got builds. But what actually kicks off a release? A really common pattern is tag-triggered releases — you push a version tag, CI does the rest. Simple and clean. But it raises a question — who creates the tag? And who decides if it's a patch or a minor bump? That's exactly what we'll tackle next. -->

---
layout: section
---

# 📝 Changelog & Versioning

<div mt-4 op70>
Three problems, one story — automate them together.
</div>

<!-- OK, now the biggest part of the talk — changelog and versioning. These two are deeply connected, and the trick is automating them together. -->

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

<!-- I like to think about this as three coupled problems. How do you maintain a changelog? How do you decide the next version and create a tag? And how does the built wheel actually know its version? They're not independent — what changed determines the version, and the version has to flow through to the package. Let me walk you through how streamlit-webrtc evolved through four phases. -->

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

<!-- Phase 1 — everything manual. You edit the changelog by hand, edit the version string in pyproject.toml, commit, tag. Most projects start here. It works, but it's super error-prone. You forget the changelog, typo the version, tag before committing... -->

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

<!-- Phase 2 — so we introduced a tool to help with version bumping. In my case I went with bump-my-version. Now you just say "bump minor" and it updates pyproject.toml and creates the tag. Much better, but the human still decides patch vs. minor, and changelog is still manual. -->

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

<!-- Phase 3 — hatch-vcs. Now the version isn't hardcoded anywhere. hatch-vcs just reads the latest git tag at build time and sets the version automatically. So bump-my-version's job is reduced to just creating the tag. And here's a nice bonus — for non-tagged builds, hatch-vcs generates dev versions like 0.64.6.dev17. That's really handy for preview wheels, which we'll see later. -->

---
layout: statement
---

## Changelog and version bumping<br>are still manual — can we automate them?

<!-- But two of our three problems are still manual — changelog and version bump level. Can we do better? -->

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

<!-- So there are two main approaches out there. They actually share the same idea — you aggregate structured inputs to generate changelogs and calculate versions. The difference is just the input source. Conventional Commits uses commit messages with prefixes like feat: and fix:. Changelog fragments use dedicated files you add per PR. Both can map to SemVer levels automatically. -->

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

<!-- Let me compare them side by side. Conventional Commits ties version intent to commit messages — you need discipline on every commit, and if you squash merge, you lose that granularity, so PR titles have to follow the convention instead. And honestly the changelog tends to read like a git log. Fragments on the other hand are just files in your PR. They survive squash and rebase, you can edit them even after merge, and the changelog ends up being actual human-written prose. I personally prefer fragments, but honestly both work — just pick what fits your team. -->

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

<!-- In the JavaScript world, Changesets is a well-known tool for this kind of thing. It gives you both a local CLI for creating fragments and calculating versions, AND a GitHub Action that automates the whole release flow with PRs. One ecosystem covers everything — fragments, versions, changelogs, CI automation. So the question is — can we get something like this for Python? -->

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

<!-- In Python we have scriv and towncrier for changelog fragments. Here's scriv — you configure your categories in pyproject.toml, run scriv create, and fill in your change description. But here's the thing — these tools only handle changelogs. No version calculation, no CI release flow. So unlike Changesets which covers everything, we need to fill those gaps ourselves. -->

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

<!-- So here's the gap. Changesets covers everything — scriv only does changelogs. I needed to write two things: a Python script that reads fragment categories to figure out the bump level, and a GitHub Actions workflow that replicates the Changesets release flow. Let me show you both. -->

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

<!-- So here's the version calculation script. Pretty simple — it maps scriv categories to SemVer levels. Added and Changed are minor, Removed is major, Fixed and Security are patch. The function reads all the fragments, combines them, finds the highest-priority category, and returns the bump level. It's about 40 lines of Python. And the cool thing is — the same fragments that generate your changelog also determine your version. One source of truth. -->

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

<!-- And here's the CI workflow. It's about 145 lines in the real file, but here's the key idea. It triggers on every push to main and checks for fragments. If fragments exist, it collects them, calculates the version, opens or updates a Release PR. If there are no fragments — that means the Release PR was just merged — so it reads the bump level from the previous commit, creates a git tag, and pushes it. That triggers the build and publish pipeline. So it's one workflow with two behaviors, and it all depends on whether fragment files are there or not. -->

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

<!-- So here's how it all fits together. scriv handles the changelog fragments. The custom script and CI workflow handle version bumping and tagging. And hatch-vcs reads the tag at build time to set the package version. scriv and hatch-vcs are both off-the-shelf tools — the custom stuff just connects them. And remember that dev version bonus from earlier — hatch-vcs gives every non-tagged build a unique dev version, which is perfect for those preview wheels. -->

---
clicks: 9
---

# The release flow

<div grid="~ cols-4" gap-2 mt-2>

<div v-click="1" flex="~ col" items-center transition duration-500 :class="$clicks <= 1 ? 'scale-250 translate-x-70 translate-y-30' : ''">
<img src="/action_create_pr.png" alt="Action: create Release PR" w="100%" rounded-lg border="~ gray/20">
<div op70 text-xs text-center>1. Fragments detected → create PR</div>
</div>

<div v-click="3" flex="~ col" items-center transition duration-500 :class="$clicks <= 3 ? 'scale-250 translate-x-30 translate-y-30' : ''">
<img src="/release_pr.png" alt="Release PR" w="100%" rounded-lg border="~ gray/20">
<div op70 text-xs text-center>2. Release PR with changelog</div>
</div>

<div v-click="5" flex="~ col" items-center transition duration-500 :class="$clicks <= 5 ? 'scale-250 translate-x--30 translate-y-30' : ''">
<img src="/action_release.png" alt="Action: tag and release" w="100%" rounded-lg border="~ gray/20">
<div op70 text-xs text-center>3. <span data-id="merged">Merged</span> → create git tag</div>
</div>

<div v-click="7" flex="~ col" items-center transition duration-500 :class="$clicks <= 7 ? 'scale-250 translate-x--70 translate-y-30' : ''">
<img src="/github_release.png" alt="GitHub Release" w="100%" rounded-lg border="~ gray/20">
<div op70 text-xs text-center>4. Published release</div>
</div>

</div>

<FancyArrow
  v-click="9"
  to="[data-id=merged]"
  arc="-0.2"
>
  <template #tail>
    <span v-click="9" absolute top-80 left-50>Approving the PR is the only manual operation ✅</span>
  </template>
</FancyArrow>

<!-- Let me show you the actual flow with real screenshots. Step 1: a commit with fragments lands on main, the workflow picks them up and creates a Release PR. Step 2: here's what that PR looks like — the bot created this, not me. Step 3: I just review it and hit merge. The workflow sees no fragments left, so it creates a git tag. Step 4: that tag triggers the build pipeline, publishes to PyPI, creates a GitHub Release. The only thing I actually did was click merge. Everything else happened automatically. -->

---
layout: section
---

# 🔒 Security

<div mt-4 op70>
Open source means untrusted code runs in your CI — GitHub Actions has specific pitfalls.
</div>

<!-- Alright, let's talk about security. When you accept contributions from external developers, their code runs in your CI. And GitHub Actions has some specific things you really need to be aware of. -->

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

<!-- So in GitHub Actions, different events run in totally different contexts. The pull_request event runs the PR author's code — meaning external contributors can run arbitrary code in your CI. But GitHub does protect you — it gives a read-only token, no access to secrets. On the other hand, workflow_run runs in the default branch context — only merged code runs, and it gets full access to secrets. So the principle is simple: test on pull_request where you don't need secrets, deploy on workflow_run where secrets are safe. -->

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

<!-- So here's how we split it into three files. test-build.yml triggers on pushes and PRs — runs tests, builds the wheel, but no secrets. post-build.yml triggers via workflow_run after test-build finishes — runs in the default branch context with secrets, so it can publish to PyPI and create releases. And changelog.yml handles the release PR flow we talked about. This way, untrusted PR code never touches your deployment credentials. -->

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

<!-- Last security piece — how do users actually trust your package? Trusted Publishing uses OIDC, so your workflow authenticates directly with PyPI. No API tokens stored anywhere. Sigstore signing gives you verifiable provenance — anyone can check that this wheel was built by this workflow in this repo. And GitHub Releases attach the signed artifacts for auditing. Look at the snippet — id-token: write is literally all you need. No PyPI token anywhere in your repo. -->

---
layout: section
---

# 🧑‍💻 Developer Experience

<div mt-4 op70>
Make it easy to contribute correctly — so you spend less time on review.
</div>

<!-- OK, last section — developer experience. If you make it easy to contribute correctly, people just do the right thing and you spend way less time on review. -->

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

<!-- Two things that really help. First, scriv create --edit — just one command to add a changelog fragment. The template walks contributors through the categories so they don't have to guess. Second, PR preview wheels. Every PR automatically gets a wheel deployed to Cloudflare Pages, with a pip install command right in the PR comments. Reviewers can try changes immediately without checking out the branch. -->

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

<!-- Here's what that workflow looks like. Notice it runs in workflow_run context — because deploying to Cloudflare Pages needs secrets that aren't available in pull_request. It downloads the built wheel, deploys it, and posts a comment with the pip install command. On the right you can see the actual comment — contributors just copy-paste that pip install and they're testing the changes. No checkout needed. -->

---
layout: section
---

# Putting It All Together

<!-- Alright, let's bring it all together. -->

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
<div>PR merges → CI opens a <strong>Release PR</strong></div>
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

<!-- Here's the whole thing end to end. A contributor opens a PR with code and a scriv fragment. CI builds the wheel, deploys a preview. When the PR merges, CI opens a Release PR with the aggregated changelog. I review it and merge — that's the only thing I actually do. CI creates a git tag, publishes to PyPI, creates a GitHub Release with Sigstore signatures. One click from me, everything else is automated. -->

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

<!-- So to wrap up — single source of truth for versions and changes. Automate the boring stuff but keep humans in the loop for the important decisions. Think about security from the start. Make it easy for people to contribute. And don't be afraid to steal ideas from other ecosystems — this whole approach was inspired by Changesets from JavaScript, just adapted with Python tools. -->

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

<!-- Here are all the links if you want to dig deeper. The streamlit-webrtc repo has the actual workflow files — feel free to check them out. -->

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

<!-- Thanks everyone! I hope you got some ideas for your own projects. The repo's all public if you want to look at the actual code, and feel free to reach out if you have questions. -->
