---
name: slidev-deck
description: >
  Create or improve Slidev presentation decks in this monorepo, including planning
  a talk's narrative arc and slide list before any slides are written.
  Use this skill whenever the user wants to create a new presentation, add slides,
  update an existing deck, outline or restructure a talk, or asks about Slidev slide
  authoring in this project.
  Triggers on: "create a deck", "new presentation", "add slides", "make a talk",
  "plan a talk", "outline my talk", "restructure this deck", "update my slides",
  or any mention of creating/editing presentation content.
---

# Slidev Deck Creator

You are creating or improving a Slidev presentation deck in this monorepo. The `decks/` directory contains many existing presentations — study them (especially the most recent ones with higher date prefixes) to match the author's established style.

## Workflow

### 1. Understand the request

The user may provide:
- A talk proposal or abstract (the "what" of the presentation)
- An outline or content draft
- A request to modify an existing deck
- A topic description

Ask clarifying questions if you need more context about the audience, event, talk length, or emphasis. These answers shape the plan in section 3, so it's worth asking before drafting it rather than after.

Ask them with the `AskUserQuestion` tool, not as prose. Picking an option is faster than composing a reply, and the options themselves show the user which facts the plan actually turns on. This matters most when the skill is invoked with no request attached, where a prose menu asks the user to type out something you could have offered as a choice.

Build the options from what is actually in the repo. "Which deck?" should list real directory names from `decks/`, most recent first, rather than asking the user to remember one. Slot length, audience level, and deck language are all natural choices too. Leave genuinely open content as free text — the talk's topic, a pasted abstract, what went wrong when they last gave it — since the tool's own free-text option already covers the cases your options miss.

### 2. Content design principles

These principles are the material you draft the plan from. The **information flow** — a chain of well-connected ideas where each slide sets up the next — is decided in the plan, where it costs a line to change, not in slides.md, where it costs a rewrite.

#### Narrative structure

- **Start from what the audience already knows.** Introduce the simplest or most common approach first, then progressively build toward more advanced solutions. For example, if the talk is about CI/CD workflows, start with "run a build script locally" before jumping to "GitHub Actions matrix builds."
- **Every technique needs motivation.** Before introducing a tool or methodology, explain the **problem** it solves. The audience must feel the pain before they can appreciate the cure. A slide that says "Use scriv for changelogs" without first showing why manual changelogs are painful will not land.
- **Connect slides explicitly.** Each slide should flow into the next. End problem slides with a question or tension ("But who decides the version?") that the next slide resolves. Avoid abrupt topic jumps.
- **Section headers can carry a subtitle** that previews the section's motivation (e.g., "Catch bugs before they reach users — across every supported environment"). Use this when it helps orient the audience, but don't force it on every section.

#### Accuracy and assumptions

- **Don't assume prior knowledge.** If a slide references a concept (e.g., "tag-triggered releases," "OIDC authentication"), either explain it briefly or ensure a previous slide has introduced it. The audience should never need to guess what you mean.
- **Scope your claims to the specific tool/platform.** If a behavior is specific to GitHub Actions (e.g., `workflow_run` execution context, `pull_request` event permissions), say so explicitly. Don't present platform-specific behavior as universal truth. If the entire talk uses one CI platform, establish this early and justify the choice (e.g., "The official Python packaging guide also uses GitHub Actions").
- **Be precise about tool relationships.** If multiple tools work together (e.g., `hatch-vcs` reads tags at build time, `bump-my-version` creates tags at release time), explain each tool's role clearly. Don't imply one replaces the other when they actually complement each other.
- **Don't reference unstable or configurable names as if they're fixed.** If a PR title, branch name, or label is configurable, describe it generically (e.g., "a Release PR") rather than using a specific default name that may differ across projects.

#### Content quality

- **Slides that compare approaches should be fair.** Present both sides with concrete examples, not just bullet points of pros/cons. Show the audience *what it looks like* to use each approach, then let them see the tradeoff.
- **When presenting an evolution/journey, use a consistent framing.** If you're showing how a project evolved through phases, keep the same set of problems visible across phases so the audience can track what improved (e.g., a table with "Changelog | Version bump | Package version" across phases).
- **Code examples must be accurate.** If you show a workflow snippet, it should reflect what the tool actually does — not a plausible-looking approximation. When the actual code is too long, show the structure as pseudocode/comments but label it clearly (e.g., "concept — actual workflow is ~145 lines").
- **Use the "Context" or "Case study" slide to set the stage**, not to showcase the project's features. The audience should understand *why this project is a good example* for the topic (e.g., many releases, external contributors, CI complexity), not what the project does as a product.
- **Use emojis to make slides attractive and pull attention.** Emojis work well as visual markers in bullet lists (e.g., `- 🧪 **Test & Build**`, `- 🔒 **Security**`), section headers, and statement slides. They help the audience scan and remember key points. However, avoid overuse — not every bullet needs an emoji. Good use cases:
  - Section titles or agenda items: `🧪`, `📝`, `🔒`, `🧑‍💻`
  - Status indicators: `⚠️ NO access to secrets`, `✅ Has secrets`
  - Reward/benefit lists: `💬 Talk opportunities`, `💼 Job opportunities`, `👛 Sponsorship`
  - Emotional emphasis on statement slides: `Share it! 👍`
- **Presenter notes should be written in spoken language tone**, not formal written style. Use contractions ("don't", "it's", "we'll"), filler phrases ("OK so", "alright", "honestly"), and conversational transitions ("let me show you", "here's the thing"). The notes are meant to be read aloud as a speaking script, not as documentation. Avoid overly polished or academic phrasing.

### 3. Plan the talk before building it

Settle the story before writing a single slide, and present that story for approval.

The reason is not process hygiene. Once `slides.md` exists, attention migrates to layout, overflow, click timing, and whether the code block fits — and the narrative, which is what actually decides whether the talk lands, quietly stops getting examined. Reviewing an outline takes a minute and rewriting it takes another; reaching the same conclusion after 40 slides exist costs an afternoon. The plan is also where you surface the things neither of you can know until the shape of the talk is on the page: that a section has no motivation, that two beats are the same beat, that 30 minutes doesn't hold this much.

So this is a real gate. Present the plan and stop — no scaffolding, no `package.json`, no `slides.md` — until the user approves.

**When to plan:**

- **New deck** — always.
- **Substantial change to an existing deck** — restructuring the order, adding or removing a whole section, changing what the talk argues. Plan the part that's changing, against the deck as it stands.
- **Small, local edits** — fixing an overflow, rewording a slide, swapping an image, adding a couple of slides inside an existing section. Skip the gate and just do the work; a planning round-trip on a one-slide fix wastes the user's turn.

When a request sits on the line, ask instead of guessing. "This sounds like a restructure rather than a tweak, want me to sketch the new arc first?" costs one sentence.

One case comes up often enough to be worth naming: the change you are asked for duplicates something the deck already says elsewhere. Let the distance decide. If the two would differ in framing and in the job they do, a foreshadow early and the gotcha later, or a design caveat in one place and a runtime mechanic in another, make the edit, say where the other one lives, and write the earlier one as a forward reference so the second lands as a payoff rather than a repeat. If it would be near-verbatim repetition, do not edit: say what already covers it and where, and let the user choose. The test is whether an audience hearing both would feel the second building on the first, or wonder why they were told twice.

#### Stage 1 — the narrative arc

Present the arc **alone**, with no slide titles, counts, or layouts. Slide-level detail at this stage pulls feedback toward slides when the thing that needs feedback is the story.

An arc is a chain of tension and release. Each beat starts where the audience currently stands, exposes a problem they can feel, and hands that problem to the next beat. Write each one as **what the audience gains** plus **the pain that forces the next step**. If a beat has no pain, it has no reason to be followed by anything — that's the signal to merge it or cut it, and saying so is more useful than quietly padding it out.

```
STAGE 1 — Narrative arc
Shipping Python packages without tokens — 30 min, PyCon, intermediate

1. Where we start: pytest on your laptop, twine upload from your laptop
   Pain: "works on my machine", plus a PyPI token sitting in your shell history

2. Move testing into CI, on every push
   Pain: green on 3.12 only — your users are on 3.9 through 3.13

3. Matrix builds across versions and OSes
   Pain: fork PRs can't touch secrets, so releasing is still a manual ritual

4. Trusted publishing — OIDC instead of a long-lived token
   Payoff: nothing to leak, nothing to rotate

Cut from your draft: the section on conda-forge. It's a different distribution
story and beat 3 already fills the middle.

Assumed: they read basic Actions YAML but not `workflow_run`. Tell me if that's
too generous — beat 3 changes shape if it isn't.
```

Keep each beat to a few lines. The arc earns its keep by being holdable in one glance — the user can see the whole chain at once and judge whether each link really pulls the next. A beat that needs a paragraph to justify itself usually hasn't been reduced to its idea yet, and the paragraph hides that rather than fixing it. Detail belongs in the sections below, not in the beats.

Two sections earn their place alongside the arc:

**What you want decided.** Questions where a different answer changes the plan rather than a detail of it. Lead with anything that would invalidate the arc outright — the language the deck is written in, the length of the slot, whether a whole section survives — and say plainly that it's blocking. A question sitting eighth in a list reads as optional, and the expensive ones are exactly the ones that must not.

**What you assumed.** Audience level, what you cut from the user's material and why, which parts of the request you read as firm. An assumption corrected here costs a sentence; the same assumption discovered on slide 30 costs the section.

Then stop and ask for approval, in the form described under *Asking for approval* below.

#### Stage 2 — the slide list

Once the arc is approved, expand it into slides. Slide-level judgment is now the point: how many slides a beat deserves, which format carries each idea, where animation earns its place.

Group the slides under the approved beats so the story stays visible and the user can see it survived the expansion. Give each slide a title, a format, and one line of content. Formats are the vocabulary from section 5 and from `references/slidev-syntax.md` — `title`, bio, `section`, `statement`, bullets, code block, `WindowMockup`, comparison table, image grid, `FancyArrow` diagram, magic-move, `anipres`. Varying them is a design decision worth making here rather than discovering later that thirty slides in a row are bullet lists.

```
STAGE 2 — Slide list (38 slides, ~30 min)

Opening (3)
   1. Title                  title         "Shipping Python packages without tokens"
   2. Hi 👋                  simple bio    name, handle, avatar
   3. Agenda                 bullets       the four beats — 🧪 📦 🔒 🚀

Beat 1 — pytest on your laptop (5)
   4. "It works on my machine"  section    + subtitle: the pain everyone has felt
   5. Local test run         WindowMockup  terminal, pytest all green
   6. ...then twine upload   WindowMockup  terminal, token pasted inline
   7. That token             statement     "It's in your shell history now" ⚠️
   8. Three ways this bites  bullets       v-clicks, one failure mode each

Beat 2 — CI on every push (7)
   9. ...
```

Check the count against the time budget, and say so when the plan runs long — with a concrete proposal for what to cut, ordered. Do that here rather than after building, where cutting means deleting work.

Calibrate the count against this author's own decks rather than a generic rule of thumb. They run far denser than the minute-or-two per slide that general presentation advice assumes, because many slides are a single statement, a click reveal, or one step of an animation, and those go by in seconds. Corrected counts put recent decks around 30 to 55 slides for slots between 25 and 40 minutes, and that is the level to plan against.

Counting takes a little care, because `---` separates slides but also delimits the headmatter and any per-slide frontmatter block. A plain `grep -c '^---$'` therefore runs high, by around 15 to 20 per cent on the decks here, and subtracting the `layout:` lines does not correct it either since not every frontmatter block sets one. Treat the grep as an upper bound, or count properly by skipping each frontmatter block.

Then stop and ask for approval again, the same way.

#### When the plan is the deliverable

Some requests ask for the plan and nothing else — "outline my talk", "sketch an arc for this proposal", "how would you structure this?". There the approved slide list *is* the finished work, and sections 4 onward never run. Approving a plan says the plan is right; it does not say to start building from it.

So read the original request, not the approval, for permission to build. Asked for a deck, section 4 follows the Stage 2 approval as a matter of course. Asked for a plan, stop at the approved slide list, say plainly that no deck exists yet, and offer to build it. When you genuinely can't tell which was asked for — a pasted abstract with no verb around it is ambiguous — make it one of the choices in the Stage 2 approval prompt instead of guessing. This one can wait that long precisely because nothing in the plan changes either way; it decides only what follows the plan. Guessing wrong writes a package and forty slides into the repo that nobody asked for, and that is the expensive direction to be wrong in.

#### Asking for approval

Put the approval in an `AskUserQuestion` prompt rather than a closing line of prose. Offer approving, revising, and rethinking as separate choices, because they mean genuinely different things: revising accepts the shape and changes what fills it, rethinking says the shape itself is wrong. Which one the user picks tells you how much of the plan to throw away, and that is worth knowing before you read their explanation of why. Nothing is lost by offering the choice, since the tool always carries a free-text option for the paragraph of specific changes.

Ask the blocking questions in the same prompt when they have discrete answers, which the expensive ones usually do: deck language, slot length, how hard to cut a section, which of two framings to build on. `AskUserQuestion` takes several questions at once, so the user settles the approval and the decisions it depends on in one pass instead of a chain of round trips. Keep questions whose answer is a story in prose, where they belong.

The two arrive together, though, and that creates a trap: the user can approve a 30-minute arc while, in the question beside it, choosing a 15-minute slot. The approval is real but it is an approval of a plan that the same reply just invalidated. So when an answer contradicts what the plan assumed, the approval riding along with it does not carry — rework the stage against the new answer and ask again, rather than treating the tick as permission to move on. Say why you're asking twice. Settle anything you already suspect will move the plan back in section 1 instead; the questions that reach this prompt should mostly be the ones the drafting itself turned up.

#### PLAN.md

Write the plan to `decks/<deck-name>/PLAN.md`, creating the directory now if it doesn't exist (the package scaffolding comes later, in section 4). Present it in the conversation too — that's usually where the discussion happens — but the file is what the user can edit directly and what you re-read while writing slides.

Open it with a status line naming the stage it has reached and what hasn't started:

```
**Status:** Stage 1 (narrative arc) — awaiting approval. Stage 2 (slide list) not started.
```

Whoever opens the file next — often you, in a later session — cannot tell from the content alone whether they are looking at an approved plan or a draft still waiting on a reply. Building from an unapproved plan is precisely the failure this section exists to prevent, so make the file say which it is. Record it there when the plan was the whole ask, too — an approved slide list looks identical whether the deck is pending or was never requested, and the later session is the one that will act on the difference.

When the plan covers a change to part of an existing deck, record the untouched parts too, briefly, as a map. The user is judging whether the new material fits the talk they already have, and they can't see that from the changed section alone.

Keep it current. When the deck changes direction during slide writing — a beat gets cut, two slides merge, a section moves — update `PLAN.md` in the same pass. A stale plan is worse than no plan, because the next session will trust it. It should always read as a map of the talk as it actually stands.

### 4. Create the deck package (for new decks)

Create a new directory under `decks/` following the naming convention: `YYYYMM-short-kebab-description` (e.g., `202603-pycon-async-patterns`).

**package.json** — use the latest Slidev CLI version and only include addons you actually need:

```json
{
  "name": "YYYYMM-short-description",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "slidev build",
    "dev": "slidev --open",
    "export": "slidev export"
  },
  "dependencies": {
    "@iconify-json/ri": "^<LATEST>",
    "@slidev/cli": "^<LATEST>"
  }
}
```

**Dependency versions**: Do NOT use the hardcoded versions shown above. Before writing `package.json`, look up the latest version of each dependency by checking an existing deck's `package.json` in this repo or by running `npm view <package> version`. Use caret ranges (`^`) with the latest version for each package.

**Icons**: Slidev uses [unplugin-icons](https://github.com/antfu/unplugin-icons) with [Iconify](https://iconify.design/). To use icons, install the corresponding `@iconify-json/{collection-name}` package. The author's decks primarily use Remix Icons (`i-ri-*` classes), so `@iconify-json/ri` is the standard choice. If you need icons from other collections (e.g., Material Design `i-mdi-*`, Carbon `i-carbon-*`), add the corresponding package (e.g., `@iconify-json/mdi`).

Icons are used as HTML elements with UnoCSS classes: `<div i-ri-github-line />`. You can style them like any other element: `<div i-ri-github-line op50 ma text-2xl />`.

Browse available icons at [Icônes](https://icones.js.org/) or [Iconify](https://icon-sets.iconify.design/).

Add addons to `dependencies` only when the content requires them:
- `"slidev-addon-anipres"` — for complex graphical animations and free-style drawing areas
- `"slidev-addon-fancy-arrow"` — for arrows pointing between elements on slides
- `"slidev-addon-window-mockup"` — for macOS-style window frames around code/content
- `"slidev-addon-qrcode"` — for QR codes linking to URLs

Look up the latest version for each addon the same way (check existing decks or `npm view`).

After creating package.json, run `pnpm install` in the deck directory.

### 5. Write slides.md

The authoring syntax you need from here on lives in `references/slidev-syntax.md` (see section 6). Read it before editing `slides.md`, since this section covers only the deck's own conventions: frontmatter, the title and bio slides, and the section layouts.

#### Frontmatter

Always use this structure (adjust addons list based on what's actually used):

```yaml
---
theme: ../../themes/triangle
title: "Presentation Title"
drawings:
  persist: false
mdc: true
themeConfig:
  primary: '#36709E'
defaults:
  transition: slide-left
transition: fade-out
addons:
  - anipres
---
```

**Theme selection:**
- `../../themes/triangle` — the default choice for most presentations (generative triangle tessellation background)
- `../../themes/alpha` — alternative with animated gradient background

Only list addons in the frontmatter `addons:` field that are actually used in the slides. Use the short name (without `slidev-addon-` prefix) in the frontmatter — e.g., `anipres` not `slidev-addon-anipres`. The full package name with prefix is only used in `package.json` dependencies.

#### Slide structure

**Title slide** — use raw HTML `<h1>` with optional UnoCSS sizing:

```html
<h1>
Talk Title Here
</h1>
```

Or with larger text:

```html
<h1 text-6xl leading-18>
Talk Title Here<br>
<small>Subtitle or clarification</small>
</h1>
```

**Author/bio slide** — choose the appropriate level of detail based on the talk content:

**Full portfolio bio** — use when the talk topic is directly supported by the author's projects and experience (e.g., talks about OSS, Streamlit, Gradio, browser-based Python). This version lists created projects, contributions, and past talks to establish credibility on the topic. Copy the full bio slide from the most recent deck that uses it (e.g., `decks/202602-oss-give-and-take/`), including the portfolio `<style>` block and `public/portfolio/` assets.

**IMPORTANT: Copy all referenced assets.** When copying a bio slide (or any slide) from another deck, check every `<img src="/...">` path in the slide markup and ensure the corresponding files exist in the new deck's `public/` directory. The portfolio bio slide typically references both `public/portfolio/*.svg|png` images **and** `public/github_whitphx.png` (the GitHub profile screenshot). Missing any of these will cause a Vite build error. Always list the source deck's `public/` directory and copy all assets that are referenced by the slides you are reusing.

**Simple bio** — use when the talk is technical and the author's identity is secondary to the content (e.g., deep-dive into AST manipulation, a specific algorithm, or a language feature). Keep it minimal:

```html
# Hi 👋

<div text-5xl leading-20 mt-10 ml-10>
Yuichiro Tachibana<br>
橘 祐一郎<br>
<small>@whitphx</small>
</div>

<div absolute top-50 right-40>
<img src="https://avatars.githubusercontent.com/u/3135397?v=4" alt="whitphx" w="130px">
</div>
```

Use your judgment: if the audience benefits from knowing the author's background and project portfolio (because the talk is about those projects or that domain), use the full bio. If the talk stands on its own and the audience just needs a name, use the simple version.

**Section breaks** — use Slidev layouts:

```
---
layout: section
---

# Section Title
```

```
---
layout: statement
---

## A bold statement or question
```

#### Slide separators

Use `---` to separate slides. Place layout declarations right after the separator:

```
---
layout: section
---
```

### 6. Slide syntax reference

The authoring syntax lives in `references/slidev-syntax.md`: animation directives (`v-clicks`, `v-click`, `v-mark`, magic-move), the addons (`FancyArrow`, `WindowMockup`, `Anipres`, `QRCode`), UnoCSS styling patterns, code block options including the `maxHeight` rules that keep tall blocks from overflowing the slide, images and video, and custom components.

Read it before writing or editing `slides.md`. Planning does not need it, which is why it sits in its own file.

### 7. Important notes

- Always run `pnpm install` after creating/modifying `package.json`
- The `public/` directory is for static assets (images, videos, etc.)
- **Verify all image references**: After writing `slides.md`, scan every `<img src="/...">` path and confirm the file exists in the deck's `public/` directory. Missing images cause Vite build errors at dev/build time.
- Portfolio images are typically shared — copy from a recent deck's `public/portfolio/` and also any other `public/*.png|svg` files referenced by reused slides
- Test the deck with `pnpm dev` when possible
- Keep slide count appropriate for the talk length, calibrated against recent decks of a similar slot length rather than a generic per-slide rule (see section 3)
- When content is provided in a language other than the target presentation language, translate appropriately
- Prefer structured HTML with UnoCSS over plain markdown for non-trivial layouts
- The author's social links and bio slide content should be kept up-to-date by referencing the most recent deck
- **Prevent vertical overflow**: Slides have a fixed viewport height. Content that is too tall will be silently clipped — there is no scrollbar in presentation mode. Watch out for:
  - **Code blocks**: Always add `maxHeight` (e.g., `{maxHeight:'320px'}`) for blocks longer than ~10 lines.
  - **Stacked content**: When a slide has a title + description + code block + footer text, the total height can easily exceed the viewport. Reduce margins (`mt-2` instead of `mt-6`), padding (`p-3` instead of `p-4`), or trim content.
  - **Bullet lists with nested items**: Deep nesting or many items can push content off-screen.
  - **Don't shrink text to fit**: Avoid using `text-sm` or `text-xs` to cram more content into a slide — this makes text unreadable for the audience. Instead, split the content across multiple slides or reduce the amount of content.
- **Visually verify slides**: Overflow issues can only be reliably detected by viewing the rendered slides. If a Playwright MCP browser is available, use it to navigate to each content-heavy slide (at its final click state, e.g., `http://localhost:3030/{slide}?clicks=999`) and take screenshots to check for clipping. The `/export` route shows all slides rendered at once but is less precise for overflow detection than individual slide views.
