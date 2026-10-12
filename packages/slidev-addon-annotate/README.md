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
| `signedCookie({ secret, home?, trustOrigin? })` | reviewers in a browser | `<api>/login` shows a form for the reviewer key (a password field, so password managers fill it; the key is posted, never put in a URL) and sets a signed, expiring `HttpOnly` cookie that the toolbar's same-origin requests carry. With `home`, other hosts that `trustOrigin` accepts hand logins off to the home host: one login there covers them all (see below). `<api>/logout` clears it. |
| `chain(...)` | combining the above | The first authenticator that accepts the request wins. |

Roles (`defaultAuthorize`; pass `authorize` to replace it):

- `reviewer`: read, create, edit and delete their own notes, change status, reply. With one shared reviewer key (as in `worker.js`), all reviewers are the same principal.
- `agent`: read, change status (acknowledge, resolve, dismiss, reopen), reply. It cannot create, edit or delete notes, so a leaked agent key can't plant or rewrite notes; it can still add replies and change status.
- `admin`: everything.

Before each new note the toolbar asks the API (`GET <api>/whoami`) whether this browser may add notes, and refuses the note with a notice if not (e.g. before logging in). If a save is rejected later, the deck also shows a notice at the top of the page.

## Sending notes to an agent

With a dispatcher configured, a logged-in reviewer sees **Send N notes to agent** at the
top right of the deck. It sends the session's pending notes that haven't been sent yet
(`POST <api>/sessions/<id>/dispatch`); each note is sent once, and again only if its text
is edited. Ticking **Send automatically** sends on its own once no note has been added for
a while (`SLIDEV_ANNOTATE_AUTO_DISPATCH_SECONDS`, default 120); the choice is remembered
per browser, and `SLIDEV_ANNOTATE_AUTO_DISPATCH=1` makes it the default. Only reviewers
can dispatch, at most once a minute per session.

`githubComment()` (`src/github.ts`) is the dispatcher `worker.js` uses: it posts the batch
as one comment on the PR the session belongs to (`pr-<number>.<deck>`), listing each note
with its slide, click step, title, source line and id. An agent session watching that PR
is woken by the comment, applies the notes, pushes, and resolves them by id. Any function
`(batch) => Promise<{ url? }>` can be passed as `dispatch` instead, e.g. to call a Claude
Code Routine's API trigger.

## Host the API in your own Worker

`slidev-addon-annotate/worker` sets the API up from a Worker's bindings, so another
repository's Worker needs only a few lines (this repo's `worker.js` is the same thing):

```js
import { createAnnotateWorker } from 'slidev-addon-annotate/worker'

const annotate = createAnnotateWorker({
  repo: 'owner/slides', // PRs that get "Send to agent" comments
  // Hosts the home host may log in, e.g. this Worker's preview hosts.
  trustOrigin: origin => /^https:\/\/[a-z0-9-]+-slides\.owner\.workers\.dev$/.test(origin),
})

export default {
  async fetch(request, env) {
    // The API's response under /__annotate/api, undefined for anything else.
    return (await annotate(request, env)) ?? env.ASSETS.fetch(request)
  },
}
```

| Binding | Needed for |
|---|---|
| `ANNOTATIONS_DB` (D1) | storing notes; without it the API answers 503 |
| `ANNOTATE_AGENT_KEY` | agents (`x-api-key`) |
| `ANNOTATE_REVIEWER_KEY` | reviewer login; also signs the login cookie |
| `ANNOTATE_HOME_ORIGIN` | optional: one login for every host `trustOrigin` accepts |
| `ANNOTATE_GITHUB_TOKEN` | optional: **Send to agent** as a PR comment (with `repo`) |

Options: `basePath` (default `/__annotate/api`; match `SLIDEV_ANNOTATE_ENDPOINT`), `repo`,
`prNumber` (session id to PR number; default `pr-<number>.<deck>`) and `trustOrigin`.
Build the decks with the settings under [Settings](#settings), as this repo's CI does.

For other hosts, or to change the parts, use the building blocks directly. They use only
the Fetch API and Web Crypto (except `file-store`), so they run in Cloudflare Workers and
Node 20+, and should in other runtimes with those APIs:

| Import | Exports |
|---|---|
| `slidev-addon-annotate/server` | `createAnnotateHandler({ store, basePath, auth, authorize?, dispatch? })` and the `AnnotationStore` and `Dispatcher` interfaces |
| `slidev-addon-annotate/auth` | `apiKey`, `signedCookie`, `localDev`, `chain`, `defaultAuthorize` |
| `slidev-addon-annotate/d1` | `createD1Store(db)` |
| `slidev-addon-annotate/file-store` | `createFileStore(path)` (Node) |
| `slidev-addon-annotate/github` | `githubComment({ token, repo })` |
| `slidev-addon-annotate/afs` | the AFS `Annotation` and `Session` types |

Inside this workspace these resolve to the TypeScript sources; the published package
points them at compiled JavaScript with type declarations (`pnpm run build`, run on pack).

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
   For **Send to agent**, also create a fine-grained GitHub token limited to this repository
   with *Pull requests: Read and write*, and store it the same way:

   ```sh
   pnpm dlx wrangler@4.129.0 versions secret put ANNOTATE_GITHUB_TOKEN
   ```

   Without it the button doesn't appear. Comments are posted as the token's owner.
3. To log in, press **Log in to review** at the top right of a preview deck (or open
   `<host>/__annotate/api/login`) and enter `ANNOTATE_REVIEWER_KEY`; your password manager can
   save it for the host. Each PR preview has its own `*.workers.dev` host, and cookies aren't
   shared between them, so by default that is once per preview.

   **Log in once for all previews:** once this Worker's API is deployed to production, add
   the production host as the home host in `wrangler.jsonc`:

   ```jsonc
   "vars": { "ANNOTATE_HOME_ORIGIN": "https://slides.whitphx.workers.dev" }
   ```

   Previews then send the login to the home host (only hosts that `trustOrigin` in
   `worker.js` accepts), which asks for the key once and hands back a pass signed for
   that preview, valid for a minute and tied to a one-time cookie. Later previews log in
   with one click and no key. Don't set it before production serves the API, or the
   hand-off lands on a page that doesn't exist.
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

## Agent skill

`skills/slidev-annotate-notes/` is an [Agent Skill](https://code.claude.com/docs/en/skills)
that tells an agent how to apply these notes: when a dispatch comment counts as an
instruction (only from the person it works for, and only about the slides), how to find
each note's slide, and how to resolve the notes afterwards. In this repository it is
linked into `.claude/skills/`, so every session here has it, cloud sessions included.

To use it in another project with Claude Code:

```sh
/plugin install slidev-addon-annotate --marketplace whitphx/slides
```

(or `/plugin marketplace add whitphx/slides`, then `/plugin install slidev-addon-annotate@whitphx-slides`).
For other agents, `npx skills add whitphx/slides --skill slidev-annotate-notes` copies it into
the project's skills folder.

## Settings

Environment variables read when `slidev` starts:

| Variable | Default | Meaning |
|---|---|---|
| `SLIDEV_ANNOTATE` | on in dev, off in builds | `1` includes the toolbar in `slidev build`; `0` turns it off in dev. Builds without it contain no toolbar code. |
| `SLIDEV_ANNOTATE_ENDPOINT` | `/__annotate/api` | Base URL of the annotation API. |
| `SLIDEV_ANNOTATE_SESSION` | `local` | Session name, e.g. `pr-12`. The session id is `<session>.<deck directory>`. |
| `SLIDEV_ANNOTATE_REVISION` | `git rev-parse HEAD` | Commit recorded on each note. |
| `SLIDEV_ANNOTATE_AUTO_DISPATCH` | off | `1` turns **Send automatically** on by default (each browser can change it). |
| `SLIDEV_ANNOTATE_AUTO_DISPATCH_SECONDS` | `120` | Quiet time after the last note before an automatic send. |

## What the spike showed

Checked in Chromium with Playwright against `packages/annotate-playground`, in dev mode and as a static build served with the same handler:

- Typing in the note box (including arrow keys, Space, PageDown) does not move the slides. With the box closed, arrow keys still navigate.
- Notes record the slide number, click step, title, source line and position on the slide.
- `agentation-mcp`, unmodified, lists, acknowledges and resolves the notes, and its watch mode picks up new notes.
- Slidev's MCP reads the slide and moves the browser to it.
- Through `worker.js` under `wrangler dev` with a local D1: requests without a credential get 401; the agent key reads, acknowledges and resolves but gets 403 on creating, editing or deleting notes; the login form sets the cookie and only redirects within the same origin; the home-host hand-off logs a second origin in (one key entry, then one click); forged or cross-site cookies are refused; before login the deck shows the notice, after it notes save with the reviewer as author; `agentation-mcp --api-key` works, watch mode included.

Limitations found:

- **Markers on other slides.** agent-ui-annotation keeps a marker visible while its element is in the document, and Slidev keeps neighbouring slides mounted. The addon hides other slides' markers with a style rule in the toolbar's shadow root (`createMarkerFilter`). An upstream option to scope markers by route would remove this workaround.
- **Toolbar storage.** The toolbar keeps its own copy of the notes in `localStorage`, one list per origin, and has no API to load notes from a server. So it doesn't show that the agent resolved a note, and notes made in another browser don't appear.
- **Source path in builds.** Slidev drops slide file paths from builds, so built decks report the entry file for every slide. That is wrong only for slides imported with `src:`.
