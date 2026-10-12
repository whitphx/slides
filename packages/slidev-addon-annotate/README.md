# slidev-addon-annotate

Leave notes directly on a Slidev deck in the browser, and let an AI coding agent pick them up.

You click an element on a slide, type a note, and the note is stored together with
the slide number, click step, slide title and source line. An agent reads the notes
over MCP, edits the slides, and marks each note as resolved.

Status: **spike**. It works with a local `slidev` dev server and with PR previews
served by this repo's Cloudflare Worker (`worker.js`).

## How it fits together

```
 Browser: deck + toolbar (agent-ui-annotation, MIT)
    │  Agentation-compatible HTTP API, same origin (/__annotate/api)
    ▼
 Handler (src/server.ts, Fetch API) + store
    ├─ dev:     Vite middleware, notes in <deck>/.annotate/annotations.json
    └─ preview: Cloudflare Worker (worker.js), notes in D1
    ▲
    │  agentation-mcp server --mcp-only --http-url <API>   (agent reads, acknowledges, resolves)
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

## Authentication

The handler takes an `auth` option, so each host decides who may call the API
(`src/auth.ts`). Who wrote a note or a reply, and who resolved a note, is taken
from the credential, never from the request body.

| Authenticator | For | How |
|---|---|---|
| `localDev()` | the `slidev` dev server | Every same-origin request is the local user; cross-site requests from other pages in the browser are refused. |
| `apiKey({ key, role: 'agent' })` | agents | Shared key in `x-api-key` (what `agentation-mcp --api-key` sends) or `Authorization: Bearer`. |
| `signedCookie({ secret })` | reviewers in a browser | Opening `<api>/login?token=<secret>&next=/<deck>/` sets a signed, expiring `HttpOnly` cookie; the toolbar's same-origin requests carry it. `<api>/logout` clears it. |
| `chain(...)` | combining the above | The first authenticator that accepts the request wins. |

Roles (`defaultAuthorize`; pass `authorize` to replace it):

- `reviewer`: read, create, edit and delete their own notes, change status, reply. With one shared reviewer key (as in `worker.js`), all reviewers are the same principal.
- `agent`: read, change status (acknowledge, resolve, dismiss, reopen), reply. It cannot create, edit or delete notes, so a leaked agent key can't plant or rewrite notes; it can still add replies and change status.
- `admin`: everything.

Before each new note the toolbar asks the API (`GET <api>/whoami`) whether this browser may add notes, and refuses the note with a notice if not (e.g. before logging in). If a save is rejected later, the deck also shows a notice at the top of the page.

## Set up the PR-preview Worker (this repo)

`worker.js` serves the API at `/__annotate/api` with notes in D1, agents via
`ANNOTATE_AGENT_KEY` and reviewers via `ANNOTATE_REVIEWER_KEY`. One-time setup:

1. The `slides-annotations` D1 database is bound as `ANNOTATIONS_DB` in `wrangler.jsonc`. To set it up on another account, create a database and put its id in that entry:

   ```sh
   pnpm dlx wrangler@4.129.0 d1 create slides-annotations
   ```

   Tables are created on first use. Preview versions share the production Worker's bindings and secrets, so this covers every PR.
2. Set the two secrets (long random strings; `openssl rand -hex 32` gives ones that need no URL encoding):

   ```sh
   pnpm dlx wrangler@4.129.0 versions secret put ANNOTATE_AGENT_KEY
   pnpm dlx wrangler@4.129.0 versions secret put ANNOTATE_REVIEWER_KEY
   ```

   Use `versions secret put`, not `secret put`: PR previews upload versions without deploying
   them, so the latest version is never the deployed one and `secret put` refuses. Later
   versions, previews and the next production deploy alike, inherit the secrets. Don't
   "deploy the latest version first" as wrangler suggests; that is a PR preview build.
3. Log in once per PR preview in each browser you review in. The cookie is per host, and
   each PR preview has its own `*.workers.dev` host. Keep the link in a password manager
   (URL-encode the key if it contains `+`, `/` or `=`):
   `https://<preview host>/__annotate/api/login?token=<ANNOTATE_REVIEWER_KEY>&next=/<deck>/`
4. For a cloud agent session, add the agent key to the environment as a secret named
   `AGENTATION_API_KEY` (which `agentation-mcp` reads), allow the Worker's host in its
   network policy, and register the MCP server. Once this is deployed to production, use
   the stable production host (all previews share the same database); before that, use
   the PR's preview host:

   ```sh
   claude mcp add annotate -- \
     npx -y agentation-mcp server --mcp-only --http-url https://<production host>/__annotate/api
   ```

CI builds PR previews with `SLIDEV_ANNOTATE=1`, `SLIDEV_ANNOTATE_SESSION=pr-<number>`
and the PR head commit, so notes from different PRs are kept apart by session id.
Decks opt in by listing the addon in their headmatter.

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
- Through `worker.js` under `wrangler dev` with a local D1: requests without a credential get 401; the agent key reads, acknowledges and resolves but gets 403 on creating, editing or deleting notes; the login link sets the cookie and only redirects within the same origin; forged or cross-site cookies are refused; before login the deck shows the notice, after it notes save with the reviewer as author; `agentation-mcp --api-key` works, watch mode included.

Limitations found:

- **Markers on other slides.** agent-ui-annotation keeps a marker visible while its element is in the document, and Slidev keeps neighbouring slides mounted. The addon hides other slides' markers with a style rule in the toolbar's shadow root (`createMarkerFilter`). An upstream option to scope markers by route would remove this workaround.
- **Toolbar storage.** The toolbar keeps its own copy of the notes in `localStorage`, one list per origin, and has no API to load notes from a server. So it doesn't show that the agent resolved a note, and notes made in another browser don't appear.
- **Source path in builds.** Slidev drops slide file paths from builds, so built decks report the entry file for every slide. That is wrong only for slides imported with `src:`.
