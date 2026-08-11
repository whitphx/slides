# Slidev syntax reference

Authoring syntax for this monorepo's decks. Read this when writing or editing `slides.md`. The workflow around it, including the planning gate that runs first, lives in `SKILL.md`.

- [Animations and interactivity](#animations-and-interactivity)
- [Addons usage](#addons-usage)
- [Styling patterns](#styling-patterns)
- [Code blocks](#code-blocks)
- [Images and media](#images-and-media)
- [Custom components](#custom-components)

## Animations and interactivity

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

**Don't overuse bullet points.** Bullet lists are useful for enumerating discrete items, but not every slide should be a list. When the content is better expressed as a narrative, a diagram, a code example, a comparison table, or a visual layout with positioned elements, use those instead. Vary the slide formats to keep the audience engaged; a deck full of bullet-point slides feels monotonous. Look at the existing decks for inspiration: they mix bullet lists with grids, code blocks, images, modals, statement slides, and free-form HTML layouts.

**Individual element reveals** — use `v-click` directive:

```html
<div v-click="1">Appears on click 1</div>
<div v-click="2">Appears on click 2</div>
```

**Hide on click**: `v-click.hide="3"` hides the element at click 3.

**Prefer `v-click` to hand-rolled `$clicks` comparisons.** `<div v-click="1">` says what it means and takes the directive's own transition; `:class="$clicks === 1 ? 'op100' : 'op0'"` reimplements it, and the `=== 1` form additionally hides the element again on the next click, which is rarely what was wanted. Reach for `$clicks` only when the state has to drive something a directive cannot express, such as a CSS class that animates a layout (`:class="$clicks >= 3 ? 'covered' : ''"`).

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

The same applies to `v-mark` on any element that is inside a `v-click` container. Always coordinate the click numbers.

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

## Addons usage

### FancyArrow

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

#### Annotating code: arrow + floating box, never a comment

**This is the only way to call out a line of code on a slide.** Never write the explanation as a code comment, and never draw pointers in the code itself (`# ← this one`, `^^^^^^`, trailing `// what this does`). The code block shows code that could have been copied out of the repo; the commentary lives outside it, in a floating box the arrow connects to the line.

Give the code block a `data-id` through its second meta object, put each explanation in an absolutely positioned box with its own `data-id`, and wrap box and arrow together in one `v-click` so they appear as a unit:

`````md
````md
```js {*|1|3|*}{'data-id':'call-app'}
const { app } = pyodide.pyimport("main");

await app(scope, receive, send);
```
````

<div v-click="1">
<div data-id="ann-app" absolute top-24 right-5 w-100 bg-white dark:bg-black p-2 rounded border="~ violet/50 rounded-lg">

the **`app`** object, now in JavaScript

</div>
<FancyArrow from="[data-id=ann-app] @ left" to="[data-id=call-app] .line:nth-child(1) @ right" arc="-0.2" />
</div>
`````

**This applies to `<<<` imports too.** A comment in a sample file renders on the slide exactly like one typed into `slides.md`, so the rule reaches into `samples/`. When a sample carries a comment that exists to explain the slide rather than the code, delete it and re-anchor the point as an arrow + box. Check first whether the fact is already recorded elsewhere for a repo reader (the sample's README is usually the right home); if it is, the comment was pure slide commentary and nothing is lost. Removing lines renumbers the file, so update the highlight spec and every `.line:nth-child(N)` with it.

Notes that save a round of fiddling:

- `.line:nth-child(N)` counts **every** rendered line, blank lines included. In the block above `await` is line 3, not line 2.
- Size a box so its text does not wrap to an orphaned last word. Besides reading badly, an orphan wrap has been observed to leave a stray fragment of the text painted in the slide's left margin, with no element there in the DOM to explain it; widening the box until the line fits cleared it.
- Pair the arrows with a line-highlight sequence (`{*|1|3|*}`) so the highlighted line and the arrow appear on the same click.
- Boxes need `bg-white dark:bg-black` and a border. They float over the code block's background, so a transparent box is unreadable.
- Position boxes with utilities anchored to an edge (`absolute top-24 right-5 w-100`), never with inline pixel coordinates (`style="top: 214px; left: 712px"`). Pixel offsets are measured against one rendering of one slide and silently go wrong the moment the code block, font size, or click state changes; `right-*`/`bottom-*` keep a box pinned to the edge it belongs to. Check the rendered slide either way: stacked boxes collide easily, because a box grows downward as its text wraps. Leave a visible gap rather than computing one exactly.
- Do not shrink a box's font to make it fit (see "Slide text sizing" in `SKILL.md`). These boxes carry the point of the slide, so they are read; widen the box, move it, or reflow the code under it.
- Anchors take a side (`@ left`, `@ bottom`) or a point (`@ (38%, 0)`, `@ (20%, 100%)`). When an arrow from the obvious side would cross the code or another box, switch sides or aim at a percentage point instead of bending the arc further.
- When two boxes on one side crowd the text below them, move the prose into `<div absolute bottom-20 inset-x-0>` so it is anchored to the bottom of the slide instead of flowing under the code.
- Colour-code when the annotations mean different things (a neutral arrow for "here is what this is", `color="red"` for "here is the problem").
- Screenshots taken right after navigation can miss the arrowheads: FancyArrow draws itself with an animation. Wait ~2s before capturing, or an arrow will look headless (or absent) when it is actually fine.

FancyArrow can have content (label):
```html
<FancyArrow from="[data-id=a] @ right" to="[data-id=b] @ left" arc="0.6" v-click="1">

`ast.parse(code)`

</FancyArrow>
```

Position syntax: `@ left`, `@ right`, `@ top`, `@ bottom`, `@ topleft`, `@ topright`, `@ (X%,Y%)`.

### WindowMockup

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

Without `dark`/`light` the frame follows the deck's theme, which is always safe. Force one only to depict something that really is that colour — a terminal, or a light web page — and then **pin the content's colour too**:

`````md
````md
<WindowMockup title="http://127.0.0.1:8000" light>

<div p-3 class="mock-page">…</div>

</WindowMockup>

<style>
/* `light` pins the frame to white but leaves slot content on the theme's
   text colour: white-on-white in dark mode without this. */
.mock-page { color: #1f2937; }
</style>
````
`````

The addon sets the frame's background and special-cases shiki, so code blocks and images are fine unaided. Anything else — prose, buttons, mocked UI — inherits the slide's text colour and disappears in the opposite theme.

The rule generalises past this addon: **whenever you pin a background independently of the theme, pin the foreground with it.** Both themes ship, so check a slide in each before calling it done; in the dev server, `document.documentElement.classList.add('dark')` flips it without touching the deck.

### Anipres

For complex graphical animations. Declare the addon and use:

```html
<SlidevAnipres id="my-animation" v-click="1" at="2" />
```

The animation data lives in `.slidev/anipres/` directory. In most cases, leave the animation area empty and ask the user to edit the motion/shape data manually through the Slidev UI, as the data format is complex.

### QRCode

```html
<QRCode :width="180" :height="180" type="svg" data="https://example.com"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
```

## Styling patterns

Use UnoCSS utility classes directly on HTML elements (Attributify mode):

**Layout:**
```html
<div grid="~ cols-2" gap-4>        <!-- 2-column grid -->
<div flex="~ col" items-center>    <!-- flex column, centered -->
<div flex="~ gap-1" items-center>  <!-- flex row with gap -->
```

**Spacing:** `mt-8`, `ml-10`, `mx-auto`, `my-8`

**Sizing:** `w-full`, `h-50`, `w="400px"`, `h="100%"`

**Text:** `text-4` (16px), `text-5` (20px), `text-6` (24px, the slide's own body size), `text-2xl`, `text-4xl`, `leading-18`, `op50`, `font-300`

Use the numeric scale for body text. The named classes below `text-2xl` all shrink text relative to the slide default (`text-xs` 12px, `text-sm` 14px, `text-lg` 18px, `text-xl` 20px), so they belong only on things nobody reads from the back of the room. `text-4` is the floor for readable text; see "Slide text sizing" in `SKILL.md`.

**Positioning:** `absolute`, `top-20`, `right-0`, `bottom-10`, `left-12`, `w-100`

Prefer these to an inline `style="top: …px; left: …px"`, which is measured against one rendering and breaks when anything around it moves.

**Borders:** `border="~ sky/50 rounded-lg"`, `border-none!`

**Background:** `bg-sky:10`, `backdrop-blur-md`, `rounded-lg`

**Code font size** — adjust via scoped style:

```html
<style>
* {
  --slidev-code-font-size: 22px;
}
</style>
```

Scope the variable to the pane that needs it rather than to `*`, when one block on the slide is dense reference material and another is the punchline. Setting it on `*` drags the punchline down to the size the dense block needs:

```html
<style>
/* the wide, dense listing */
.fw-left { --slidev-code-font-size: 15px; }
/* the two lines everyone is meant to read */
.fw-right { --slidev-code-font-size: 22px; }
</style>
```

Reflowing a snippet across more lines is usually better than dropping its size: breaking `list(inspect.signature(app).parameters)` into four lines keeps it legible in a narrow column.

## Code blocks

**Inline code blocks** with syntax highlighting:

````
```py {*|1-3|5-8}{'data-id': 'my-code', maxHeight: '450px'}
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

**A line highlight spec is required for `maxHeight` to work.** If you don't need line highlights, use `{*}` (highlight all) as a placeholder. Without it, the scroll container is not created and `maxHeight` is silently ignored:

```
✅ ```yaml {*}{maxHeight:'300px'}     ← scroll works
❌ ```yaml {maxHeight:'300px'}        ← maxHeight ignored, no scroll
```

If a code block *and* surrounding text together overflow, either reduce `maxHeight`, trim the code, or reduce margins/padding on other elements. Always consider total slide height when combining code blocks with titles, descriptions, and footer text.

**External code imports** — when code blocks are long, externalize to files:

```
<<< @/samples/py/example.py py {*}
<<< @/samples/py/example.py#section_name py {1-5|7-10}
```

Create a `samples/` directory in the deck for externalized code. Use `#region_name` syntax in the source file to import specific sections.

## Images and media

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

## Custom components

If you need reusable slide components, create them in a `components/` directory within the deck. See existing `Modal.vue` components in decks like `202510-oss-handson` for reference patterns.
