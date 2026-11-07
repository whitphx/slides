# PLAN — ASGI on Pyodide (PyCon Hong Kong, 25–30 min cut)

**Status:** Stages 1 and 2 approved; deck built (`slides.md`, 35 main slides + 15 appendix), overflow-checked and screenshot-checked on the changed slides. Remaining: rehearsal timing, and the author's review.

**Source deck:** `decks/202608-pyconkr-asgi-pyodide` (PyCon KR 2026, 40-minute slot). Its `PLAN.md` holds the original rationale; this plan only records what changes.

**Target:** PyCon Hong Kong · 30-minute slot, Q&A excluded from the 25–30 · English · same audience profile as KR (has used FastAPI/Starlette; no ASGI internals or Pyodide assumed).

**Speaking budget:** ~26 minutes. Aiming at the bottom of the 25–30 range leaves room for a slow live demo or a late start.

## Decisions (answered with the Stage 1 approval)

- Source deck: **ASGI on Pyodide** (`202608-pyconkr-asgi-pyodide`), confirmed.
- Cloudflare Workers beat: **kept, compressed**.
- Live demos: **only step 2 is live**. Step 1 is shown as terminal + screenshot; step 3 as code + screenshot of the deployed response.
- Still open (not blocking): the event month. The directory is named `202611-pyconhk-asgi-pyodide`; renaming it is cheap.

## How long the KR deck runs today

Measured from `slides.md` (49 main slides + 8 appendix). Two of the 49 main slides were already `hide: true` at KR: "One `await` is the whole request" (KR 14) and the Lambda/Azure/Vercel table "Adding to the family" (KR 44). They are left out of the numbers below and stay hidden in the HK deck.

- Presenter notes on the 47 presented slides: **~4,000 words**. Read aloud at ~130 words per minute, that is ~31 minutes, before click pauses and demo time.
- Three live demos add roughly 4–6 minutes. So the KR deck is really a 36–38 minute talk.
- Target for HK: **~2,700 words of notes**, about a third less, plus one live demo. With click pauses this lands near 26 minutes.

## Stage 1 — Narrative arc (approved)

The thesis is unchanged: **ASGI cuts the interface between app and server, so the "server" can be anything, even a browser tab.** The demo app stays the single running example across all three runtimes.

| # | Beat | KR (min, approx.) | HK budget |
|---|---|---|---|
| 0 | Opening | 2.5 | 1 |
| 1 | The boundary you use every day | 3.5 | 2 |
| 2 | ASGI 101 + demo step 1 | 8 | 5 |
| 3 | The extreme case: Python in the tab | 4 | 2.5 |
| 4 | Build the bridge + demo step 2 | 8 | 6.5 |
| 5 | Production proof: Stlite | 4.5 | 3.5 |
| 6 | Stranger still: Pyodide on the edge | 4 | 3 |
| 7 | When to reach for this + takeaways | 3 | 2.5 |
| | **Total** | **~37.5** | **~26** |

0. **Opening.** Title and bio only. "What this talk is about" goes: the deck is story-shaped, and that slide gives away the browser and the edge before the talk reaches them.
1. **The boundary you use every day.** FastAPI + `uvicorn`, then the two ecosystems with ASGI between them. Pain: what is this contract made of? WSGI becomes one spoken sentence.
2. **ASGI 101.** One async callable `(scope, receive, send)`; a bare app under Uvicorn; a FastAPI app *is* such a callable. Demo step 1 and the step-1 stack figure mark Uvicorn as the caller. Pain: the contract has no sockets in it.
3. **The extreme case: Python in the tab.** Pyodide in one slide, then the "hole in the middle" between the page's `fetch` and the `app` on Pyodide. Pain: no Uvicorn in the tab.
4. **Build the bridge, then run it.** `dispatch`: build `scope`, wire `receive`/`send`, await the app, call it from JavaScript. Live demo step 2. Step-1 vs step-2 stack figure. Pain: is a 45-line bridge only a toy?
5. **Production proof: Stlite.** Streamlit → Stlite on one slide, then the stack comparison; Shinylive and Gradio-Lite in one line. Hook: the app doesn't care who calls it.
6. **Stranger still: Pyodide on the edge.** Workers on Pyodide, the four-line entrypoint, three stacks side by side. Payoff: three runtimes, one unchanged app.
7. **When to reach for this, and where it stops.** Uses and limits on one slide, then the takeaways with links and QR.

## Stage 2 — Slide list (35 slides, ~26 min)

Calibration: the author's 25–30 minute decks run 30–55 slides, and this one is near the low end because it is code-heavy. Word budgets are for the presenter notes. "KR n" is the slide number in the source deck, counted as in the table at the end.

**Opening (2) · ~80 words · 1 min**

| # | Title | Format | Content | From |
|---|---|---|---|---|
| 1 | ASGI on Pyodide: building a web server inside your browser | title + QR | "PyCon Hong Kong 2026" + date; QR points to the new deck URL | KR 1 |
| 2 | Yuichi (@whitphx) | full portfolio bio | same slide; notes cut to about half, "PyCon HK" | KR 2 |

**Beat 1 — The boundary you use every day (3) · ~200 words · 2 min**

| # | Title | Format | Content | From |
|---|---|---|---|---|
| 3 | 🧩 The boundary you use every day | section | — | KR 4 |
| 4 | You deploy this pair every week | code + terminal | FastAPI app, `uvicorn`, `curl` | KR 5 |
| 5 | Two ecosystems, one contract | `FancyArrow` figure | frameworks ↔ servers, ASGI between. Notes add the WSGI sentence (PEP 333, sync only, no WebSocket) and end on "what is this contract made of?", which was KR 8's job | KR 6 (+7, 8) |

**Beat 2 — ASGI 101 (7) · ~550 words · 5 min**

| # | Title | Format | Content | From |
|---|---|---|---|---|
| 6 | ⚡ ASGI 101 | section | — | KR 9 |
| 7 | An ASGI app is one async callable | annotated code | `scope` / `receive` / `send` arrows. `receive` is defined here ("the app awaits it to get the request body") because the POST walkthrough is gone | KR 10 |
| 8 | You don't even need a framework | code + terminal | bare GET app under Uvicorn; notes trimmed | KR 11 |
| 9 | So what does a framework give you? | code | `FastAPI.__call__` has the ASGI signature; notes trimmed | KR 13 |
| 10 | Demo, step 1: the normal case | code + terminal + **screenshot** | `LiveEmbed` of `localhost:8000` replaced with a static screenshot (new asset); no live server | KR 15 |
| 11 | What's actually running where — step 1 | `ServerStackFigure` | Uvicorn is the caller; "keep an eye on it" | KR 16 |
| 12 | The contract has no sockets in it. | statement | — | KR 17 |

**Beat 3 — The extreme case: Python in the tab (4) · ~250 words · 2.5 min**

| # | Title | Format | Content | From |
|---|---|---|---|---|
| 13 | 🌐 The extreme case | section | — | KR 18 |
| 14 | The enabler: Pyodide | bullets + logo | CPython on WebAssembly; JS ↔ Python calls | KR 19 |
| 15 | So… can we just call our app? | progressive code | `pyimport` the `app`, the page's `fetch`, an `asgiFetch` in its place, the hole in the middle. Notes cut from ~200 to ~130 words. The section slide "🐍 Back to our app" (KR 21) is dropped; its one line opens this note | KR 22 (+21) |
| 16 | No Uvicorn in the tab. So let's write that layer ourselves. 🛠️ | statement | — | KR 23 |

**Beat 4 — Build the bridge, then run it (8) · ~700 words · 6.5 min**

| # | Title | Format | Content | From |
|---|---|---|---|---|
| 17 | 🛠️ Building the bridge | section | "real code from the demo repository" | KR 24 |
| 18 | The one function we have to write | code | `dispatch` skeleton with two blanks | KR 25 |
| 19 | ① Turn the request into a `scope` | code, line highlights | fewer highlight steps (method, path, headers), 7 → 4 clicks | KR 26 |
| 20 | ② Wire up `receive` and `send` | annotated code | unchanged code; notes trimmed | KR 27 |
| 21 | ③ Run the app, call it from JavaScript | code (Python) + code (JS) on click | `await app(scope, receive, send)` first; then `asgiFetch` calling `dispatch` appears beside it. Needs a two-pane layout; the JS block uses its own `--slidev-code-font-size` if it does not fit | KR 28 + 29 |
| 22 | `bridge.py`: ~45 lines. The app **never noticed**. | statement | — | KR 30 |
| 23 | Demo, step 2: the same app, no server | **live demo** | unchanged, with the demo-setup cue in the notes; notes trimmed | KR 31 |
| 24 | What's actually running where — step 2 | `StackCompare` | server vs browser, only the caller changed. The Web Worker aside moves to the appendix | KR 32 |

**Beat 5 — Production proof: Stlite (4) · ~370 words · 3.5 min**

| # | Title | Format | Content | From |
|---|---|---|---|---|
| 25 | 🏭 The production proof | section + subtitle | subtitle: "Does this work for a real framework?" Takes over the question from the statement KR 33, which goes | KR 33 + 34 |
| 26 | Streamlit, and Stlite | code + screenshots | left: `app.py` + `streamlit run` + screenshot. On click, right: the `stlite.html` mount snippet + the Stlite page (static embed, low risk). The small Streamlit stack figure from KR 35 goes, since slide 27 shows it | KR 35 + 36 |
| 27 | Standard Streamlit vs. Stlite | `StackCompare` | unchanged figure; one line added at the bottom: "Same idea: **Shinylive** (Posit) · **Gradio-Lite**" | KR 37 (+38) |
| 28 | The app doesn't care **who calls it**. | statement | — | KR 39 |

**Beat 6 — Stranger still: Pyodide on the edge (4) · ~260 words · 3 min**

| # | Title | Format | Content | From |
|---|---|---|---|---|
| 29 | ☁️ Stranger still: Pyodide on the edge | section | — | KR 40 |
| 30 | Cloudflare Workers run Python — on Pyodide | bullets | unchanged | KR 41 |
| 31 | Demo, step 3: the entire entrypoint | annotated code + **screenshot** | `LiveEmbed` of the Workers URL replaced with a screenshot of the deployed response (new asset). Notes cut from ~200 to ~130 words; the deploy-warming cue goes, since nothing is live | KR 42 |
| 32 | What's actually running where — step 3 | `StackCompare`, three columns | the thesis slide: only the caller differs | KR 43 |

**Beat 7 — When to reach for this (3) · ~260 words · 2.5 min**

| # | Title | Format | Content | From |
|---|---|---|---|---|
| 33 | 🧭 When to reach for this | section | — | KR 46 |
| 34 | Where it fits, and where it stops | two columns | left ✅: static hosting · runnable docs · education · privacy, Streamlit Playground. Right ⚠️: no threads · package coverage · no secrets · no webhooks. "Works with real servers, doesn't replace them" | KR 47 + 48 |
| 35 | Key takeaways | bullets + links + QR | unchanged structure; QR and links point to the new deck | KR 49 |

**Total: 35 slides, ~2,670 words of notes.**

**Appendix — not presented; Q&A backup**

The KR appendix (KR 50–57) stays as it is. These join it:

- Not a new idea: WSGI walked first (KR 7)
- Now a POST — enter `receive` (KR 12)
- One `await` is the whole request (KR 14, already hidden at KR)
- Python, called from JavaScript, the Node.js example (KR 20)
- Real frameworks, really in the browser, the full table (KR 38)
- Adding to the family, Lambda/Azure/Vercel (KR 44, already hidden at KR)
- Stlite went to the edge, too (KR 45)

The existing appendix slide "Step 2b: the same bridge, in a Web Worker" picks up the Web Worker aside from KR 32's notes.

### Cut list at a glance

| KR slide | Fate |
|---|---|
| 3 What this talk is about | cut |
| 7 WSGI walked first | → appendix; one sentence on slide 5 |
| 8 We take this for granted | absorbed into slide 5's closing question |
| 12 Now a POST — enter `receive` | → appendix; `receive` defined on slide 7 |
| 14 One `await` is the whole request | stays hidden (→ appendix) |
| 15 Demo step 1 | kept, screenshot instead of live |
| 20 Python, called from JavaScript | → appendix |
| 21 Back to our app | dropped; one line into slide 15 |
| 28 + 29 Run the app / Call it from JavaScript | merged (slide 21) |
| 33 Doing Uvicorn's job | becomes slide 25's subtitle |
| 35 + 36 Streamlit / Stlite | merged (slide 26) |
| 38 Real frameworks in the browser | one line on slide 27; table → appendix |
| 42 Demo step 3 | kept, screenshot instead of live |
| 44 Adding to the family | stays hidden (→ appendix) |
| 45 Stlite went to the edge, too | → appendix |
| 47 + 48 Applications / Honest limits | merged (slide 34) |

## Build notes (as built)

- The directory is a copy of the KR deck's tracked files (`components/`, `samples/`, `scripts/`, `public/`, `package.json`), with the package renamed. The KR deck is left as it was presented. `pnpm-lock.yaml` gains only an importer entry for this deck, copied from the KR deck's (same dependencies).
- `PyCon KR` → `PyCon HK` everywhere: title slide, bio (the circled flag is now 🇭🇰HK), and the strings in `samples/` and the terminal output on the slides. The `raw-asgi` and `fastapi-is-asgi` tests pass after the change.
- Presenter notes on the 35 main slides: **~2,780 words** (target ~2,700).

### Changes from the Stage 2 list

- **No new screenshot assets for steps 1 and 3.** Slides 10 and 31 keep their `LiveEmbed`, which already shows a drawn mock of the page when the app is not reachable. With `pnpm dev:live` running, or the Workers deployment warm, the embed shows the real app; either way the notes no longer stop for an interactive demo there.
- **The Web Worker click on slide 24 stays.** The step-3 figure (slide 32) draws a Web Worker row in the browser column, so dropping its one-sentence introduction would leave that row unexplained. The aside costs one click and one sentence.
- **Slide 21** (run the app + call it from JavaScript): the JavaScript pane slides in over the Python pane in the same space, rather than sitting beside it; the two do not fit side by side at a readable size. A floating note points at the `dispatch` call on the last click.
- **Slide 26** (Streamlit + Stlite): on click 4 the terminal is replaced by the `stlite.html` snippet on the left and the Streamlit app by the Stlite page on the right; `app.py` stays on screen as "the same `app.py`". To fit the column, `samples/streamlit-demo/stlite.html` now breaks the `entrypoint` attribute onto its own line.
- **Slide 27**: the Shinylive / Gradio-Lite line replaces the punchline on the last click instead of adding a line, because the comparison has no spare height below it.

### Alignment with the HK proposal (added after the build)

`whitphx/pycon-proposals` → `proposal.2026.hk.2.md` promises, in its abstract and takeaway 2, WebSocket sessions, lifespan events and PEP 567 context variables. The KR deck had moved the first two to its appendix and never covered the third. The author chose to keep the approved structure (Cloudflare beat included) and close the gap lightly:

- **New main slide 28, "A real framework needs more than one request"**, after the Streamlit vs. Stlite comparison: WebSocket, lifespan and `contextvars` as three boxes, one click each, ending on "details in the appendix". About 45 seconds; the talk is now ~2,960 words of notes, about 27 minutes.
- **New appendix slide, "`contextvars`: many apps, one Pyodide"**, at the end: Stlite's `home_dir` `ContextVar` (pseudocode after `stlite_lib/server/task_context.py`, as in `202610-pycontw-contextvars`), the copy-per-task rule, and the caveat that `os.getcwd()` stays process-wide. The contextvars talk (`proposal.2026.hk.md`) is not being given at HK, so this is the deck's only coverage of it.
- The proposal's outline puts the browser demo first and "ASGI in 90 seconds" after it; the approved arc keeps ASGI first. Cloudflare Workers is not in the proposal but stays.

### Known issue, inherited from the KR deck

The `uv.lock` files in `samples/raw-asgi`, `samples/fastapi-is-asgi` and `samples/streamlit-demo` resolve against a private mirror, not pypi.org, so `uv run --frozen` fails for anyone else (see `samples/README.md` for how to re-lock). Not fixed here; the tests were run in a separate environment installed from PyPI.

## What I assumed

- The talk is in English, as at KR, for a similar audience.
- No new content is added. Every minute in the new budget comes from material the KR deck already has.
- Hidden slides in the KR deck stay hidden.

### Audience review (post-build)

Fixed, mostly gaps left by the cuts:
- `receive`: slide 8's notes say why the GET app never calls it; slide 20 now shows where `request_body` comes from and says what `more_body: False` means.
- How the demo reaches Pyodide: slide 15's notes mention `micropip` and copying `main.py` into Pyodide's file system; slide 23's notes mention the htmx hook that sends every request to `asgiFetch`; slide 18 says why `dispatch` is written in Python; slide 21's notes explain `toPy` / `toJs`.
- Slide 24 explains "Web Worker"; slide 31's notes explain "edge" and why Cloudflare needs Pyodide.
- Slides 27–29: "our bridge" is now "Stlite's bridge"; slide 28 is retitled "What Stlite's bridge adds beyond one HTTP request" and no longer claims contextvars goes through `receive` / `send`.
- Slide 35 marks the secrets and webhook limits as browser-only. The last takeaway now reads "I learned ASGI by writing an ASGI server".

Not changed, because the wording is the KR deck's and was approved as is: titles such as "The boundary you use every day", "ASGI 101", "3 transports" and "The interface holds"; the two transition slides 16–17; the "~45 lines" figure.
