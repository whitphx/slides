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
    "@iconify/json": "^2.2.303",
    "@slidev/cli": "^52.8.0"
  }
}
```

`@iconify/json` is required for icon classes like `i-ri-github-line`, `i-ri-user-3-line`, etc. to work — always include it.

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
  - slidev-addon-anipres
---
```

**Theme selection:**
- `../../themes/triangle` — the default choice for most presentations (generative triangle tessellation background)
- `../../themes/alpha` — alternative with animated gradient background

Only list addons in the frontmatter `addons:` field that are actually used in the slides. Use the addon's short name (without `slidev-addon-` prefix) in the frontmatter. For example, use `anipres` not `slidev-addon-anipres`.

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

**Author/bio slide** — follow this established pattern:

```html
<h1>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div class="portfolio" w-130 mt-6 v-click="1">

- <span class="heading">Created</span>: <span class="item"><img src="/portfolio/awesome_emacs_keymap.svg">Awesome Emacs Keymap</span>, <span class="item"><img src="/portfolio/stlite.png">Stlite: In-browser Streamlit</span>, <span class="item">🎈 Streamlit-WebRTC</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio-Lite: Serverless Gradio</span>, <span class="item">🤗 Transformers.js.py</span>
- <span class="heading">Contributed to</span>: <span class="item"><img src="/portfolio/streamlit-mark-color.svg" style="height: 0.8em;">Streamlit</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio</span>
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🇪🇺Euro, 🌏APAC, 🇹🇼TW, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT, 🗾miniShizuoka</span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item">🐍Tokyo Python Meetup</span>, <span class="item">▶️Streamlit Live</span>

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
```

Include the portfolio `<style>` block from existing decks. Copy the `public/portfolio/` assets from a recent deck that has them.

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
<span v-mark.circle.red>circled</span>
<span v-mark.box.orange>boxed</span>
```

**Code highlighting with line reveals**:

```
```py {*|1-3|5-8}
# Lines revealed progressively
```
```

**Magic-move** — for animated code transitions:

````
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
````

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

```
```py {*|1-3|5-8}{'data-id': 'my-code', 'max-height': '450px'}
import ast
# ...
```
```

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
- Portfolio images are typically shared — copy from a recent deck's `public/portfolio/`
- Test the deck with `pnpm dev` when possible
- Keep slide count appropriate for the talk length (roughly 1-2 minutes per slide)
- When content is provided in a language other than the target presentation language, translate appropriately
- Prefer structured HTML with UnoCSS over plain markdown for non-trivial layouts
- The author's social links and bio slide content should be kept up-to-date by referencing the most recent deck
