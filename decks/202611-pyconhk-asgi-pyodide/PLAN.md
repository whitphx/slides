# PLAN — ASGI on Pyodide (PyCon Hong Kong, 25–30 min cut)

**Status:** awaiting approval of Stage 1 (narrative arc + time budget). Stage 2 (slide list) not started. No deck files exist yet in this directory.

**Source deck:** `decks/202608-pyconkr-asgi-pyodide` (PyCon KR 2026, 40-minute slot). Its `PLAN.md` holds the original rationale; this plan only records what changes.

**Target:** PyCon Hong Kong · 30-minute slot, Q&A excluded from the 25–30 · English · same audience profile as KR (has used FastAPI/Starlette; no ASGI internals or Pyodide assumed).

**Speaking budget:** ~26 minutes. Aiming at the bottom of the 25–30 range leaves room for a slow live demo or a late start, without the talk feeling rushed.

## How long the KR deck runs today

Measured from `slides.md` (49 main slides + 8 appendix):

- Presenter notes on the main slides: **~4,200 words**. Read aloud at ~130 words per minute, that is **~32 minutes**, before any demo time.
- Three live demos (step 1 Uvicorn, step 2 browser, step 3 Cloudflare) add roughly 4–6 minutes.
- So the KR deck is really a 36–38 minute talk. To land at ~26 minutes, cut **~30% of the spoken track (~1,300 words, down to ~2,900)** and reduce live demo time to one demo.

Cutting only slides is not enough: several of the longest notes sit on slides that stay (the "two stacks" comparisons, the hole in the middle, the Workers entrypoint). Both slides and notes get cut.

## Stage 1 — Narrative arc (revised for 26 min)

The thesis is unchanged: **ASGI cuts the interface between app and server, so the "server" can be anything — even a browser tab.** The demo app stays the single running example across all three runtimes. What changes is how many steps each beat takes to reach its point.

| # | Beat | KR (min, approx.) | HK budget |
|---|---|---|---|
| 0 | Opening | 2.5 | 1 |
| 1 | The boundary you use every day | 3.5 | 2 |
| 2 | ASGI 101 + demo step 1 | 9 | 5 |
| 3 | The extreme case: Python in the tab | 4 | 2.5 |
| 4 | Build the bridge + demo step 2 | 8 | 6.5 |
| 5 | Production proof: Stlite | 4.5 | 3.5 |
| 6 | Stranger still: Pyodide on the edge | 4.5 | 3 |
| 7 | When to reach for this + takeaways | 3 | 2.5 |
| | **Total** | **~39** | **~26** |

0. **Opening.** Title and bio only. The "What this talk is about" slide goes: the deck is story-shaped and that slide pre-announces the browser and the edge.

1. **The boundary you use every day.** FastAPI + `uvicorn` (the familiar pair), then the two ecosystems with ASGI between them.
   Pain: we never look at the contract. What is it made of?
   *Cut:* the WSGI lineage slide becomes one spoken sentence on the ecosystems slide. The separate "we take this for granted" statement merges into the ASGI 101 section header.

2. **ASGI 101.** One async callable `(scope, receive, send)`; a bare GET app run under Uvicorn; a FastAPI app *is* such a callable; the one-`await` sequence shows `receive` and `send` in order. Demo step 1 confirms the normal case; the step-1 stack figure marks Uvicorn as "the caller".
   Pain: the contract has no sockets in it, so where does the caller have to run?
   *Cut:* the POST/`receive` code walkthrough (10 clicks, the longest code slide). `receive` is introduced in the sequence figure instead, which is the only place the bridge later needs it. Demo step 1 becomes a pre-recorded terminal + screenshot, not live.

3. **The extreme case: Python in the tab.** Pyodide in one slide (CPython on WebAssembly, JS ↔ Python calls), then the "hole in the middle": a page calling `fetch`, an `app` on Pyodide, and nothing to turn one into the other.
   Pain: there is no Uvicorn in the tab, so we write that layer ourselves.
   *Cut:* the Node.js `runPythonAsync` example. `pyimport` is explained on the hole slide, where it is first used.

4. **Build the bridge, then run it.** The one `dispatch` function: build `scope`, wire `receive`/`send`, await the app. Live demo step 2 (the same `main.py`, `sys.platform` says `emscripten`, network tab silent). Step-1 vs step-2 stack figure: only the caller layer changed.
   Pain: a ~45-line bridge for three endpoints is a toy. Does it hold for a real framework?
   *Cut:* "Call it from JavaScript" (`asgiFetch`) as its own slide; it folds into the "run the app" slide as one extra click, since beat 3 already introduced `asgiFetch` as the goal. The "in production, run Pyodide in a Web Worker" aside moves to the appendix, where the Web Worker slide already lives. This stays the only live demo.

5. **Production proof: Stlite.** Streamlit's shape (Python script + bundled server + SPA) and Stlite, the same swap at full framework scale, shown with the Streamlit vs. Stlite stack figure. Shinylive and Gradio-Lite are named in one line.
   Hook: the app doesn't care who calls it, so the browser can't be the only unusual caller.
   *Cut:* "Streamlit" and "Stlite" become one slide; the "Real frameworks, really in the browser" table becomes a single line under the stack figure.

6. **Stranger still: Pyodide on the edge.** Cloudflare Python Workers run on Pyodide; the whole entrypoint is four lines handing `app` to the SDK's `asgi` module (what we wrote by hand, shipped as a product). Three stacks side by side, only the caller differs. The Lambda/Azure/Vercel table follows as a quick "this pattern is already everywhere".
   Payoff: the thesis lands, three runtimes, one unchanged app.
   *Cut:* "Stlite went to the edge, too". Demo step 3 is shown as code + a screenshot of the deployed response, not live (it also removes the Workers cold-start risk on stage).

7. **When to reach for this, and where it stops.** Applications and honest limits on **one** slide (two columns), then the takeaways slide with links and QR revealed on the last click.
   *Cut:* the separate applications and limits slides merge.

### Cut list at a glance

| KR slide | Fate |
|---|---|
| 3 What this talk is about | cut |
| 7 WSGI walked first | cut → one sentence in slide 6's notes |
| 8 We take this for granted | merged into the ASGI 101 section header |
| 12 Now a POST — enter `receive` | cut (→ appendix) |
| 15 Demo step 1 | kept, recorded instead of live |
| 20 Python, called from JavaScript | cut (→ appendix) |
| 29 ④ Call it from JavaScript | merged into ③ |
| 35 + 36 Streamlit / Stlite | merged into one slide |
| 38 Real frameworks in the browser | reduced to one line |
| 42 Demo step 3 | kept, screenshot instead of live |
| 45 Stlite went to the edge, too | cut (→ appendix) |
| 47 + 48 Applications / Honest limits | merged into one slide |

Everything else stays, with notes trimmed. Expected result: **~38 main slides** (KR has 49), in line with this author's 25–30 minute decks.

### Notes trimming targets

Besides the cut slides, these notes are long enough to trim by about a third each, mostly by removing sentences the visual already says: bio (2), ecosystems (6), bare app (11), FastAPI `__call__` (13), stack step 1 (16), hole in the middle (22), demo step 2 (31), stack step 2 (32), Streamlit vs. Stlite (37), Workers entrypoint (42). The bio and greeting change to PyCon HK, and the `hello, PyCon KR` strings in samples and demo output become `hello, PyCon HK`.

## What you want decided

1. **(Blocking) Is this the right source deck?** I assumed the ASGI on Pyodide talk (`202608-pyconkr-asgi-pyodide`), because it is the 40-minute PyCon KR deck. There is also `202606-pyconkr-contextvars`, but a 30-minute contextvars version already exists (`202610-pycontw-contextvars`).
2. **(Blocking) Keep the Cloudflare beat, compressed, or cut it?** Compressed (recommended) keeps the "three runtimes, one app" payoff. Cutting it saves ~3 more minutes, which could keep the POST/`receive` walkthrough instead, but the talk then ends on "the browser" and the thesis lands weaker.
3. **Live demos:** only step 2 live (recommended), or all three as at KR?
4. **Deck directory name / month.** I used `202611-pyconhk-asgi-pyodide`. Tell me the event month if it is not November.

## What I assumed

- The talk is in English, as at KR, for a similar audience.
- The new deck is a copy of the KR deck (components, `samples/`, `scripts/`, `public/`), so the KR deck stays as it was presented. Cut slides move to the appendix, not out of the repo, so they remain available for Q&A.
- No new content is added. Every minute in the new budget comes from material the KR deck already has.
