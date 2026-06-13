---
theme: ../../themes/triangle
title: "The hidden current context: understanding contextvars through real-world runtime problems"
drawings:
  persist: false
mdc: true
themeConfig:
  primary: '#36709E'
defaults:
  transition: slide-left
transition: fade-out
addons:
  - fancy-arrow
  - window-mockup
---

<h1 text-5xl leading-16>
The hidden current context
<br>
<small text-3xl op80>Understanding <code>contextvars</code> through<br>real-world runtime problems</small>
</h1>

<div mt-12 text-xl op80>
Yuichiro Tachibana (橘 祐一郎) · @whitphx
</div>

<div absolute bottom-8 right-10 text-sm op60>
PyCon Korea 2026
</div>

<!-- Hi everyone, thanks for coming. So today I want to talk about something that's hiding in almost every Python program you write — this invisible "current" state. The current request, the current user, the current directory. And there's a module in the standard library, contextvars, that's built exactly for this. I'll walk you through what problem it actually solves, and then show you a real runtime I built where I had to push it to its limits. Let's get into it. -->

---

<h1>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div class="portfolio" w-130 mt-6 v-click="1">

- <span class="heading">Created</span>: <span class="item"><img src="/portfolio/awesome_emacs_keymap.svg">Awesome Emacs Keymap</span>, <span class="item"><img src="/portfolio/stlite.png">Stlite: In-browser Streamlit</span>, <span class="item">🎈 Streamlit-WebRTC</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio-Lite: Serverless Gradio</span>, <span class="item">🤗 Transformers.js.py</span>
- <span class="heading">Contributed to</span>: <span class="item"><img src="/portfolio/streamlit-mark-color.svg" style="height: 0.8em;">Streamlit</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio</span>
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🌏APAC, 🇪🇺Euro, 🇹🇼TW, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT</span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item">🐍SciPyData2026</span>

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

<style>
  .portfolio {
    font-size: 1.0rem;
  }
  .item {
    height: 1.8rem;
    line-height: 1.0rem;
    font-weight: 300;
    display: inline-flex;
    align-items: center;

    img {
      height: 1.0em;
      margin-right: 0.25em;
    }
  }
</style>

<!-- I'm Yuichiro Tachibana, whitphx online. I build and maintain a bunch of open source projects in the Python ecosystem. The one that matters most for today is Stlite — that's Streamlit running entirely in the browser on WebAssembly. Building that runtime is exactly where I ran into the contextvars problems I'm going to show you. So this talk isn't a textbook tour — it's a report from actually shipping a Python runtime. -->

---

# What this talk is about

<div mt-8 text-xl>

<v-clicks>

- Python programs lean on invisible **"current" state** — the current request, user, transaction, directory, runtime…
- In sync code it's mostly fine. In **async** code, where many logical executions share one thread, it gets tricky.
- `contextvars` is the standard-library answer — but it has a **clear boundary** of what it can and can't do.

</v-clicks>

</div>

<div v-click="4" mt-10 border="~ sky/50 rounded-lg" p-5 bg-sky:10 text-xl>

**Key message:** `contextvars` models *which logical context you're in* — but it does **not** automatically make process-global side effects (cwd, env vars) safe. You still have to design around those.

</div>

<!-- OK so here's the shape of the talk in one slide. Python is full of this invisible "current" state. In synchronous code you can usually get away with sloppy handling. But the moment you go async, where lots of logical executions share a single thread, it falls apart. contextvars is the tool for this — but, and this is the whole point of the talk, it has a boundary. It tells you which context you're in. It does NOT magically make global things like the current directory safe. Hold onto that one sentence in the box — everything else builds toward it. -->

---

# Agenda

<div mt-6 text-2xl>

<v-clicks>

- 🧩 **The problem** — why "current" state is harder than it looks
- 🧠 **The mental model** — `ContextVar`, `Context`, and async propagation
- 🛠️ **Common patterns** — logging, tracing, request-local state
- 🔬 **Case study: Stlite** — many servers, one Python environment, one thread
- ⚠️ **Pitfalls & design lessons** — where the boundary really is

</v-clicks>

</div>

<!-- Here's the plan. We start with the problem — why "current" state is deceptively hard. Then the mental model of contextvars, the three or four concepts you actually need. Then the common patterns you've probably seen, like request IDs in logs. Then the main event — the Stlite case study, where I had multiple web servers sharing one Python environment and one thread. And we close with the pitfalls and the design lessons I took away from it. -->

---
layout: section
---

# 🧩 The problem

<div mt-4 op70>
Why "current" state is harder than it looks
</div>

<!-- Alright. Let's start by feeling the pain before we reach for any solution. -->

---

# Python is full of "current" state

<div mt-6 grid="~ cols-2" gap-6 text-lg>

<div v-click="1" border="~ gray/30 rounded-lg" p-4>
🌐 The current <b>request</b> &nbsp;/&nbsp; 👤 the current <b>user</b>
</div>

<div v-click="2" border="~ gray/30 rounded-lg" p-4>
💳 The current <b>transaction</b> / session
</div>

<div v-click="3" border="~ gray/30 rounded-lg" p-4>
📁 The current <b>working directory</b>
</div>

<div v-click="4" border="~ gray/30 rounded-lg" p-4>
🏃 The current <b>runtime</b> / application
</div>

</div>

<div v-click="5" mt-8 text-xl op80>

We rarely pass these explicitly. They live as **ambient state** — "you just know what the current one is."

</div>

<!-- Think about how much of your code depends on a "current" something. The current request being handled. The current logged-in user. The current DB transaction. The current working directory. In a framework or a runtime, even the current application instance. And here's the thing — we almost never pass these around as explicit arguments. They sit in the background as ambient state. Everyone just assumes "of course there's a current request, and of course you can reach it." That assumption is exactly where the trouble starts. -->

---

# The sync world: globals and `threading.local()`

<div grid="~ cols-2" gap-6 mt-4>

<div v-click="1">

A single-flow script? A **global** is enough.

```py {*}{maxHeight:'200px'}
current_user = None

def handle():
    global current_user
    current_user = load_user()
    do_work()        # reads current_user
```

</div>

<div v-click="2">

Threaded server? One global would collide — so `threading.local()` gives **each thread its own copy**.

```py {*}{maxHeight:'200px'}
import threading

_state = threading.local()

def handle(req):
    _state.user = req.user
    do_work()        # reads _state.user
```

</div>

</div>

<div v-click="3" mt-6 op80 text-lg>

One thread = one request at a time → thread-local state maps cleanly to "the current request."

</div>

<!-- So how have we solved this historically? In a simple script with one flow of execution, a plain global variable works fine. There's only one "current" anything. Then you move to a threaded web server — now multiple requests run at once, one per thread, and a single global would have them stomping on each other. So we reach for threading.local. Each thread gets its own private copy of the state. And this works beautifully because of one assumption: one thread handles one request at a time. So "the current thread's state" is exactly "the current request's state." Remember that assumption — async is about to break it. -->

---

# Async breaks the assumption

<div mt-2>

With `asyncio`, **many tasks share one thread**. They interleave at every `await`.

</div>

```py {*|6-8|10-12|*}{maxHeight:'260px'}
import asyncio, threading

_state = threading.local()

async def handle(req):
    _state.user = req.user          # set "current" user
    await asyncio.sleep(0.1)        # 👈 another task runs here!
    print(_state.user)              # ...whose user is this now?

async def main():
    # Two requests interleave on the SAME thread
    await asyncio.gather(handle(req_a), handle(req_b))
```

<div v-click="4" mt-4 border="~ red/50 rounded-lg" p-3 bg-red:10>

`threading.local()` is **per thread**, not per task. Task B overwrites `_state.user` while Task A is suspended at `await`. A wakes up seeing **B's** user. 💥

</div>

<!-- Here's where it falls apart. Under asyncio, you do NOT get one thread per request. You get many tasks sharing a single thread, taking turns every time they hit an await. Look at handle. It sets the current user, then awaits. That await is a yield point — control goes back to the event loop, and another task gets to run on the same thread. So task B comes in and overwrites _state.user, because thread-local is shared across every task on that thread. When task A wakes back up, it reads the user and gets B's value. The state got clobbered. threading.local is per-thread, but our unit of concurrency is now the task, not the thread. That mismatch is the bug. -->

---
layout: section
---

# 🧠 The mental model

<div mt-4 op70>
<code>ContextVar</code>, <code>Context</code>, and how values flow across async
</div>

<!-- So we need something that's per-logical-execution, not per-thread. That's exactly what contextvars gives us. Let me build up the mental model — it's only a few pieces. -->

---

# `ContextVar`: the basic API

<div mt-2>

Introduced by [PEP 567](https://peps.python.org/pep-0567/) (Python 3.7). Declare **once at module level**, then `get` / `set`.

</div>

```py {*|1|3|6|10|*}{maxHeight:'300px'}
from contextvars import ContextVar

current_user: ContextVar[str] = ContextVar("current_user", default="anonymous")

def handle(req):
    current_user.set(req.user)   # set in THIS context
    do_work()

def do_work():
    print(current_user.get())    # read the current context's value
```

<div v-click="5" mt-4 op80 text-lg>

Looks like a glorified global — the magic is **how its value is scoped** across async tasks.

</div>

<!-- The basic API is tiny. You import ContextVar, and you declare it once at module level — that part matters, you don't create these per request, you create one variable that holds different values per context. Then it's just get and set. set stores a value in the current context, get reads it back. At a glance this looks exactly like a global variable with extra steps. And honestly the API isn't the interesting part. The interesting part is the scoping — what "the current context" means, and how that value travels, or doesn't travel, across async tasks. That's what the next few slides are about. -->

---

# `Context`: a snapshot of all the vars

<div mt-2 text-lg>

A `Context` is a mapping of every `ContextVar` → its value. `copy_context()` snapshots the current one; `ctx.run(fn)` runs code **inside** that snapshot.

</div>

```py {*|3|4|7|9|*}{maxHeight:'270px'}
import contextvars

current_user.set("alice")
ctx = contextvars.copy_context()   # snapshot: {current_user: "alice", ...}

def show():
    print(current_user.get())      # "alice" — reads from the active context

ctx.run(show)                      # runs show() with ctx as the active context
```

<div v-click="4" mt-4 op80 text-lg>

You rarely call `ctx.run` yourself — **`asyncio` does it for you** for every task. That's the key.

</div>

<!-- The second concept is Context, capital C. A ContextVar is one variable. A Context is the whole bag — a mapping from every context variable to its current value. copy_context takes a snapshot of that bag right now. And ctx.run runs a function with that snapshot installed as the active context, so any get inside sees those snapshotted values. Now, in day-to-day code you almost never call ctx.run by hand. The reason it matters is that asyncio calls it for you, under the hood, for every single task. So understanding run is understanding what asyncio is doing on your behalf. Let me show that. -->

---

# How values propagate across tasks

<div mt-2 text-lg>

When you create a `Task`, asyncio **copies the current context** and runs the coroutine inside that copy.

</div>

```py {*|2|4-5|7-9|*}{maxHeight:'250px'}
async def child():
    print(current_user.get())     # sees "alice" — copied at creation time

async def main():
    current_user.set("alice")

    t = asyncio.create_task(child())   # 📸 context copied HERE
    current_user.set("bob")            # changing main's context now...
    await t                            # ...does NOT affect child → still "alice"
```

<div v-click="4" mt-4 grid="~ cols-2" gap-4 text-sm>

<div border="~ emerald/40 rounded-lg" p-3 bg-emerald:10>
✅ Values set **before** task creation are visible inside the task.
</div>

<div border="~ amber/40 rounded-lg" p-3 bg-amber:10>
⚠️ The copy is **shallow & one-way** — the task gets its own context; changes don't flow back out.
</div>

</div>

<!-- Here's the propagation rule, and it's the single most important slide in the mental-model section. When you create a task, asyncio snapshots the current context at that moment and runs the coroutine inside the copy. So in main, I set the user to alice, then create the child task — snapshot happens right there. Then I change main's user to bob. The child still prints alice, because it's reading from its own copy taken before the change. Two takeaways. Values you set before creating the task ARE visible inside it — that's how request context flows down into the work you spawn. But the copy is one-way: the task has its own context, and changes inside it, or changes in the parent afterward, don't cross over. This is what makes each task's "current" state independent — exactly what threading.local failed to do. -->

---

# Tokens & reset: restoring the previous value

<div mt-2 text-lg>

`set()` returns a **`Token`**. `reset(token)` puts the variable back to what it was before — the basis for clean nesting.

</div>

```py {*|2|4|6|*}{maxHeight:'240px'}
def with_user(user, fn):
    token = current_user.set(user)    # remember the previous value
    try:
        fn()
    finally:
        current_user.reset(token)     # restore it — even on exception
```

<div v-click="4" mt-4 op80 text-lg>

This is how middleware sets a value for the duration of a request and cleanly tears it down afterward.

</div>

<!-- Last piece of the model: tokens. When you call set, it hands you back a token. That token remembers what the value was before you set it. Later you call reset with the token and it restores the old value. Why do you care? Nesting and cleanup. Middleware sets the current user at the start of a request, does the work, and resets in a finally block so the value is torn down cleanly, even if something throws. Without this you'd leak state from one request into the next. So: ContextVar to hold the value, Context as the snapshot, automatic copy at task creation, and tokens for clean set-and-restore. That's the whole model. Now let's see where people actually use it. -->

---
layout: section
---

# 🛠️ Common patterns

<div mt-4 op70>
Where you've probably already seen <code>contextvars</code>
</div>

<!-- Before the deep case study, let me ground this in the patterns you've likely already met, maybe without noticing. -->

---

# The classic: request IDs in logs

<div mt-2 text-lg>

Attach a per-request ID to **every** log line — without threading it through every function call.

</div>

```py {*|4|6-9|11-13|*}{maxHeight:'280px'}
import logging
from contextvars import ContextVar

request_id: ContextVar[str] = ContextVar("request_id", default="-")

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id.get()   # pull from current context
        return True

async def handle(req):
    request_id.set(req.id)        # set once, at the edge
    await do_lots_of_work()       # every log line inside carries req.id
```

<div v-click="4" mt-3 op80 text-lg>

Same idea powers **distributed tracing** — the current span lives in a `ContextVar` (e.g. OpenTelemetry).

</div>

<!-- The canonical example is request IDs in logs. You want every log line produced while handling a request to carry that request's ID, so you can grep your logs and follow one request end to end. The naive way would be to pass a request_id argument into every single function — miserable. Instead you put it in a ContextVar, set it once at the edge where the request arrives, and a logging filter reads it from the current context and stamps it onto every record. The deep call stack doesn't know or care. And this exact pattern is what distributed tracing libraries like OpenTelemetry use — the "current span" is a context variable. So if you've used structured logging or tracing, you've already used contextvars. -->

---

# When NOT to use it

<div mt-6 text-xl>

<v-clicks>

- Hidden context is **convenient but invisible** — it hurts readability and testability when overused.
- If a value is **core to a function's behavior**, pass it as an **explicit argument**.
- Good fit: cross-cutting, ambient concerns — logging, tracing, request scope.
- Bad fit: business logic that should be obvious from the signature.

</v-clicks>

</div>

<div v-click="5" mt-8 text-center text-xl op80>

`contextvars` is a tool for **ambient** state — not a replacement for parameters.

</div>

<!-- A quick but important caveat, because it's easy to fall in love with this and overuse it. Hidden context is convenient, but it's invisible — a reader of your function can't see what it depends on, and tests have to set up context instead of just passing arguments. So the rule of thumb: if a value is central to what a function does, make it a real parameter. Save contextvars for cross-cutting, ambient concerns — logging, tracing, request scope, the stuff that genuinely shouldn't clutter every signature. It's a tool for ambient state, not an excuse to stop passing arguments. OK — with the model and the patterns in hand, let me show you the real-world case where I had to lean on all of this. -->

---
layout: section
---

# 🔬 Case study: Stlite

<div mt-4 op70>
Many servers, one Python environment, one thread
</div>

<!-- This is the heart of the talk. Everything so far was setup. Now let me show you a real runtime where these problems weren't academic — they were bugs I had to fix. -->

---

# What is Stlite?

<div grid="~ cols-2" gap-8 mt-4>

<div>

<v-clicks>

- **Streamlit, running in the browser** — no server, no install
- Powered by **Pyodide / WebAssembly** (CPython compiled to WASM)
- Your Streamlit app runs **client-side**, inside the page
- I created and maintain it

</v-clicks>

<div v-click="5" mt-6 text-sm op70>

[github.com/whitphx/stlite](https://github.com/whitphx/stlite) · [stlite.net](https://stlite.net/)

</div>

</div>

<div flex="~ col" items-center justify-center>

<div bg-white rounded-xl px-8 py-6>
<img src="/stlite.svg" alt="Stlite logo" h-32 mx-auto>
</div>

</div>

</div>

<!-- Quick intro to Stlite for those who haven't seen it. Streamlit is a popular Python framework for building data apps. Normally it runs as a server on your machine. Stlite takes that whole thing and runs it inside the browser, with no server at all, using Pyodide — which is CPython compiled to WebAssembly. So your Streamlit app executes client-side, right there in the web page. I built it and I maintain it. And running a Python web framework inside a browser tab puts you in a very unusual environment, which is where contextvars comes in. -->

---

# The unusual setup

<div mt-4 text-lg>

In a browser page, you can mount **multiple Stlite apps at once**. Each is a logical Streamlit server — but they all share **one** Python environment.

</div>

<div grid="~ cols-3" gap-3 mt-6 text-sm>

<div v-click="1" border="~ sky/40 rounded-lg" p-3 bg-sky:5 text-center>
🟦 <b>Server A</b><br><span op70><code>app_a/</code> as its dir</span>
</div>
<div v-click="1" border="~ violet/40 rounded-lg" p-3 bg-violet:5 text-center>
🟪 <b>Server B</b><br><span op70><code>app_b/</code> as its dir</span>
</div>
<div v-click="1" border="~ amber/40 rounded-lg" p-3 bg-amber:5 text-center>
🟧 <b>Server C</b><br><span op70><code>app_c/</code> as its dir</span>
</div>

</div>

<div v-click="2" mt-4 text-center text-3xl op60>⬇️</div>

<div v-click="2" mt-4 border="~ gray/50 rounded-lg" p-4 text-center bg-gray:5>
🐍 <b>One Pyodide runtime — one interpreter, one thread</b>
</div>

<div v-click="3" mt-5 op80 text-lg>

So "which app am I currently serving?" is a per-**task** question — classic `contextvars` territory.

</div>

<!-- Here's what makes Stlite weird. In a single browser page, you can mount more than one Stlite app at the same time. Each one behaves like its own Streamlit server, with its own working directory, its own files. But — and this is the catch — they're all running in ONE Pyodide runtime. One interpreter. And critically, WebAssembly here is single-threaded, so it's all one thread too. So when some code deep inside Streamlit asks "what's the current app, what's my working directory?", the answer depends on which logical server's task is running right now. That's a per-task question on a shared thread. Which is exactly the situation contextvars was built for. So far so good. -->

---

# First problem: globals like cwd are *process-wide*

<div mt-2 text-lg>

Streamlit reads the **current working directory** and env vars to resolve files, config, etc. But those are **process-global** in Python:

</div>

```py {*|2|3|4|*}{maxHeight:'200px'}
import os
os.getcwd()              # ← ONE value for the whole interpreter
os.chdir("/app_a")       # ← changes it for EVERYONE
os.environ["HOME"]       # ← same: one process-wide dict
```

<div v-click="3" mt-5 border="~ red/50 rounded-lg" p-4 bg-red:10 text-lg>

Server A does `chdir("/app_a")`, then `await`s. Server B runs, does `chdir("/app_b")`. A resumes — **its cwd is now `/app_b`**. The files it loads are wrong. 💥

</div>

<!-- And here's the first real problem. Streamlit, like a lot of Python code, uses the current working directory and environment variables to find files, load config, resolve paths. But os.getcwd, os.chdir, os.environ — these are process-global. There is exactly ONE current directory for the entire interpreter. When server A changes the directory to app_a's folder and then hits an await, server B wakes up and changes the directory to app_b. When A resumes, the process-wide cwd is now app_b's. So A starts reading B's files. This is the same interleaving bug as before — but now the shared mutable state isn't a thread-local I control, it's a global in the operating-system layer that I don't own. -->

---

# `contextvars` tells us *which* directory — step 1

<div mt-2 text-lg>

Store each task's intended directory in a `ContextVar`. Now any code can ask "which dir *should* be current for this task?"

</div>

```py {*|1|3-6|*}{maxHeight:'250px'}
home_dir_contextvar: ContextVar[str | None] = ContextVar("home_dir", default=None)

@dataclass
class DirectoryConfig:
    cwd: str
    home_dir: str | None
```

<div v-click="3" mt-5 border="~ amber/50 rounded-lg" p-4 bg-amber:10 text-lg>

But knowing the right directory isn't enough. The **actual** `os.getcwd()` is still one global value. We have to **apply** it at the right moments — and **restore** it afterward.

</div>

<div v-click="4" mt-3 text-sm op60>

Source: [stlite-lib/.../server/task_context.py](https://github.com/whitphx/stlite/blob/0ceb3318d6f2d84e6c6e04ef97e8cc4e80bd5994/packages/kernel/py/stlite-lib/stlite_lib/server/task_context.py)

</div>

<!-- So step one is the part contextvars handles cleanly. I put each task's intended directory into a ContextVar — home_dir_contextvar. Now from anywhere in the code, I can ask "for the task that's currently running, which directory is it supposed to be in?" and get the right answer per task, thanks to everything we covered in the mental-model section. But — and this is the crux of the whole talk — knowing the right directory does not change the actual directory. os.getcwd is still one global value shared by everyone. So contextvars solved the "which context am I in" question, and left me with a second, harder question: how do I make the global os-level state actually match the current task's context, and put it back when I'm done? -->

---

# Step 2: apply & restore around every await — the coroutine proxy

<div mt-2 text-lg>

A coroutine runs in **steps**, resuming at each `await`. The trick: wrap the coroutine so it sets the right cwd **before every step** and restores it **after**.

</div>

```py {*|9-11|13-15|*}{maxHeight:'280px'}
class DirectorySyncCoroutineProxy(Coroutine):
    def __init__(self, coro: Coroutine):
        self.iter = coro.__await__()
        home_dir = home_dir_contextvar.get(None)
        self._directory_context = (
            TaskSpecificDirectoryConfig(home_dir) if home_dir else nullcontext()
        )

    def send(self, value):                  # called by the loop to resume
        with self._directory_context:       # 👈 apply cwd/HOME, then restore
            return self.iter.send(value)

    def throw(self, typ, val=None, tb=None):
        with self._directory_context:
            return self.iter.throw(typ, val, tb)
```

<!-- And here's the solution — a transparent coroutine proxy. The key realization is that a coroutine doesn't run all at once. It runs in steps. Every time it hits an await and later resumes, the event loop drives it forward one step by calling send. So I wrap the real coroutine in this proxy. It reads the task's directory from the ContextVar once, up front. Then every time the loop resumes it — every send, every throw — it enters a context manager that applies the right cwd and HOME, runs that one step, and restores the previous values on the way out. So during the actual execution slice, the global os state matches this task's context. When it yields control back at the next await, the state is restored, so it doesn't poison whatever task runs next. -->

---

# The apply/restore context manager

<div mt-1 text-lg>

`TaskSpecificDirectoryConfig` swaps the **process-global** cwd / `HOME` in, then puts the previous values back:

</div>

```py {*|2-5|7-10|12-14|*}{maxHeight:'300px'}
class TaskSpecificDirectoryConfig:
    def __enter__(self):
        current = DirectoryConfig(os.getcwd(), os.environ.get("HOME"))
        self.old_dir_config.append(current)        # remember to restore later
        self._apply_config(self.context_dir_config)  # chdir + set HOME

    def __exit__(self, *excinfo):
        # capture anything the task changed during this step...
        self.context_dir_config = DirectoryConfig(os.getcwd(), os.environ.get("HOME"))
        self._apply_config(self.old_dir_config.pop())  # ...then restore

    def _apply_config(self, config):
        os.chdir(config.cwd)
        os.environ["HOME"] = config.home_dir
```

<div v-click="4" mt-3 op80 text-sm>

Note the symmetry with `contextvars`' own `set` → `reset(token)`: **apply, remember, restore**.

</div>

<!-- This is the context manager doing the actual swap. On enter, it records the current global cwd and HOME so it can put them back, then applies this task's directory — a real os.chdir and a real write to os.environ. On exit, it does something subtle: it re-reads the cwd and HOME first, because the task might have changed directory itself during its step, and we want to preserve that for next time. Then it restores the values it saved on enter. It even uses a list as a stack, mirroring how contextlib.chdir nests. And notice the shape here — apply, remember the old value, restore — it's the exact same pattern as contextvars' own set-returns-a-token-and-you-reset-it. We're basically hand-rolling reset semantics for a global the language doesn't manage for us. -->

---

# Putting it together

<div mt-4 flex="~ col" gap-3>

<div v-click="1" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-sky:20 flex items-center justify-center text-sky font-bold shrink-0>1</div>
<div>Each logical server sets its directory into <code>home_dir_contextvar</code></div>
</div>

<div v-click="2" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-sky:20 flex items-center justify-center text-sky font-bold shrink-0>2</div>
<div><code>contextvars</code> keeps that value <b>per task</b>, even on a shared thread</div>
</div>

<div v-click="3" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-emerald:20 flex items-center justify-center text-emerald font-bold shrink-0>3</div>
<div>The <b>coroutine proxy</b> applies that directory to the <b>global</b> cwd/HOME before each step</div>
</div>

<div v-click="4" flex="~ gap-3" items-center>
<div w-8 h-8 rounded-full bg-emerald:20 flex items-center justify-center text-emerald font-bold shrink-0>4</div>
<div>…and <b>restores</b> it after, so tasks never poison each other</div>
</div>

</div>

<div v-click="5" mt-8 border="~ sky/50 rounded-lg" p-4 bg-sky:10 text-center text-xl>

`contextvars` answers **"which context?"** · the proxy answers **"how do I make a global API obey it?"**

</div>

<!-- Let me zoom back out and put the whole thing together. Step one: each logical server writes its directory into the context variable. Step two: contextvars keeps that value separate per task, even though they're all on one thread — that's the part the standard library gives us for free. Step three: the coroutine proxy takes that per-task value and applies it to the actual global cwd and HOME right before each execution step. Step four: it restores them after, so no task ever leaks its directory into another. The clean split is in the box: contextvars answers "which context am I in," and the proxy answers the question contextvars can't — "how do I force a stubborn global API to actually obey that context." Two different jobs. -->

---
layout: section
---

# ⚠️ Pitfalls & design lessons

<!-- So what did all this teach me? Let me pull out the lessons that generalize beyond Stlite, because most of you won't build an in-browser runtime, but you will hit these edges. -->

---

# Pitfalls to keep in mind

<div mt-4 text-lg>

<v-clicks>

- 📸 **Context is copied at task creation** — set values *before* `create_task`, or the task won't see them.
- 🧵 **Thread boundaries don't carry context for free** — `run_in_executor` / new threads need explicit propagation.
- 🔌 **Sync ↔ async boundaries can surprise you** — library code that hops threads may lose your `ContextVar`.
- 🌍 **`contextvars` does *not* make global side effects safe** — cwd, env vars, signal handlers stay process-wide.

</v-clicks>

</div>

<!-- Four pitfalls. First, the timing one we saw — context is copied at task creation, so if you set a value after you've already spawned the task, the task never sees it. Set first, then spawn. Second, threads. contextvars flows across awaits within a thread, but it does NOT automatically cross into a thread pool. If you use run_in_executor or spin up your own thread, you have to propagate the context yourself. Third, and related, sync-to-async boundaries — if some library hops you onto another thread under the hood, your context variable can quietly vanish. And fourth, the big one, the whole reason for the Stlite story — contextvars does not make global side effects safe. The current directory, environment variables, signal handlers — those stay process-wide no matter how perfect your context handling is. -->

---

# The core design lesson

<div mt-8 text-2xl leading-relaxed>

<v-clicks>

`contextvars` models **logical execution context** —<br>
"which request / task / app am I serving right now?"

</v-clicks>

</div>

<div v-click="2" mt-10 text-2xl leading-relaxed>

But when the underlying API is **process-global**,<br>
you must still **wrap, apply, and restore** it yourself.

</div>

<div v-click="3" mt-10 text-center text-xl op80>

Knowing the context ≠ the context being enforced.

</div>

<!-- If you take one idea home, it's this. contextvars is excellent at modeling logical execution context — answering "which request, which task, which app am I serving right now," correctly, per task, even on a shared thread. But the moment the thing you actually need to control is a process-global API, contextvars stops at telling you the answer. Enforcing it — making the global state match — is on you. You wrap the API, apply the right value, and restore it. Knowing the context is not the same as the context being enforced. That gap is where the real engineering lives, and it's the gap people miss when they assume contextvars is a silver bullet. -->

---

# Key takeaways

<div mt-6 text-xl>

<v-clicks>

- 🧩 "Current" state is everywhere, and **async breaks** the thread-local assumption.
- 🧠 `contextvars` gives **per-task** state: `ContextVar` + auto-copied `Context` + `Token` reset.
- 🛠️ Great for **ambient** concerns — logging, tracing, request scope — not for core parameters.
- 🔬 Stlite shows the boundary: `contextvars` says *which* directory; a **coroutine proxy** makes the global cwd obey.
- ⚠️ `contextvars` is a **language-level tool for modeling context** — not a fix for global side effects.

</v-clicks>

</div>

<div v-click="6" mt-6 text-center text-lg op80>

Especially valuable when you build **frameworks, runtimes, and async libraries**.

</div>

<!-- Let me wrap up. Current state is everywhere, and going async breaks the old one-thread-per-request assumption we used to rely on. contextvars fixes that by giving you genuinely per-task state, with the auto-copying context and token-based reset. It's the right tool for ambient concerns — logging, tracing, request scope — and the wrong tool for things that should just be function arguments. Stlite shows exactly where its boundary is: contextvars tells you which directory, but you need a coroutine proxy to make the global cwd actually obey. And the headline — contextvars is a language-level tool for modeling logical context, not a magic fix for global side effects. It shines brightest when you're building frameworks, runtimes, and async libraries, where this stuff is unavoidable. -->

---

# References & links

<div mt-6 text-lg>

<div flex="~ col" gap-3>

<div flex="~ gap-2" items-center>
<div i-ri-file-text-line text-2xl op50 />
<div><a href="https://peps.python.org/pep-0567/" target="_blank">PEP 567</a> — Context Variables</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-book-2-line text-2xl op50 />
<div><a href="https://docs.python.org/3/library/contextvars.html" target="_blank">docs.python.org</a> — <code>contextvars</code> module reference</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-github-line text-2xl op50 />
<div><a href="https://github.com/whitphx/stlite" target="_blank">whitphx/stlite</a> — the runtime used as the case study</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-code-s-slash-line text-2xl op50 />
<div><a href="https://github.com/whitphx/stlite/blob/0ceb3318d6f2d84e6c6e04ef97e8cc4e80bd5994/packages/kernel/py/stlite-lib/stlite_lib/server/task_context.py" target="_blank">task_context.py</a> — the actual <code>ContextVar</code> + coroutine proxy code</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-article-line text-2xl op50 />
<div><a href="https://www.whitphx.info/posts/20221104-streamlit-wasm-stlite/" target="_blank">Streamlit meets WebAssembly — stlite</a> — background on the project</div>
</div>

</div>

</div>

<!-- Here are the links. PEP 567 and the official docs if you want the precise semantics. The Stlite repo, and the actual task_context.py file with the exact code I walked through — it's all open, go read it. And a blog post if you want the bigger picture on Stlite itself. -->

---

<h1>Thank you! 🙏</h1>

<div mt-10 text-2xl>
Questions welcome — let's talk about your "current" state.
</div>

<div mt-8 w-min flex="~ gap-1" items-center justify-center>
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

<!-- And that's it. Thanks so much for listening. I'd love to hear how you handle current state in your own systems, so please come find me, and I'm happy to take questions now. Thank you! -->
