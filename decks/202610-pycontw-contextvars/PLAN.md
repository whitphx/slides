# The hidden current context — PyCon TW 2026

**Status:** both stages approved and built. `slides.md` has all 37 slides with presenter notes; `pnpm build` passes and the deck measures zero overflow on both axes.

**Source:** `whitphx/pycon-proposals` → `proposal.2026.tw.md`
**Slot:** 30 min (~25 min content + 5 min Q&A) · English · intermediate
**Relationship to `decks/202606-pyconkr-contextvars`:** same talk, same proposal lineage. This deck is written fresh against the arc below; the KR deck is a style and content reference only, not a fork.

---

## Stage 1: Narrative arc

### 1. Where we start: the "current" state you already write
Globals, `threading.local()`, the current request / user / transaction. In a thread-per-request server this genuinely works, and the audience has shipped it.

**Pain:** async puts many logical executions on one thread. `threading.local()` collapses them into a single bucket, and the request ID in your log line now belongs to somebody else's request.

### 2. `contextvars`: state that follows the call chain, not the thread
`ContextVar`, `Context`, `Token`. A value that survives `await` and stays attached to the logical execution rather than the OS thread.

**Pain:** it works, and the canonical demo (request IDs in logs) makes it look like a logging utility. That framing undersells the mechanism and hides where it stops working.

### 3. The rule that actually governs it: context is *copied* at task creation
Not shared, copied. So propagation has an edge, and the edge is where the bugs are: setting a value after you already spawned the task, hopping into a thread pool, crossing a sync/async boundary.

**Pain:** even with propagation perfectly understood, all you have is an answer to "which logical execution am I in?" Nothing has been made safe yet.

### 4. Stlite: where that gap turns into a real bug
Multiple logical Streamlit servers sharing one Python environment and one thread, in the browser. `contextvars` correctly reports which app is running. `os.chdir()` is still process-wide, so that correct answer doesn't help on its own.

**Pain:** knowing the right directory is not the same as applying it. Between two awaits another task runs and moves the cwd out from under you.

### 5. Step 2: apply and restore around every resume
The coroutine proxy: wrap each step of the coroutine, set the global state on entry, restore it on exit.

**Payoff:** two mechanisms with a clean split. `contextvars` models the logical execution; the proxy reconciles that model with a global API that knows nothing about it.

### 6. The generalized lesson
`contextvars` is a language-level tool for modeling logical execution context, not a fix for global state. Build a framework, runtime, or async library and you have to define your context boundary, then decide what happens at every global API it touches. Free-threading (3.13+) sharpens it: thread identity and logical execution context are now unmistakably different things.

---

## What I want decided

1. **How much of the talk is Stlite?** The proposal gives the case study 8 of ~25 minutes, the largest single block. You spoke on stlite at PyCon TW 2023, so some of this audience already knows what it is, which would let beat 4 skip the introduction and land on the bug faster. Worth trading that time into beats 2 and 3? *(Blocking: it changes the weight of half the talk.)*
2. **Does free-threading stay?** It's in the proposal's outline but absent from the KR deck, so it is new material to write and verify. It earns its place in beat 6 as the sharpest statement of the thesis, but it is also the easiest thing to cut if the run is long.
3. **Full portfolio bio?** You left this to the topic. The talk's case study *is* your project, so my read is yes, full portfolio bio.

## What I assumed

- The audience writes async Python, knows `await` and `asyncio.Task`, and has reached for `threading.local()` or a module-level global. They do not know `contextvars`.
- **Reordered from the proposal:** "common use cases and patterns" is not a standalone section. Request IDs, tracing, and transaction context appear inside beat 2 as the familiar framing, and "when explicit parameters are better" moves to beat 6 where it is a design lesson rather than a list item.
- **Also reordered:** "context is copied at task creation" moves *before* the case study (beat 3). The Stlite bug is an instance of the propagation-edge problem, so the audience needs the rule in hand to feel the bug. The remaining pitfalls (thread pools, sync/async hops, free-threading) stay at the end.
- Beat 4 introduces Stlite as a case study, not as a product, so it gets only what the bug needs.
- Q&A is inside the 30, leaving ~25 minutes of content.

---

## Stage 2: Slide list (37 slides, ~25 min)

**Decisions carried in:** Stlite keeps its full ~8 min with a proper introduction · free-threading stays · full portfolio bio.

### Opening (4)
```
 1. The hidden current context      title        + subtitle "Understanding `contextvars` through real-world runtime problems"
 2. Hi 👋                           bio          full portfolio (projects, contributions, past talks)
 3. What you'll leave with          bullets      v-clicks: the problem it solves · how values propagate · where it stops working
 4. Agenda                          bullets      🧩 🧠 🔬 ⚠️ — the four sections
```

### Beat 1 — the "current" state you already write (5) · ~3 min
```
 5. 🧩 Everything is "current"      section      + subtitle: the state you never pass as an argument
 6. Python is full of "current"     bullets      emoji grid: request · user · transaction · cwd · runtime
 7. The sync answer                 code         module global, then `threading.local()` in a thread-per-request server
 8. One thread, many requests       FancyArrow   thread-per-request vs. one event loop; plainBackground
 9. Where it breaks                 code+output  two tasks, one `threading.local()`, the wrong request ID on screen
```

### Beat 2 — a variable that follows the `await` (7) · ~6 min
```
10. 🧠 Following the call chain     section
11. `ContextVar`: declare/set/get   code         click spec walks the three lines
12. Same program, right answer      magic-move   morph slide 9's broken code into the `ContextVar` version
13. `Context`: a snapshot           code         `copy_context()`, `ctx.run()`
14. `Token` and `reset()`           code         set returns a token; reset restores the previous value
15. Where you've already met it     bullets      request IDs in logs · OpenTelemetry spans · DB session/transaction
16. "So it's a logging tool?"       statement    the tension: every example you've seen is a logging filter
```

### Beat 3 — the rule that explains the surprises (4) · part of the 6 min above
```
17. Context is *copied* at creation FancyArrow   parent context → snapshot at `create_task`; plainBackground
18. Set before you spawn            code+output   the classic bug: set after `create_task`, task never sees it
19. The edges                       code         `run_in_executor` drops it; `copy_context()` carries it across
20. What you have now               statement    you know *which* execution you're in. Nothing is safe yet.
```

### Beat 4 — Stlite, and one very global variable (6) · ~4 min of the 8
```
21. 🔬 Case study: Stlite           section      + subtitle: Streamlit in the browser
22. What is Stlite?                 bullets+img  Streamlit on Pyodide/WASM, no server; public/stlite.svg
23. Seeing it run                   WindowMockup browser frame, an app running with no backend
24. The unusual setup               FancyArrow   N logical servers · one Python · one thread; plainBackground
25. Each app wants its own dir      code         app A at /app-a, app B at /app-b — and `os.getcwd()` is process-wide
26. The bug                         code+output  task A chdirs, task B resumes in A's directory
```

### Beat 5 — the two-step fix (5) · ~4 min of the 8
```
27. Step 1: remember *which*        code         the `ContextVar` holding each task's runtime info (real task_context.py)
28. Knowing ≠ applying              statement    contextvars gave us the answer. Nobody told the OS.
29. Step 2: apply and restore       code         the context manager: chdir in, chdir back out
30. Around every resume             magic-move   morph into the coroutine proxy wrapping `send`/`throw`
31. Putting it together             FancyArrow   two tasks interleaving, each resuming in its own dir; plainBackground
```

### Beat 6 — where the boundary is yours to draw (5) · ~5 min
```
32. ⚠️ Drawing the boundary         section
33. Four pitfalls                   bullets      v-clicks: copy-at-creation · thread pools · sync/async hops · global side effects
34. 3.13: thread ≠ logical context  FancyArrow   free-threading finally separates the two; plainBackground
35. The core lesson                 statement    `contextvars` tells *you* which. It never tells the OS.
36. Hidden context or a parameter?  table        the rule to take home: when each one is right
```

### Closing (1)
```
37. Key takeaways                   bullets      v-clicks, then a final v-click reveals links + QRCode underneath
```

---

## Notes on the build

- **Addons:** `fancy-arrow`, `window-mockup`, `qrcode`. No `anipres` — the propagation diagrams are static figures with click reveals.
- **Assets to copy** from `decks/202606-pyconkr-contextvars/public/`: `portfolio/*`, `github_whitphx.png`, `stlite.svg`.
- **Accuracy dependency:** slides 27-31 must be written against the real implementation, not a plausible approximation —
  `stlite/packages/kernel/py/stlite-lib/stlite_lib/server/task_context.py`. Read it before writing that block.
- **Format balance:** 11 code slides, 4 diagrams, 4 statements, 4 sections, 2 WindowMockups, 1 table. The KR deck was
  almost entirely bullets and code; the diagrams are the main structural change.
- **Section emojis** match the agenda on slide 4, so the audience can track position.

---

## Build notes (what actually shipped)

Deviations from the Stage 2 list, all found while rendering:

- **Slide 23** is a hand-built HTML mock of a Streamlit app inside `WindowMockup`, not a screenshot — there was no
  screenshot asset to use. Swap in a real one if you'd rather. Verified in both light and dark themes.
- **Slide 31** became a 3-column grid (thread owner / `os.getcwd()` per time slice) rather than a free-form timeline.
  The spacer-based version ran off the right edge of the slide.
- **Slide 24's** three arrows converged on one anchor and rendered as a scribble; they now aim at separate
  percentage points on the target's left edge.
- **Slide 17** carries `create_task()` + "copies the context" as a label block; the arrow is unlabelled, because the
  arrow's own label collided with it.

Code shown in slides 27-31 is simplified from the real implementation and cited on slide 27. The originals live in
`stlite_lib/server/task_context.py`: `home_dir_contextvar`, `TaskSpecificDirectoryConfig`, and
`DirectorySyncCoroutineProxy`, which wraps `send`/`throw`/`close`. The slide shows `send` only.

`pnpm lint` reports 3 pre-existing `vue/multi-word-component-names` errors in other decks' `Modal.vue` files.
This deck adds no Vue components.
