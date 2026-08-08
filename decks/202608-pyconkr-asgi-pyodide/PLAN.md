# PLAN — ASGI on Pyodide: building a web server inside your browser

**Status:** Stages 1 and 2 approved; deck built (`slides.md`, 48 slides incl. appendix) and visually verified with the dev server. Remaining: live-demo rehearsal, real screenshots/recordings if wanted, and any content iteration.

Revision 2 reframes the arc per the author's direction: the story is the **portability gained by cutting an interface at ASGI**, not "ASGI and Pyodide as two equal ideas combined." Pyodide is the extreme, relatable example that demonstrates the decoupling — not a co-star.

PyCon KR 2026 · 40-minute slot · English · Python programmers who have used at least one web framework (FastAPI/Starlette); no Pyodide or ASGI-internals experience assumed.

Source material: the CFP proposal (written for 30 min), the [runtime-agnostic ASGI app example](https://github.com/whitphx/runtime-agnostic-asgi-app-example) (one FastAPI app, three runtimes), the [Stlite poster stack figure](https://whitphx-info-posters.pages.dev/posters/202608-pyconkr-stlite/), Stlite PRs #2043/#2044 (ASGI bridge) and #2077 (Cloudflare Workers).

## Stage 1 — Narrative arc (revision 2)

Thesis: **cutting an interface at ASGI buys portability.** The app side and the server side evolve independently; because the contract is solid, the "server" can be implemented however we want — including inside a browser tab. Pyodide is the extreme case that makes the decoupling visible, and Stlite is the proof it works in production.

1. **The boundary you use every day without looking at it.** You write a FastAPI app and deploy it with Uvicorn. Between them sits ASGI — and because of it, FastAPI, Starlette, and Django evolve on one side while Uvicorn, Hypercorn, and Granian compete on the other, none of them knowing each other's internals.
   Pain: we take this decoupling for granted. What does the contract actually say — and how far can the server side really be stretched?

2. **ASGI 101 — the contract has no sockets in it.** One async callable taking `(scope, receive, send)`. Nothing about TCP, ports, or processes. Demo step 1: the example FastAPI app under Uvicorn, the normal case.
   Realization the talk stands on: a "server" is just *anything that can build a `scope` and call the app*. Tension: if that's true, we don't need an HTTP server at all — we don't even need a server machine. Prove it.

3. **The extreme case: a server inside the browser.** Pyodide, introduced briefly as the enabler (CPython on WebAssembly), not as a co-topic. Demo step 2: the byte-for-byte same app running in a static page, network tab silent, app still answering — HTTP "communication" simulated entirely inside the tab.
   Pain: something in that tab is impersonating Uvicorn. What does the impersonation take?

4. **Build the impersonator, piece by piece.** JS request → `scope` dict; wiring `receive`/`send` across the JS↔Python boundary; WebSocket sessions as an awaitable queue plus the connect/accept/receive/close choreography; lifespan. A working in-browser "server" in ~100 lines (the demo repo's `bridge.py`).
   Payoff: the audience can now read Uvicorn's job description — and sees the app never noticed the swap. Pain: a 100-line bridge is a toy. Does the contract hold for a real framework?

5. **The production proof: Stlite (and Gradio-Lite).** Streamlit is a real ASGI app with WebSockets, static files, and state — and it runs in the browser as Stlite. The history carries the argument: years of hand-rolled framework-specific server emulation replaced by ASGI dispatch (PRs #2043/#2044), because targeting the standard interface beat imitating one framework. The poster's side-by-side stack figure, adapted: app and Streamlit stay, Uvicorn/CPython swap for bridge/Pyodide.
   Hook: once the caller can be anything, the browser can't be the only unusual place the app runs.

6. **The spectrum completed: Cloudflare Workers.** Same demo app on Cloudflare Python Workers — a four-line entrypoint handing the app to the SDK's `asgi` module, the production-grade sibling of our bridge. Stlite runs there too (PR #2077). Three runtimes now on screen at once: TCP server, browser tab, edge isolate — one unchanged app.
   Payoff: the thesis lands. The region bounded by the interface stays fixed; you swap the caller per environment.

7. **What the portability buys you, and where it stops.** Static-hosted demos, runnable docs, education, privacy-preserving apps; honest limits (package availability, download size, no threads, CORS, never ship secrets). Close on the mental model: `scope`/`receive`/`send`, and "a server is just a caller."

### Changes from revision 1

- **The thesis leads.** Revision 1 opened with "two equal ideas we'll combine"; now beat 1 opens with the decoupling that ASGI already provides in everyday deployments, and everything after is evidence for how far it stretches. Pyodide enters only in beat 3, as the extreme example.
- **Demo step 1 (Uvicorn) moves into beat 2** so the normal case anchors ASGI 101, and the browser demo in beat 3 lands as a rupture of that normality rather than a cold open.

### Changes from the proposal outline

- **Cloudflare Workers promoted to its own beat (6), placed *after* Stlite.** It's the strongest evidence for the thesis and lands best after the audience has seen the bridge twice (toy + production). The proposal had no Workers content.
- **The demo repo's three-step structure is the deck's through-line.** The same app returns in beats 2, 3, and 6, so the audience tracks one artifact across runtimes.
- **"Lessons from Stlite/Gradio-Lite" and "how a real server drives the app" are folded into beats 4–5** — they're the same material seen from two sides.

### What I assumed

- Q&A inclusion in the 40-minute slot is unconfirmed; the deck is budgeted for ~35 minutes of speaking and stretches naturally to 40 with demo time.
- The demo is live in the browser (static-hosted, reliable), with screenshot fallback slides.
- The deleted 202608 deck's pieces (WebSocket choreography, bridge code walkthroughs) are reusable where they fit the new arc; its framing is what's being replaced.
- Deck directory `decks/202608-pyconkr-asgi-pyodide` (same name as the deleted one), theme `triangle`, full portfolio bio (the talk is about the author's projects).

## Stage 2 — Slide list (44 slides + 4 appendix, ~35–40 min)

Calibration: recent comparable decks run 36–45 separators (`202606-pyconkr-contextvars` 36, `202603-pycon-python-release-workflow` 45, deleted 40-min version of this talk 44).

The **stack figure** is the deck's recurring visual: a column of layers (app / framework / ASGI caller / runtime) that reappears with pieces swapped in beats 3, 5, and 6. Build it once as HTML/UnoCSS (adapting the poster's design), not as an image, so layers can be highlighted and swapped with clicks.

Opening (4)
 1. Title                     title           "ASGI on Pyodide: building a web server inside your browser"
 2. Hi 👋                     full bio        portfolio bio + assets copied from most recent deck using it
 3. What this talk is about   statement       thesis up front: cut an interface at ASGI → the "server" can be anything
 4. Agenda                    bullets         the beats — 🧩 ⚡ 🌐 🛠️ 🏭 ☁️ 🧭

Beat 1 — The boundary you never look at (5)
 5. Section                   section         "🧩 The boundary you use every day"
 6. You deploy this weekly    code            minimal FastAPI app + `uvicorn app:app` — the familiar pair
 7. Two ecosystems, one contract  figure      FastAPI/Starlette/Django on one side, Uvicorn/Hypercorn/Granian on the other, ASGI between; v-clicks per side
 8. Not a new idea: WSGI      figure          WSGI (PEP 333, 2003) → ASGI lineage: same decoupling motivation, sync one-call shape vs async events; historical touch only, no deep dive
 9. Taken for granted         statement       "How far can the server side be stretched?"

Beat 2 — ASGI in 90 seconds (7)
10. Section                   section         "⚡ ASGI in 90 seconds"
11. One async callable        code            `async def app(scope, receive, send)` — annotated with FancyArrow labels
12. No framework needed       code            imported from `samples/raw_asgi.py`; FastAPI is "just" this callable
13. Three connection types    table           http / websocket / lifespan — same shape, different `scope["type"]`
14. Demo step 1: the normal case  WindowMockup  `uvicorn app.main:app` + screenshot; live-demo cue in notes
15. What's running where — step 1  stack figure  app → (`scope`/`receive`/`send`) → Uvicorn on CPython, HTTP over the network, page at the bottom; "watch Uvicorn's box"
16. The realization           statement       "The contract has no sockets in it. A server = anything that can call the app." → so do we even need a server machine?

Beat 3 — A server inside the browser (5)
17. Section                   section         "🌐 The extreme case: a server inside your browser"
18. Pyodide in one slide      bullets+logo    CPython compiled to WebAssembly; enabler, one slide only; official logo + CC BY 4.0 credit
19. Demo step 2: same app, no server  demo    live demo (static page, network tab silent) + QR; fallback screenshot slide notes
20. What's running where — step 2  stack figure  step-1 diagram alone, then the browser stack fades in beside it (`StackCompare`); title crossfades 1 → 2
21. The impersonation         statement       "Something in that tab is impersonating Uvicorn. What does that take?"

Beat 4 — Building the impersonator (6)
22. Section                   section         "🛠️ Building the bridge"
23. The route of one request  figure          htmx → `appFetch` → postMessage → worker → `app(scope, receive, send)` and back (from demo README)
24. Request → `scope`         code            build the scope dict from a JS request; line-highlight reveals
25. Wiring `receive`/`send`   code            body in via `receive`, response events out via `send`
26. Crossing JS ↔ Python      code            Pyodide proxies / buffer conversion gotchas
27. Lifespan                  code            driving startup/shutdown
28. Payoff                    statement       "~45 lines — and the app never noticed. But this bridge is a toy…"

Beat 5 — The production proof: Stlite (5)
29. Section                   section         "🏭 The production proof"
30. First: what is Streamlit?  code + figure   pure-Python script → Streamlit's own Python HTTP server + bundled SPA; same shape as the demo app. Shiny/Gradio named only in passing
31. Real frameworks in the browser  table    Streamlit/Stlite, Shinylive, marimo, Panel, Gradio-Lite (unmaintained, downplayed) + their server stacks — nearly all ASGI
32. Standard Streamlit vs Stlite  stack figure  the poster's side-by-side, adapted: what stays, what swaps
33. Hook                      statement       "If the caller can be anything… the browser can't be the only unusual caller."

Beat 6 — The spectrum completed: Cloudflare Workers (6)
34. Section                   section         "☁️ A third runtime: the edge"
35. Python Workers            bullets         Cloudflare runs Pyodide server-side — the browser stack, full circle
36. The whole entrypoint      code            4 lines: hand `app` to the SDK's `asgi` module — the production sibling of our bridge
37. What's running where — step 3  stack figure  server + browser stacks, then the edge stack fades in as a third column (`StackCompare`); title crossfades 2 → 3
38. Three runtimes, one app   stack figure    three columns side by side; app+framework layers identical, caller layer swapped — the thesis slide
39. Stlite on Workers         screenshot      PR #2077; same story at product scale

Beat 7 — What it buys, where it stops (5)
40. Section                   section         "🧭 When to reach for this"
41. Practical applications    bullets         🔒 privacy · 📚 runnable docs · 🎓 education · 📦 static-hosted demos · scale-with-visitors
42. Honest limits             bullets         package availability, download size, no threads, CORS, never ship secrets
43. Key takeaways             bullets         the mental model: `scope`/`receive`/`send`; "a server is just a caller"
44. Thank you & links         QR codes        demo repo, Stlite, slides URL

Appendix — not presented; Q&A backup (4)
45. Appendix divider          section         "Appendix: Streaming & WebSockets over the bridge"
46. Streaming: `more_body`    code            chunked responses to a JS ReadableStream (concept-labeled)
47. Awaitable receive queue   code            receive queue fed by JS socket events
48. Session choreography      figure/code     connect → accept → receive/send → close event order over one session

### Scoping decisions (appendix material)

The 40-minute talk does not explain WebSocket handling or `more_body` streaming. The talk conveys core ASGI concepts, not a spec walkthrough; these would be the densest, most redundant stretches. The three-connection-types slide still *names* `websocket` as a scope type, and the Stlite slide names realtime messaging among Streamlit's demands, but neither opens the mechanics — the appendix slides carry them for Q&A. History: WebSockets were moved to the appendix in Stage 2 revision 1; streaming followed after a post-build review pass.

### WSGI lineage (added post-build)

Beat 1 gained a WSGI → ASGI lineage slide: same decoupling motivation, WSGI's synchronous one-call shape, and why ASGI succeeded it (async events; WebSockets/streaming/long-lived connections). Deliberately historical and light — this talk does not deep-dive WSGI.

## Build notes

- `samples/` is a self-contained uv project holding the "You don't even need a framework" code (`raw_asgi.py`), imported into the slide via `<<< @/samples/raw_asgi.py`. `uv run pytest` verifies it (a hand-rolled `scope`/`receive`/`send` test plus an httpx `ASGITransport` one); `uv run uvicorn raw_asgi:app` serves it. Edit the file, not the slide. Re-lock with `UV_DEFAULT_INDEX=https://pypi.org/simple uv lock`: this machine's uv config defaults to a private mirror, and a lockfile pinning it is unresolvable for anyone else cloning this public repo.
- Demo-runbook details (serve the demo repo from its root; warm the Workers deployment before presenting) live in the presenter notes of the slides they apply to, sourced from the demo repo's `NOTES.md`.
- Slide text follows the density policy in `.claude/skills/slidev-deck/SKILL.md` (keywords on slides, sentences in notes).
- Pyodide logo (`public/pyodide-logo.svg`, from the Pyodide project, CC BY 4.0) sits on the enabler slide with a corner credit.
- The stack diagrams are components (`ServerStackFigure.vue` / `BrowserStackFigure.vue` / `CloudflareStackFigure.vue`), rendered standalone on the step-1 slide and paired by `StackCompare.vue` on the step-2 (server → browser) and step-3 (browser → edge) slides. The reveal animates `transform`/opacity only (never layout), so the punchline stays put, and each comparison slide crossfades its step number in the title on the same timing.
- Open question, now sharper: the step-3 slide ends on three detailed stacks side by side, and "Three runtimes, one app" immediately repeats that shape in compressed form. One of the two probably has to go, or the thesis slide should become something other than a stack comparison.
- The Stlite origin story (hand-rolled Tornado emulation → ASGI dispatch, PRs #2043/#2044) was cut: Streamlit moved to Starlette/Uvicorn in 1.57, so the Tornado-era workaround is no longer the audience's world. The `#2043`/`#2044` links survive on the closing links slide.
