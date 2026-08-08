# PLAN — ASGI on Pyodide: building a web server inside your browser

**Status:** Stages 1 and 2 approved; deck built (`slides.md`, 46 slides incl. appendix) and visually verified with the dev server. Remaining: live-demo rehearsal, real screenshots/recordings if wanted, and any content iteration.

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

## Stage 2 — Slide list (43 slides + 3 appendix, ~35–40 min)

Calibration: recent comparable decks run 36–45 separators (`202606-pyconkr-contextvars` 36, `202603-pycon-python-release-workflow` 45, deleted 40-min version of this talk 44).

The **stack figure** is the deck's recurring visual: a column of layers (app / framework / ASGI caller / runtime) that reappears with pieces swapped in beats 3, 5, and 6. Build it once as HTML/UnoCSS (adapting the poster's design), not as an image, so layers can be highlighted and swapped with clicks.

Opening (4)
 1. Title                     title           "ASGI on Pyodide: building a web server inside your browser"
 2. Hi 👋                     full bio        portfolio bio + assets copied from most recent deck using it
 3. What this talk is about   statement       thesis up front: cut an interface at ASGI → the "server" can be anything
 4. Agenda                    bullets         the beats — 🧩 ⚡ 🌐 🛠️ 🏭 ☁️ 🧭

Beat 1 — The boundary you never look at (4)
 5. Section                   section         "🧩 The boundary you use every day"
 6. You deploy this weekly    code            minimal FastAPI app + `uvicorn app:app` — the familiar pair
 7. Two ecosystems, one contract  figure      FastAPI/Starlette/Django on one side, Uvicorn/Hypercorn/Granian on the other, ASGI between; v-clicks per side
 8. Taken for granted         statement       "How far can the server side be stretched?"

Beat 2 — ASGI in 90 seconds (6)
 9. Section                   section         "⚡ ASGI in 90 seconds"
10. One async callable        code            `async def app(scope, receive, send)` — annotated with FancyArrow labels
11. No framework needed       code            raw-ASGI hello world; FastAPI is "just" this callable
12. Three connection types    table           http / websocket / lifespan — same shape, different `scope["type"]`
13. Demo step 1: the normal case  WindowMockup  `uvicorn app.main:app` + screenshot; live-demo cue in notes
14. The realization           statement       "The contract has no sockets in it. A server = anything that can call the app." → so do we even need a server machine?

Beat 3 — A server inside the browser (5)
15. Section                   section         "🌐 The extreme case: a server inside your browser"
16. Pyodide in one slide      bullets+logo    CPython compiled to WebAssembly; enabler, one slide only
17. Demo step 2: same app, no server  demo    live demo (static page, network tab silent) + QR; fallback screenshot slide notes
18. What's running where      stack figure    v1: page ↔ appFetch ↔ worker ↔ bridge ↔ app; Uvicorn's box replaced
19. The impersonation         statement       "Something in that tab is impersonating Uvicorn. What does that take?"

Beat 4 — Building the impersonator (7)
20. Section                   section         "🛠️ Building the bridge"
21. The route of one request  figure          htmx → `appFetch` → postMessage → worker → `app(scope, receive, send)` and back (from demo README)
22. Request → `scope`         code            build the scope dict from a JS request; line-highlight reveals
23. Wiring `receive`/`send`   code            body in via `receive`, response events out via `send`
24. Crossing JS ↔ Python      code            Pyodide proxies / buffer conversion gotchas
25. Streaming: `more_body`    code            chunked responses (cut candidate if timing runs long)
26. Lifespan                  code            driving startup/shutdown
27. Payoff                    statement       "~100 lines — and the app never noticed. But this bridge is a toy…"

Beat 5 — The production proof: Stlite (6)
28. Section                   section         "🏭 The production proof"
29. Stlite                    screenshot/demo Streamlit running in a tab; a real framework's demands (static files, state, realtime messaging — named, not explored)
30. Standard Streamlit vs Stlite  stack figure  the poster's side-by-side, adapted: what stays, what swaps
31. Emulation → ASGI dispatch  before/after   years of hand-rolled Tornado emulation vs ASGI dispatch; PRs #2043/#2044
32. Lessons (+ Gradio-Lite)   bullets         what got simpler, what stays framework-specific
33. Hook                      statement       "If the caller can be anything… the browser can't be the only unusual caller."

Beat 6 — The spectrum completed: Cloudflare Workers (5)
34. Section                   section         "☁️ A third runtime: the edge"
35. Python Workers            bullets         Cloudflare runs Pyodide server-side — the browser stack, full circle
36. The whole entrypoint      code            4 lines: hand `app` to the SDK's `asgi` module — the production sibling of our bridge
37. Three runtimes, one app   stack figure    three columns side by side; app+framework layers identical, caller layer swapped — the thesis slide
38. Stlite on Workers         screenshot      PR #2077; same story at product scale

Beat 7 — What it buys, where it stops (5)
39. Section                   section         "🧭 When to reach for this"
40. Practical applications    bullets         🔒 privacy · 📚 runnable docs · 🎓 education · 📦 static-hosted demos · scale-with-visitors
41. Honest limits             bullets         package availability, download size, no threads, CORS, never ship secrets
42. Key takeaways             bullets         the mental model: `scope`/`receive`/`send`; "a server is just a caller"
43. Thank you & links         QR codes        demo repo, Stlite, slides URL

Appendix — WebSockets (not presented; Q&A backup) (3)
44. Appendix divider          section         "Appendix: WebSockets over the bridge"
45. Awaitable receive queue   code            receive queue fed by JS socket events
46. Session choreography      figure/code     connect → accept → receive/send → close event order over one session

### WebSocket scoping decision

The 40-minute talk does not explain WebSocket handling. The talk conveys core ASGI concepts, not a spec walkthrough; WebSockets would be the densest, most redundant stretch. Slide 12 (three connection types) still *names* `websocket` as a scope type in its table, and slide 29 names realtime messaging among Streamlit's demands, but neither opens the mechanics — the appendix slides carry them for Q&A. Cut from Stage 2 revision 1: the beat-4 "WebSocket: awaitable queue" and "WebSocket: choreography" slides (moved to appendix).

## Later stages (not started)

- Package scaffolding (`package.json` with latest versions, addons: fancy-arrow, window-mockup, qrcode; `pnpm install`)
- slides.md, stack-figure component, code samples in `samples/`, `public/` assets (portfolio bio, Stlite screenshots)
- Visual overflow verification via dev server
