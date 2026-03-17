---
name: slidev-deck
description: >
  Create or improve Slidev presentation decks in this monorepo.
  Use this skill whenever the user wants to create a new presentation, add slides,
  update an existing deck, or asks about Slidev slide authoring in this project.
  Triggers on: "create a deck", "new presentation", "add slides", "make a talk",
  "update my slides", or any mention of creating/editing presentation content.
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

Ask clarifying questions if you need more context about the audience, event, talk length, or emphasis.

### 2. Create the deck package (for new decks)

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
    "@iconify-json/ri": "^1.2.5",
    "@slidev/cli": "^52.8.0"
  }
}
```

**Icons**: Slidev uses [unplugin-icons](https://github.com/antfu/unplugin-icons) with [Iconify](https://iconify.design/). To use icons, install the corresponding `@iconify-json/{collection-name}` package. The author's decks primarily use Remix Icons (`i-ri-*` classes), so `@iconify-json/ri` is the standard choice. If you need icons from other collections (e.g., Material Design `i-mdi-*`, Carbon `i-carbon-*`), add the corresponding package (e.g., `@iconify-json/mdi`).

Icons are used as HTML elements with UnoCSS classes: `<div i-ri-github-line />`. You can style them like any other element: `<div i-ri-github-line op50 ma text-2xl />`.

Browse available icons at [Icônes](https://icones.js.org/) or [Iconify](https://icon-sets.iconify.design/).

Add addons to `dependencies` only when the content requires them:
- `"slidev-addon-anipres": "^0.8.7"` — for complex graphical animations and free-style drawing areas
- `"slidev-addon-fancy-arrow": "^0.13.10"` — for arrows pointing between elements on slides
- `"slidev-addon-window-mockup": "^0.3.0"` — for macOS-style window frames around code/content
- `"slidev-addon-qrcode": "^1.0.2"` — for QR codes linking to URLs

After creating package.json, run `pnpm install` in the deck directory.

### 3. Write slides.md

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

### 4. Animations and interactivity

Animations are a core part of this author's style. Apply them thoughtfully:

**Bullet point reveals** — wrap lists in `<v-clicks>`:

```html
<v-clicks>

- First point
- Second point
- Third point

</v-clicks>
```

For nested lists with depth control: `<v-clicks depth="2">`.

**Don't overuse bullet points.** Bullet lists are useful for enumerating discrete items, but not every slide should be a list. When the content is better expressed as a narrative, a diagram, a code example, a comparison table, or a visual layout with positioned elements, use those instead. Vary the slide formats to keep the audience engaged — a deck full of bullet-point slides feels monotonous. Look at the existing decks for inspiration: they mix bullet lists with grids, code blocks, images, modals, statement slides, and free-form HTML layouts.

**Individual element reveals** — use `v-click` directive:

```html
<div v-click="1">Appears on click 1</div>
<div v-click="2">Appears on click 2</div>
```

**Hide on click**: `v-click.hide="3"` hides the element at click 3.

**Text emphasis** — use `v-mark` directive for dynamic highlighting:

```html
<span v-mark.highlight.orange>important text</span>
<span v-mark.underline.red="3">appears at click 3</span>
```

**IMPORTANT: `v-mark` inside `<v-clicks>`** — When using `v-mark` on elements inside a `<v-clicks>` container, you must explicitly specify the click number on the `v-mark` so that the mark animation triggers at the same time as (or after) the element becomes visible. Without an explicit click number, `v-mark` defaults to an early click index and the animation fires before the element is shown, making it invisible.

```html
<!-- BAD: v-mark fires before the item is revealed by v-clicks -->
<v-clicks>

- <span v-mark.highlight.orange>This mark may not be visible</span>
- Another point

</v-clicks>

<!-- GOOD: explicit click number ensures mark fires when/after item appears -->
<v-clicks>

- <span v-mark.highlight.orange="2">This mark is visible at click 2</span>
- Another point

</v-clicks>
```

The same applies to `v-mark` on any element that is inside a `v-click` container — always coordinate the click numbers.

Other `v-mark` styles:

```html
<span v-mark.circle.red>circled</span>
<span v-mark.box.orange>boxed</span>
```

**Code highlighting with line reveals**:

````
```py {*|1-3|5-8}
# Lines revealed progressively
```
````

**Magic-move** — for animated code transitions:

`````
````md magic-move {at: 3}

```py
# Version 1
code_v1()
```

```py
# Version 2
code_v2()
```

````
`````

### 5. Addons usage

#### FancyArrow

For pointing between elements. Give source/target elements `data-id` attributes, then reference them:

```html
<div data-id="source">Source element</div>
<div data-id="target">Target element</div>

<FancyArrow from="[data-id=source] @ right" to="[data-id=target] @ left" arc="0.3" v-click="1" />
```

You can also point to specific code lines:
```html
<FancyArrow from="[data-id=desc] @ left" to="[data-id=codeblock] .line:nth-child(5) @ right" arc="-0.2" />
```

FancyArrow can have content (label):
```html
<FancyArrow from="[data-id=a] @ right" to="[data-id=b] @ left" arc="0.6" v-click="1">

`ast.parse(code)`

</FancyArrow>
```

Position syntax: `@ left`, `@ right`, `@ top`, `@ bottom`, `@ topleft`, `@ topright`, `@ (X%,Y%)`.

#### WindowMockup

Wraps content in a macOS-style window frame. Especially good for terminal output and shell commands:

```html
<WindowMockup title="Terminal" dark codeblock>

```shell
$ python main.py
Hello, world!
```

</WindowMockup>
```

Props: `title`, `dark`/`light`, `codeblock` (adjusts padding for code blocks), `padding`.

#### Anipres

For complex graphical animations. Declare the addon and use:

```html
<SlidevAnipres id="my-animation" v-click="1" at="2" />
```

The animation data lives in `.slidev/anipres/` directory. In most cases, leave the animation area empty and ask the user to edit the motion/shape data manually through the Slidev UI, as the data format is complex.

#### QRCode

```html
<QRCode :width="180" :height="180" type="svg" data="https://example.com"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
```

### 6. Styling patterns

Use UnoCSS utility classes directly on HTML elements (Attributify mode):

**Layout:**
```html
<div grid="~ cols-2" gap-4>        <!-- 2-column grid -->
<div flex="~ col" items-center>    <!-- flex column, centered -->
<div flex="~ gap-1" items-center>  <!-- flex row with gap -->
```

**Spacing:** `mt-8`, `ml-10`, `mx-auto`, `my-8`

**Sizing:** `w-full`, `h-50`, `w="400px"`, `h="100%"`

**Text:** `text-2xl`, `text-4xl`, `text-6xl`, `leading-18`, `op50`, `font-300`

**Positioning:** `absolute`, `top-20`, `right-0`, `bottom-10`, `left-12`

**Borders:** `border="~ sky/50 rounded-lg"`, `border-none!`

**Background:** `bg-sky:10`, `backdrop-blur-md`, `rounded-lg`

**Code font size** — adjust per slide via scoped style:

```html
<style>
* {
  --slidev-code-font-size: 22px;
}
</style>
```

### 7. Code blocks

**Inline code blocks** with syntax highlighting:

````
```py {*|1-3|5-8}{'data-id': 'my-code', 'max-height': '450px'}
import ast
# ...
```
````

**Code fence meta string format**: Multiple curly-brace option blocks must be written **adjacent with no space** between them. A space between blocks can cause Slidev/Shiki to silently fail to parse the second block.

```
✅ ```yaml {*|3-5}{at:4}{maxHeight:'320px'}
❌ ```yaml {*|3-5} {at:4}    ← space breaks parsing
```

**IMPORTANT: Prevent code block overflow.** Code blocks have no default height limit, so tall code blocks will overflow the slide viewport and get cut off at the bottom. For any code block longer than ~10 lines, always add `maxHeight` to constrain it within the slide. Use `{maxHeight:'300px'}` to `{maxHeight:'380px'}` depending on how much other content is on the slide. The `maxHeight` property goes in the curly-brace options after the line highlight spec:

````
```yaml {*|3-8}{maxHeight:'320px'}
# long code here...
```
````

If a code block *and* surrounding text together overflow, either reduce `maxHeight`, trim the code, or reduce margins/padding on other elements. Always consider total slide height when combining code blocks with titles, descriptions, and footer text.

**External code imports** — when code blocks are long, externalize to files:

```
<<< @/samples/py/example.py py {*}
<<< @/samples/py/example.py#section_name py {1-5|7-10}
```

Create a `samples/` directory in the deck for externalized code. Use `#region_name` syntax in the source file to import specific sections.

### 8. Images and media

```html
<img src="/image.png" alt="Description" h-50 mx-auto>

<!-- Grid of images -->
<div grid="~ cols-2" gap-4>
  <img src="/a.png" w-full>
  <img src="/b.png" w-full>
</div>

<!-- Absolute positioned overlay -->
<div absolute top-20 right-0>
  <img src="/overlay.png" w="400px">
</div>
```

Place images in the deck's `public/` directory.

**Video:**
```html
<SlidevVideo autoplay muted controls loop>
  <source src="/demo.mov" />
</SlidevVideo>
```

**Tweet embeds:**
```html
<Tweet id="1234567890" />
```

### 9. Custom components

If you need reusable slide components, create them in a `components/` directory within the deck. See existing `Modal.vue` components in decks like `202510-oss-handson` for reference patterns.

### 10. Important notes

- Always run `pnpm install` after creating/modifying `package.json`
- The `public/` directory is for static assets (images, videos, etc.)
- **Verify all image references**: After writing `slides.md`, scan every `<img src="/...">` path and confirm the file exists in the deck's `public/` directory. Missing images cause Vite build errors at dev/build time.
- Portfolio images are typically shared — copy from a recent deck's `public/portfolio/` and also any other `public/*.png|svg` files referenced by reused slides
- Test the deck with `pnpm dev` when possible
- Keep slide count appropriate for the talk length (roughly 1-2 minutes per slide)
- When content is provided in a language other than the target presentation language, translate appropriately
- Prefer structured HTML with UnoCSS over plain markdown for non-trivial layouts
- The author's social links and bio slide content should be kept up-to-date by referencing the most recent deck
- **Prevent vertical overflow**: Slides have a fixed viewport height. Content that is too tall will be silently clipped — there is no scrollbar in presentation mode. Watch out for:
  - **Code blocks**: Always add `maxHeight` (e.g., `{maxHeight:'320px'}`) for blocks longer than ~10 lines.
  - **Stacked content**: When a slide has a title + description + code block + footer text, the total height can easily exceed the viewport. Reduce margins (`mt-2` instead of `mt-6`), padding (`p-3` instead of `p-4`), or trim content.
  - **Bullet lists with nested items**: Deep nesting or many items can push content off-screen.
  - **Don't shrink text to fit**: Avoid using `text-sm` or `text-xs` to cram more content into a slide — this makes text unreadable for the audience. Instead, split the content across multiple slides or reduce the amount of content.
- **Visually verify slides**: Overflow issues can only be reliably detected by viewing the rendered slides. If a Playwright MCP browser is available, use it to navigate to each content-heavy slide (at its final click state, e.g., `http://localhost:3030/{slide}?clicks=999`) and take screenshots to check for clipping. The `/export` route shows all slides rendered at once but is less precise for overflow detection than individual slide views.
