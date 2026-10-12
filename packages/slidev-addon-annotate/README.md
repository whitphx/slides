# slidev-addon-annotate

Leave notes directly on a Slidev deck in the browser, and let an AI coding agent pick them up.

You click an element on a slide, type a note, and the note is stored together with
the slide number, click step, slide title and source line. An agent reads the notes
over MCP, edits the slides, and marks each note as resolved.

Status: **spike**. It works with a local `slidev` dev server today.
Serving it from a deployed preview (Cloudflare Worker) is the next step.

## How it fits together

```
 Browser: deck + toolbar (agent-ui-annotation, MIT)
    │  Agentation-compatible HTTP API, same origin (/__annotate/api)
    ▼
 Handler (src/server.ts, Fetch API) + store
    ├─ dev:     Vite middleware, notes in <deck>/.annotate/annotations.json
    └─ preview: Cloudflare Worker (next step)
    ▲
    │  agentation-mcp --mcp-only --http-url <API>   (agent reads, acknowledges, resolves)
 Agent ──► Slidev MCP (/__mcp): get/update slides, go to slide
```

- **Toolbar:** [agent-ui-annotation](https://github.com/YeomansIII/agent-ui-annotation)'s framework-agnostic `createAnnotation`.
- **Note format:** [Agentation's AFS v1.1](https://www.agentation.com/schema) annotations. The slide context goes into `sourceFile` and `slidev-*` keys in `attributes`, because `agentation-mcp` passes those two fields through to the agent.
- **HTTP API:** the part of Agentation's API that its MCP server calls, so the unmodified [`agentation-mcp`](https://www.npmjs.com/package/agentation-mcp) works as the agent-side client. `agentation-mcp` is licensed under PolyForm Shield 1.0.0 and is run with `npx`, not bundled; this addon implements Agentation's HTTP API so that it can talk to it, without including any Agentation code.

## Use it in a deck

Add the addon to the deck's dependencies and headmatter (Slidev 52.19 or later):

```yaml
---
addons:
  - slidev-addon-annotate
---
```

Run `slidev` as usual. The toolbar appears at the bottom right of the audience view.
It is not shown in the presenter view, in print/export, or in embedded slides.

Register both MCP servers with your agent, e.g. for Claude Code:

```sh
claude mcp add --transport http slidev http://localhost:3030/__mcp
claude mcp add annotate -- npx -y agentation-mcp server --mcp-only --http-url http://localhost:3030/__annotate/api
```

Then ask the agent to "address the pending slide notes". It reads them with
`agentation_get_all_pending`, edits the slide (`slidev-update-slide`), shows you
the result (`slidev-goto-slide`) and calls `agentation_resolve`.
For hands-free use, ask it to loop on `agentation_watch_annotations`.

A note as the agent sees it:

```json
{
  "comment": "Make this bold",
  "element": "li",
  "elementPath": "ul > li:nth-of-type(1)",
  "url": "http://localhost:3030/2?clicks=1",
  "nearbyText": "First point",
  "sourceFile": "packages/annotate-playground/slides.md:13",
  "attributes": {
    "slidev-deck": "annotate-playground",
    "slidev-revision": "4ddd53fbefa1706f3e5a645fb82ff0daecefa263",
    "slidev-slide": "2",
    "slidev-click": "1",
    "slidev-clicks-total": "2",
    "slidev-title": "Clicks",
    "slidev-position": "50% 6.4%"
  }
}
```

## Settings

Environment variables read when `slidev` starts:

| Variable | Default | Meaning |
|---|---|---|
| `SLIDEV_ANNOTATE` | on in dev, off in builds | `1` includes the toolbar in `slidev build`; `0` turns it off in dev. Builds without it contain no toolbar code. |
| `SLIDEV_ANNOTATE_ENDPOINT` | `/__annotate/api` | Base URL of the annotation API. |
| `SLIDEV_ANNOTATE_SESSION` | `local` | Session name, e.g. `pr-12`. The session id is `<session>.<deck directory>`. |
| `SLIDEV_ANNOTATE_REVISION` | `git rev-parse HEAD` | Commit recorded on each note. |

## What the spike showed

Checked in Chromium with Playwright against `packages/annotate-playground`, in dev mode and as a static build served with the same handler:

- Typing in the note box (including arrow keys, Space, PageDown) does not move the slides. With the box closed, arrow keys still navigate.
- Notes record the slide number, click step, title, source line and position on the slide.
- `agentation-mcp`, unmodified, lists, acknowledges and resolves the notes, and its watch mode picks up new notes.
- Slidev's MCP reads the slide and moves the browser to it.

Limitations found:

- **Markers on other slides.** agent-ui-annotation keeps a marker visible while its element is in the document, and Slidev keeps neighbouring slides mounted. The addon hides other slides' markers with a style rule in the toolbar's shadow root (`createMarkerFilter`). An upstream option to scope markers by route would remove this workaround.
- **Toolbar storage.** The toolbar keeps its own copy of the notes in `localStorage`, one list per origin, and has no API to load notes from a server. So it doesn't show that the agent resolved a note, and notes made in another browser don't appear.
- **No server for builds yet.** With `SLIDEV_ANNOTATE=1`, a static build still posts to `/__annotate/api`, which nothing serves until the Worker exists; saves fail with only a console warning.
- **Source path in builds.** Slidev drops slide file paths from builds, so built decks report the entry file for every slide. That is wrong only for slides imported with `src:`.
