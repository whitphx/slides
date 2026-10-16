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
  - qrcode
  - slidev-addon-review-annotations
---

<h1 text-5xl leading-14 mt-44>
The hidden current context
</h1>

<div text-3xl op80 leading-10 mt-3 text-center>
Understanding <code>contextvars</code> through<br>real-world runtime problems
</div>

<div mt-6 text-xl op80>
Yuichi · @whitphx
</div>

<div absolute bottom-8 right-10 text-sm op60>
PyCon TW 2026
</div>

<div absolute top-17 right-10 flex="~ col" items-center gap-2>
<div class="qr-box" w-36 h-36>
<QRCode :width="185" :height="185" type="svg" data="https://slides.whitphx.info/202610-pycontw-contextvars/"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
</div>
</div>

<style>
/* qr-code-styling floors the dot size to a whole pixel, so a width that is not
   an exact multiple of the module count leaves the drawn code smaller than the
   box it sits in. Feed it an exact multiple, then scale the SVG to the size we
   actually want. */
.qr-box :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

<!--
Hi everyone, thanks for coming.

The title of this talk is "The hidden current context", and it's about the contextvars module in the standard library.

The slides are behind that QR code if you want to follow along.
-->

---

<h1>Yuichi</h1>

@whitphx

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div class="portfolio" w-130 mt-6 v-click="1">

- <span class="heading">Created</span>: <span class="item"><img src="/portfolio/awesome_emacs_keymap.svg">Awesome Emacs Keymap</span>, <span class="item"><img src="/portfolio/stlite.png">Stlite: In-browser Streamlit</span>, <span class="item">🎈 Streamlit-WebRTC</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio-Lite: Serverless Gradio</span>, <span class="item">🤗 Transformers.js.py</span>
- <span class="heading">Contributed to</span>: <span class="item"><img src="/portfolio/streamlit-mark-color.svg" style="height: 0.8em;">Streamlit</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio</span>
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🌏APAC, 🇪🇺Euro, 🇹🇼TW, 🇰🇷KR, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT</span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item">🐍SciPyData2026</span>

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
    line-height: 1.8rem;
  }
  /* Inline rather than inline-flex: a line may break before an inline-flex box, which
     put the comma after an item at the start of the next line. nowrap keeps each item whole. */
  .item {
    font-weight: 300;
    white-space: nowrap;

    img {
      display: inline;
      height: 1.0em;
      margin-right: 0.25em;
      vertical-align: -0.125em;
    }
  }
</style>

<!--
I'm Yuichi, whitphx online.

[click]
I build and maintain open source projects in the Python ecosystem.
The one that matters for today is Stlite, which is Streamlit running entirely in the browser.

[click]
And you can find me in all the usual places.
-->

---

# What you'll learn today

<div mt-10 text-6>

<v-clicks>

- 🎯 **What `contextvars` actually solves** — and when `threading.local()` stops being enough
- 🔀 **How a value travels** — across `await`, across tasks, across threads
- 🧱 **Where its limits are** — `contextvars` answers *which* context, not *is it safe*

</v-clicks>

</div>

<!--
Here are three things you'll learn today.

[click]
First, what problem the `contextvars` module solves.

[click]
Second, how a value stored with `contextvars` moves through your program: across an await, into a new task, into another thread.

[click]
And third, where `contextvars` stops helping. I found that limit in a real project, and that's the second half of the talk.
-->

---
layout: section
---

# 🧩 The invisible arguments

<div mt-4 op70 text-5>
Every layer reads them. Nobody hands them over.
</div>

<!--
Let's start with the problem that the `contextvars` module is going to solve.
-->

---
plainBackground: true
---

# A route function you've written a hundred times

<div mt-6 grid="~ cols-[1.25fr_1fr]" gap-8 items-stretch>

<div class="toy-code">

```py {*|8|7|*}{'data-id':'toy'}
from flask import Flask
from flask_login import current_user

app = Flask(__name__)

@app.route("/")
def index():
    return f"Hello, {current_user.name}!"
```

</div>

<div flex="~ col" gap-3 text-5 self-end>
<div v-click="2" data-id="toy-args" border="~ rose/50 rounded-lg" p-3 bg-rose:5>🚫 <b>no arguments</b></div>
<div v-click="1" data-id="toy-user" border="~ sky/50 rounded-lg" p-3 bg-sky:5>👤 <b>current user</b></div>
</div>

</div>

<FancyArrow v-click="1" from="[data-id=toy-user] @ left" to="[data-id=toy] .line:nth-child(8) @ right" arc="0" />
<FancyArrow v-click="2" from="[data-id=toy-args] @ left" to="[data-id=toy] .line:nth-child(7) @ right" arc="0" color="red" />

<div v-click="3" mt-8 text-5 text-center>

The **user** is not an argument. So where does it come from? 👻

</div>

<style>
.toy-code {
  --slidev-code-font-size: 20px;
  --slidev-code-line-height: 1.6;
}
</style>

<!--
Here's a piece of code you've probably written many times. A Flask app with one page that says hello to whoever is logged in.

[click]
`current_user` is the user who sent this request. Flask-Login works it out for us.

[click]
But the `index` function takes no arguments. Nobody passes the user in.

[click]
So the current user is just there when the function runs. How does Python manage a value like this?
-->

---
plainBackground: true
---

# The setting: one thread per request

<div mt-4 grid="~ cols-2 rows-[auto_1fr_auto]" gap-x-10 gap-y-2>

<div text-5 text-center><b>thread-per-request</b> 🧵</div>
<div></div>

<div border="~ gray/40 rounded-lg" p-2>
<div text-4 op60 mb-1>one process</div>
<div class="row-offset"></div>
<div flex="~ col" gap-1>
<div border="~ emerald/50 rounded" p-1 bg-emerald:5>
<div text-4 mb-1><b>Thread 1</b></div>
<div border="~ emerald/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>alice's request</div>
</div>
<div border="~ emerald/50 rounded" p-1 bg-emerald:5>
<div text-4 mb-1><b>Thread 2</b></div>
<div border="~ emerald/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>bob's request</div>
</div>
<div border="~ emerald/50 rounded" p-1 bg-emerald:5>
<div text-4 mb-1><b>Thread 3</b></div>
<div border="~ emerald/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>carol's request</div>
</div>
</div>
</div>

<div></div>

<div v-click="1" text-4 text-center op80>one thread = one request ✅</div>
<div></div>

</div>

<style>
.row-offset { height: 67px; }
</style>

<!--
To answer that, we first need to look at the server this code runs on.

It's a classic web server. One process, a pool of threads, and each request is handled by its own thread, from start to finish.

[click]
So while alice's request is being handled, Thread 1 belongs to alice. One thread, one request.
-->

---

# The sync answer

<div text-4 op70 mb-2>🧵 on the thread-per-request server · <b>simplified</b>: what Flask does for you inside the library</div>

<div grid="~ cols-[1.15fr_1fr]" gap-6 items-start>

```py {*|1|3-6|8-10|12-14|*}
_local = threading.local()

# Flask: runs on the request's own thread
def handle(request):
    _local.user = request.user
    index()

# Flask-Login
def current_user():
    return _local.user

# your code
def index():
    print(f"Hello, {current_user()}!")
```

<div>

<div v-click="5" text-5>

Per-thread storage **is** per-request storage here. ✅

</div>

<div v-click="5" mt-6 text-4 op70 border="~ gray/30 rounded-lg" p-3>

📎 **The real code (Flask 1.x)**

- Werkzeug's <a href="https://github.com/pallets/werkzeug/blob/1.0.1/src/werkzeug/local.py#L52-L80" target="_blank"><code>Local</code></a> keeps one storage per thread id
- Flask-Login puts the user <a href="https://github.com/maxcountryman/flask-login/blob/0.5.0/flask_login/utils.py#L344-L348" target="_blank">on the request context</a> stored there

</div>

</div>

</div>

<!--
So how does `current_user` work on that server? Here is some pseudo code for what Flask and Flask-Login do inside.

[click]
The user changes from request to request, so a plain global won't work. The answer is threading dot local: one value per thread.

[click]
At the start of each request, in each thread, Flask stores the user, then calls your route function.

[click]
The `current_user` function is the Flask-Login part. It reads the user back, for the current thread.

[click]
And the route function still takes no arguments, but it gets the user for this request, because it reads the value for the current thread.

[click]
On this server, that's exactly right. One thread per request means one value per request. This is not bad code. It's roughly what Flask did in version one.
-->

---

# Python is full of "current"

<div mt-8 grid="~ cols-2" gap-4 text-5>

<div v-click="1" border="~ sky/40 rounded-lg" p-4 bg-sky:5>🌐 <b>current request</b><br><span op70 text-4>what was asked</span></div>
<div v-click="2" border="~ sky/40 rounded-lg" p-4 bg-sky:5>👤 <b>current user</b><br><span op70 text-4>on whose behalf</span></div>
<div v-click="3" border="~ sky/40 rounded-lg" p-4 bg-sky:5>💾 <b>current transaction</b><br><span op70 text-4>which session commits</span></div>
<div v-click="4" border="~ sky/40 rounded-lg" p-4 bg-sky:5>⚙️ <b>current runtime</b><br><span op70 text-4>which app is running</span></div>

</div>

<div v-click="5" mt-8 text-5 text-center>

None of these are **passed as arguments**. 👻

</div>

<!--
The current user is only one example. There are many cases where Python code reads a value that was never passed to it as an argument.

[click]
The current request.

[click]
The current user, our example.

[click]
The current database transaction. SQLAlchemy's `scoped_session` keeps one session per thread by default.

[click]
The current runtime: which app is running, in a system that runs more than one app runtime.

[click]
No caller passes these in. Every layer just reads them when it needs them. And on a thread-per-request server, threading dot local is the classic tool for that.
-->

---
plainBackground: true
---

# Then we went async

<div mt-4 grid="~ cols-2 rows-[auto_1fr_auto]" gap-x-10 gap-y-2>

<div text-5 text-center><b>thread-per-request</b> 🧵</div>
<div v-click="1" text-5 text-center><b>one event loop</b> ⚡</div>

<div border="~ gray/40 rounded-lg" p-2>
<div text-4 op60 mb-1>one process</div>
<div class="row-offset"></div>
<div flex="~ col" gap-1>
<div data-id="t1" border="~ emerald/50 rounded" p-1 bg-emerald:5>
<div text-4 mb-1><b>Thread 1</b></div>
<div border="~ emerald/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>alice's request</div>
</div>
<div data-id="t2" border="~ emerald/50 rounded" p-1 bg-emerald:5>
<div text-4 mb-1><b>Thread 2</b></div>
<div border="~ emerald/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>bob's request</div>
</div>
<div data-id="t3" border="~ emerald/50 rounded" p-1 bg-emerald:5>
<div text-4 mb-1><b>Thread 3</b></div>
<div border="~ emerald/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>carol's request</div>
</div>
</div>
</div>

<div v-click="1" border="~ gray/40 rounded-lg" p-2>
<div text-4 op60 mb-1>one process</div>
<div border="~ emerald/50 rounded" p-1 bg-emerald:5>
<div text-4 mb-1><b>Thread 1</b></div>
<div border="~ rose/50 rounded" p-1 bg-rose:5>
<div text-4 mb-1><b>⚡ Event loop</b></div>
<div flex="~ col" gap-1>
<div data-id="k1" border="~ violet/50 rounded" p-1 bg-violet:5>
<div text-4 mb-1><b>Task 1</b></div>
<div border="~ violet/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>alice's request</div>
</div>
<div data-id="k2" border="~ violet/50 rounded" p-1 bg-violet:5>
<div text-4 mb-1><b>Task 2</b></div>
<div border="~ violet/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>bob's request</div>
</div>
<div data-id="k3" border="~ violet/50 rounded" p-1 bg-violet:5>
<div text-4 mb-1><b>Task 3</b></div>
<div border="~ violet/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>carol's request</div>
</div>
</div>
</div>
</div>
</div>

<div text-4 text-center op80>one thread = one request ✅</div>
<div v-click="2" text-4 text-center op80>one thread = <b>many</b> requests ❓</div>

</div>

<div v-click="3" mt-2 text-center text-5>

In async code, `threading.local()` **no longer means per-request**. 💥

</div>

<style>
.row-offset { height: 67px; }
</style>

<!--
This is the thread-per-request server our code was written for. One thread per request, so per-thread storage is per-request storage.

[click]
On the right is an async server, built on asyncio. Still one process, but only one thread, running an event loop. Each request runs in its own task, and the event loop switches between tasks at every await.

[click]
So one thread now serves many requests at once.

[click]
And that's the problem. threading dot local still gives one value per thread. But one thread is now many requests, so per-thread no longer means per-request.

Flask on its threaded server is the picture on the left. FastAPI or Starlette with `async def` handlers is the picture on the right.

Before we fix it, let's be precise about that new word: task.
-->

---
plainBackground: true
---

# What is a task?

<div mt-2 grid="~ cols-[1.4fr_1fr]" gap-8 items-start>

<div text-4.5>

<ul>
<li v-click="1">🙋 <b>Someone starts it</b> — <code>create_task()</code>, <code>gather()</code>, the server</li>
<li v-click="4">📦 <b>It runs one coroutine</b> — the caller doesn't wait</li>
<li v-click="5">🔁 <b>The event loop runs them all</b> — one thread, switching at every <code>await</code></li>
</ul>

<div v-click="1" mt-3 class="task-code">

```py {*|1-3|6|7|*}{at:2}
async def greet(name):
    await asyncio.sleep(1)
    print(f"Hello, {name}!")

async def main():
    task = asyncio.create_task(greet("alice"))
    print("main() carries on")
    await task
```

</div>

</div>

<div v-click="5" border="~ emerald/50 rounded" p-1 bg-emerald:5>
<div text-4 mb-1><b>Thread 1</b></div>
<div border="~ rose/50 rounded" p-1 bg-rose:5>
<div text-4 mb-1><b>⚡ Event loop</b></div>
<div flex="~ col" gap-1>
<div data-id="k1" border="~ violet/50 rounded" p-1 bg-violet:5>
<div text-4 mb-1><b>Task 1</b></div>
<div border="~ violet/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>alice's request</div>
</div>
<div data-id="k2" border="~ violet/50 rounded" p-1 bg-violet:5>
<div text-4 mb-1><b>Task 2</b></div>
<div border="~ violet/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>bob's request</div>
</div>
<div data-id="k3" border="~ violet/50 rounded" p-1 bg-violet:5>
<div text-4 mb-1><b>Task 3</b></div>
<div border="~ violet/40 rounded" px-2 bg-white dark:bg-black text-4 text-center>carol's request</div>
</div>
</div>
</div>
</div>

</div>

<div v-click="6" mt-4 text-5 text-center>

Three requests, three tasks, **one thread** — taking turns. 🔁

</div>

<style>
.task-code {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.4;
}
</style>

<!--
So what is a task? The rest of the talk depends on this word.

[click]
Something has to start a task. Let's look at a small example.

[click]
`greet` is an `async def` function, so calling it gives you a coroutine: a function call that can pause at each `await`.

[click]
We pass that coroutine to `asyncio.create_task()`, and that starts a task. In a web app, the server does this for you. Uvicorn, for example, starts one task per request.

[click]
Each task runs one coroutine. `create_task()` doesn't wait for it, so the `main` function prints its line right away.

[click]
The event loop runs all the tasks on one thread. It switches between them when the running coroutine reaches an `await`.

[click]
So: three requests, three tasks, one thread, taking turns. And taking turns is exactly what breaks our example.
-->

---

# Watch `threading.local()` break

<div text-4 op70 mb-2>⚡ on an async server · <b>simplified</b>: how an async web framework works, not production code</div>

<div grid="~ cols-[1.3fr_1fr]" gap-5>

<div class="tl-code">

```py {*|7-9|3-5|12|8|4|8|4|5|*}
_local = threading.local()

async def index():  # your code
    await asyncio.sleep(0.01)
    return f"Hello, {_local.user}!"

async def handle(user):  # the framework
    _local.user = user
    print(f"{user} sees: {await index()}")

# the server: one task per request
await asyncio.gather(handle("alice"), handle("bob"))
```

</div>

<div>

<div v-click="9">

<WindowMockup title="Terminal" dark codeblock>

```shell
alice sees: Hello, bob!
bob sees: Hello, bob!
```

</WindowMockup>

</div>

</div>

</div>

<div v-click="3" mt-2 text-4 class="tl">
<div class="tl-label">🙋 <code>gather()</code><br><span op70>two tasks, one thread</span></div>
<div class="tl-row tl-lane tl-lane-a">
<div class="tl-name">alice's task</div>
<div v-click="4" class="tl-a">set <code>"alice"</code></div>
<div v-click="5" class="tl-a">⏸️ await</div>
<div></div><div></div>
<div v-click="8" class="tl-a">read → <code>"bob"</code> ❌</div>
</div>
<div class="tl-row tl-lane tl-lane-b">
<div class="tl-name">bob's task</div>
<div></div><div></div>
<div v-click="6" class="tl-b">set <code>"bob"</code></div>
<div v-click="7" class="tl-b">⏸️ await</div>
<div></div>
</div>
<div class="tl-row">
<div class="tl-name"><code>_local.user</code></div>
<div v-click="4" class="tl-v">alice</div>
<div v-click="5" class="tl-v">alice</div>
<div v-click="6" class="tl-v tl-bad">bob</div>
<div v-click="7" class="tl-v tl-bad">bob</div>
<div v-click="8" class="tl-v tl-bad">bob</div>
</div>
<div class="tl-row tl-axis-row">
<div class="tl-name tl-axis-label">time</div>
<div class="tl-axis"></div>
</div>
</div>

<style>
.tl { position: relative; border: 1px solid rgb(139 92 246 / 0.5); border-radius: 0.5rem; padding: 0.25rem 0.75rem; background: rgb(139 92 246 / 0.05); display: grid; grid-template-columns: 9rem 1fr; column-gap: 0.75rem; }
.tl-label { grid-row: span 4; align-self: center; line-height: 1.3; }
.tl-axis-row { margin-top: 0.1rem; }
.tl-axis-label { text-align: right; font-weight: 700; opacity: 0.8; }
.tl-axis { grid-column: 2 / span 5; position: relative; height: 0; border-top: 2px solid currentColor; opacity: 0.7; margin-right: 10px; }
.tl-axis::after { content: ''; position: absolute; right: -10px; top: -7px; border-left: 12px solid currentColor; border-top: 6px solid transparent; border-bottom: 6px solid transparent; }
.tl-row { display: grid; grid-template-columns: 7.5rem minmax(0, 1.45fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 2fr); gap: 0.4rem; align-items: center; margin: 0.1rem 0; padding: 0 0.3rem; border: solid transparent; border-width: 0 1.5px; }
.tl-name { opacity: 0.75; }
.tl-lane { border-radius: 0.4rem; padding: 0 0.3rem; background-image: linear-gradient(to right, transparent 7.5rem, rgb(128 128 128 / 0.6) 7.5rem); background-size: 100% 2px; background-repeat: no-repeat; background-position: 0 50%; }
.tl-lane .tl-name { opacity: 1; font-weight: 700; }
.tl-lane-a { border: 1.5px solid rgb(14 165 233 / 0.6); background-color: rgb(14 165 233 / 0.08); color: inherit; }
.tl-lane-b { border: 1.5px solid rgb(16 185 129 / 0.6); background-color: rgb(16 185 129 / 0.08); }
.tl-lane .tl-a, .tl-lane .tl-b { position: relative; }
.tl-lane-a .tl-a { background: rgb(186 230 253); }
.tl-lane-b .tl-b { background: rgb(167 243 208); }
html.dark .tl-lane-a .tl-a { background: rgb(7 89 133); }
html.dark .tl-lane-b .tl-b { background: rgb(6 95 70); }
.tl-a, .tl-b, .tl-v { border-radius: 0.25rem; padding: 0 0.25rem; text-align: center; white-space: nowrap; min-width: 0; }
.tl-a { background: rgb(14 165 233 / 0.18); }
.tl-b { background: rgb(16 185 129 / 0.2); }
.tl-v { font-family: var(--slidev-code-font-family, monospace); border: 1px solid rgb(128 128 128 / 0.45); }
.tl-bad { border-color: rgb(244 63 94 / 0.7); color: rgb(225 29 72); }
.tl-time { grid-column: 2; text-align: right; opacity: 0.6; }
.tl-code { --slidev-code-font-size: 14px; --slidev-code-line-height: 1.4; }
</style>

<!--
Here's the same app, made async. Again, this is a simplified version of what an async framework does.

[click]
The `handle` function plays the framework. It stores the user in `_local.user` and calls the route function.

[click]
The `index` function reads the user back. It still takes no arguments.

[click]
The last line plays the server. `asyncio.gather()` runs alice's and bob's requests as two tasks on the same thread. The timeline at the bottom follows them.

[click]
Alice's task runs first and stores "alice".

[click]
Then it hits the await and waits, so the event loop runs bob's task.

[click]
Bob's task stores "bob" in the same slot, because both tasks are on the same thread.

[click]
Then bob's task also waits.

[click]
Alice's task resumes and reads the slot. It gets "bob".

[click]
So alice is greeted as bob. In a real service, that's alice seeing bob's page. That's a data leak.
-->

---
layout: section
---

# 🧠 Following the `await`

<div mt-4 op70 text-5>
State that belongs to the execution, not to the thread
</div>

<!--
So we need storage that follows the logical execution instead of the thread.

By logical execution, I mean the code that runs for one request, from start to finish. On the async server, that's one task. It pauses at each `await`, other tasks run, and later it picks up where it left off.

We want a value that goes with that task across every `await`. That's what the `contextvars` module gives us.
-->

---

# `ContextVar`: declare, set, get

```py {*|3-5|7|8}{'data-id':'cv'}{maxHeight:'300px'}
from contextvars import ContextVar

user_var = ContextVar(
    "user", default="anonymous"
)

user_var.set("alice")
user_var.get()  # "alice"
```

<div v-click="2">
<div data-id="ann-set" absolute top-36 right-8 w-88 bg-white dark:bg-black p-3 rounded border="~ sky/50 rounded-lg" text-4>

binds a value in the **current context** — not globally, not per-thread

</div>
<FancyArrow from="[data-id=ann-set] @ left" to="[data-id=cv] .line:nth-child(7) @ right" arc="-0.2" />
</div>

<div v-click="4" mt-6 text-5>

Declared **once**, at module level. Read from **anywhere**, at any depth. 🪄

</div>

<!--
A `ContextVar` is like threading dot local, except the value follows the logical execution, not the thread.

The API has three parts.

[click]
You declare it once, at module level. The default is what you get when nothing has been set.

[click]
You set it. This binds the value in the current context. We'll see what "current context" means in a moment.

[click]
And you get it back.

[click]
Same shape as threading dot local: declare in one place, read from anywhere. Only what it's attached to changes.
-->

---

# Same program, correct answer

````md magic-move {at:1}

```py
_local = threading.local()

async def index():
    await asyncio.sleep(0.01)
    return f"Hello, {_local.user}!"

async def handle(user):
    _local.user = user
    print(f"{user} sees: {await index()}")
```

```py
user_var = ContextVar("user", default="anonymous")

async def index():
    await asyncio.sleep(0.01)
    return f"Hello, {user_var.get()}!"

async def handle(user):
    user_var.set(user)
    print(f"{user} sees: {await index()}")
```

````

<div v-click="1">
<div data-id="mm-decl" absolute style="left:612px;top:113px;width:1px;height:1px"></div>
<div data-id="mm-get" absolute style="left:488px;top:185px;width:1px;height:1px"></div>
<div data-id="mm-set" absolute style="left:316px;top:239px;width:1px;height:1px"></div>
<div data-id="mm-ann-decl" absolute style="left:700px;top:102px;width:200px" class="mm-ann">declare: <b><code>ContextVar</code></b></div>
<div data-id="mm-ann-get" absolute style="left:700px;top:172px;width:200px" class="mm-ann">read: <b><code>.get()</code></b></div>
<div data-id="mm-ann-set" absolute style="left:700px;top:229px;width:200px" class="mm-ann">write: <b><code>.set()</code></b></div>
<FancyArrow from="[data-id=mm-ann-decl] @ left" to="[data-id=mm-decl]" arc="0" />
<FancyArrow from="[data-id=mm-ann-get] @ left" to="[data-id=mm-get]" arc="0" />
<FancyArrow from="[data-id=mm-ann-set] @ left" to="[data-id=mm-set]" arc="0" />
</div>

<style>
.mm-ann { background: var(--slidev-theme-background, white); border: 1px solid rgb(14 165 233 / 0.5); border-radius: 0.5rem; padding: 0.15rem 0.5rem; font-size: 1rem; }
html.dark .mm-ann { background: black; }
</style>

<div mt-6 grid="~ cols-2" gap-6>

<div>
<div text-4 op70 mb-2>before</div>
<WindowMockup title="Terminal" dark codeblock>

```shell
alice sees: Hello, bob!
bob sees: Hello, bob!
```

</WindowMockup>
</div>

<div v-click="2">
<div text-4 op70 mb-2>after</div>
<WindowMockup title="Terminal" dark codeblock>

```shell
alice sees: Hello, alice!
bob sees: Hello, bob!
```

</WindowMockup>
</div>

</div>

<!--
So here's the same program again.

[click]
Three lines change. The `threading.local()` object becomes a `ContextVar`, and reads and writes become `get()` and `set()`.

[click]
Now each task reads back its own value across the await. Same order, same single thread, right answer.

Next, let's see how it works inside, because that tells you where it stops working.
-->

---
plainBackground: true
---

# `Context`: what a task carries

<div mt-4 grid="~ cols-[1fr_1.05fr]" gap-8>

<div flex="~ col" gap-4>

<div border="~ sky/50 rounded-lg" p-4 bg-sky:5>

<div text-4 op70 mb-3>a <code>Context</code>: each <code>ContextVar</code> → its value</div>

<div flex="~ col" gap-2 text-4>
<div><code>user_var</code> <span op50>→</span> <b>"alice"</b></div>
<div><code>locale_var</code> <span op50>→</span> <b>"zh-TW"</b></div>
<div><code>db_session_var</code> <span op50>→</span> <b>&lt;Session&gt;</b></div>
</div>

<div v-click="2" mt-3 border="~ violet/50 rounded" p-2 bg-violet:5 text-4 text-center>
<code>handler()</code> runs <b>in here</b>
</div>

</div>

<div v-click="2" data-id="handler-def" bg-white dark:bg-black border="~ violet/50 rounded-lg" p-2>

```py
def handler():
    print(user_var.get())  # "alice"
```

</div>

</div>

<div v-click="1" data-id="ctxcode">

````md magic-move {at:2}

```py
from contextvars import copy_context

ctx = copy_context()
```

```py
from contextvars import copy_context

ctx = copy_context()

ctx.run(handler)
```

```py
from contextvars import copy_context

ctx = copy_context()

ctx.run(handler)

ctx[user_var]  # "alice"
```

````

</div>

</div>

<div data-id="ctx-run-line" absolute style="left:643px;top:209px;width:1px;height:1px"></div>
<FancyArrow v-click="[2,3]" from="[data-id=handler-def] @ right" to="[data-id=ctx-run-line]" arc="-0.3" />

<div v-click="4" absolute bottom-10 inset-x-0 text-center text-5>

`set()` and `get()` always use **the `Context` you are running in**. 🎯

</div>

<!--
The next piece is the `Context` itself. Picture it as a dictionary: every context variable, mapped to its current value.

[click]
There is always a current context, even if you never created one. `copy_context()` takes a snapshot of it.

[click]
And you can run a function inside that snapshot. While `handler` runs inside `ctx`, every `get()` sees the snapshot's values.

[click]
You can also read a variable straight out of the snapshot, like a dictionary lookup.

[click]
So "the current context" means a mapping like this one. `set()` writes into it, and `get()` reads from it.

Which leaves one question. When a new task starts, where does its context come from?
-->

---
plainBackground: true
---

# The rule behind most surprises

<div mt-2 grid="~ cols-[1fr_1fr]" gap-6 items-stretch>

<div class="rule-code">

```py {'data-id':'rulecode'}
user_var = ContextVar("user", default="anonymous")

async def index():
    await asyncio.sleep(0.01)
    return f"Hello, {user_var.get()}!"

async def handle(user):
    user_var.set(user)
    print(f"{user} sees: {await index()}")

await asyncio.gather(handle("alice"), handle("bob"))
```

</div>

<div flex="~ col" items-center gap-1 h-full justify-end>

<div v-click="3" grid="~ cols-2" gap-2 w-full>
<div data-id="child-a" border="~ violet/50 rounded-lg" px-2 py-2 bg-violet:5>
<div text-4 op70><b>alice's</b> task</div>
<div text-4 whitespace-nowrap><code>user_var</code> = <b>"alice"</b></div>
</div>
<div data-id="child-b" border="~ violet/50 rounded-lg" px-2 py-2 bg-violet:5>
<div text-4 op70><b>bob's</b> task</div>
<div text-4 whitespace-nowrap><code>user_var</code> = <b>"bob"</b></div>
</div>
</div>

<div v-click="2" text-center op80 text-4 py-1>⬆️ <code>gather()</code>: one task each, each gets a <b>copy</b></div>

<div v-click="1" data-id="parent" border="~ sky/50 rounded-lg" px-3 py-1 bg-sky:5 w-full>
<div text-4><span op70>the <b>caller's</b> context:</span> <code>user_var</code> = <b>not set</b></div>
</div>

</div>

</div>

<FancyArrow v-click="1" from="[data-id=parent] @ left" to="[data-id=rulecode] .line:nth-child(11) @ right" arc="0" />
<FancyArrow v-click="3" from="[data-id=child-a] @ left" to="[data-id=rulecode] .line:nth-child(8) @ right" arc="0.1" />

<div v-click="4" mt-4 text-5 border="~ emerald/40 rounded-lg" p-3 bg-emerald:5 text-center>
✅ the task <b>inherits</b> what you set before it started
</div>

<style>
.rule-code { --slidev-code-font-size: 14px; --slidev-code-line-height: 1.5; }
</style>

<!--
One rule connects tasks and contexts.

Here's our fixed example again. At the top, `user_var` is declared as a context variable, with the default "anonymous".

[click]
The last line calls `gather()`. At that moment, the caller's context has no user set.

[click]
`gather()` turns each `handle` coroutine into a task, one per request. Each new task gets a copy of the caller's context.

[click]
Then each task sets the user in its own copy of the context: "alice" in one, "bob" in the other.

[click]
So a task starts with everything the caller had set.
-->

---
hide: true
---

# The copy is made at `create_task()`

<div mt-4 grid="~ cols-[1fr_1fr]" gap-6 items-start>

<div class="spawn-code">

```py {*|4|5|6|2|*}
async def worker():
    print(user_var.get())

task = asyncio.create_task(worker())
user_var.set("alice")
await task
```

<div v-click="4" mt-3>

<WindowMockup title="Terminal" dark codeblock>

```shell
anonymous
```

</WindowMockup>

</div>

</div>

<div flex="~ col" gap-3 text-4>

<div v-click="1" border="~ violet/50 rounded-lg" p-3 bg-violet:5>
📸 <code>create_task()</code>: the copy is made <b>now</b><br>
<span op70><code>worker()</code> has <b>not started</b> yet · copy: <code>"anonymous"</code></span>
</div>

<div v-click="2" border="~ sky/50 rounded-lg" p-3 bg-sky:5>
✏️ <code>set("alice")</code>: changes <b>only the caller's</b> context<br>
<span op70>the task's copy stays <code>"anonymous"</code></span>
</div>

<div v-click="3" border="~ emerald/50 rounded-lg" p-3 bg-emerald:5>
▶️ <code>await task</code>: <code>worker()</code> <b>starts running</b> only now<br>
<span op70>it reads its own copy</span>
</div>

</div>

</div>

<div v-click="5" mt-4 text-5 text-center>

Copied when the task is **created**, not when it **starts running**. Set first, then create. 📸

</div>

<style>
.spawn-code { --slidev-code-font-size: 16px; }
</style>

<!--
Because the task gets a copy, one detail matters: when exactly is the copy made? You might guess: when the task starts running. It's not. Here's a small example.

[click]
We create the task. `create_task()` does not run `worker()` yet. It only schedules it, so the worker hasn't started. But the copy of the context is made right here, on this line. At this moment `user_var` is not set, so the copy holds the default, "anonymous".

[click]
Then we set the value, on the next line. The worker still hasn't started. But this `set()` changes only our own context. The task already has its copy, and the copy does not change.

[click]
Now we await the task. This is the first chance the event loop gets to run it. So `worker()` starts running only now, after the `set()`.

[click]
And it prints "anonymous". The `set()` happened before the worker even started. But the worker reads its own copy, and that copy was made back at `create_task()`.

[click]
So the copy is made when the task is created, not when it starts running. If you want a task to see a value, set it before you create the task. Swap these two lines, and it prints "alice".
-->

---
hide: true
---

# The edges: leaving the event loop

<div mt-6 grid="~ cols-[1.15fr_1fr]" gap-6>

<div>

```py {*|1|3|5-7}{'data-id':'edges'}{maxHeight:'300px'}
await asyncio.to_thread(work)

await loop.run_in_executor(None, work)

await loop.run_in_executor(
    None, copy_context().run, work
)
```

</div>

<div flex="~ col" gap-3 text-4>
<div data-id="e1" v-click="1" border="~ emerald/50 rounded-lg" p-3 bg-emerald:5>✅ <b>copies the context</b> for you</div>
<div data-id="e2" v-click="2" border="~ rose/50 rounded-lg" p-3 bg-rose:5>❌ <b>no context</b> — <code>work()</code> sees the defaults</div>
<div data-id="e3" v-click="3" border="~ sky/50 rounded-lg" p-3 bg-sky:5>✅ carry it across <b>yourself</b></div>
</div>

</div>

<FancyArrow v-click="1" from="[data-id=e1] @ left" to="[data-id=edges] .line:nth-child(1) @ right" arc="0.15" />
<FancyArrow v-click="2" from="[data-id=e2] @ left" to="[data-id=edges] .line:nth-child(3) @ right" arc="0.15" />
<FancyArrow v-click="3" from="[data-id=e3] @ left" to="[data-id=edges] .line:nth-child(5) @ right" arc="0.15" />

<div v-click="4" mt-6 text-5>

Every hop off the event loop is a boundary you have to **check**, not assume. 🚧

</div>

<!--
Now, the other place values go missing is when you leave the event loop.

[click]
asyncio dot to_thread copies the context across for you. This one is safe, and it's documented as such.

[click]
run_in_executor does not. Same idea, different function, opposite behaviour. The function you pass in, `work` here, runs on a thread from a thread pool. That thread starts with a fresh, empty context, so every get inside `work` returns the default.

[click]
If you need it, you copy the context yourself and hand run the function. A bit ugly, but explicit.

[click]
I'm not asking you to memorise which function does which. I'm asking you to treat every hop off the event loop as a boundary you go and check. Because the failure is silent. You get the default, not an exception.
-->

---
plainBackground: true
hide: true
---

# The edges: called from outside Python

<div mt-1 text-4 op70>🔁 Python <b>called back</b> from outside: a C library, a GUI toolkit, <b>JavaScript</b> · example: 🌐 <b>Pyodide</b></div>

<div mt-2 grid="~ cols-[1.6fr_1fr]" gap-5>

<div>

````md magic-move {at:2}

```py
def on_timeout():
    print(user_var.get())

async def handle(user):
    user_var.set(user)
    setTimeout(create_proxy(on_timeout), 1000)
```

```py
def on_timeout():
    print(user_var.get())

async def handle(user):
    user_var.set(user)
    snapshot = copy_context()
    def in_snapshot():
        return snapshot.copy().run(on_timeout)
    setTimeout(create_proxy(in_snapshot), 1000)
```

````

</div>

<div flex="~ col" gap-3>

<div v-click="1">
<WindowMockup title="Terminal" dark codeblock>

```shell
anonymous
```

</WindowMockup>
<div mt-1 text-4 op70>no caller to copy: the <b>top-level</b> context</div>
</div>

<div v-click="3">
<WindowMockup title="Terminal" dark codeblock>

```shell
alice
```

</WindowMockup>
<div mt-1 text-4 op70>inside the <b>snapshot</b></div>
</div>

</div>

</div>

<div mt-4 grid="~ cols-2" gap-4 text-4>
<div v-click="3" border="~ emerald/50 rounded-lg" p-2 bg-emerald:5>📸 copied at the <b>handoff</b>, not the call</div>
<div v-click="4" border="~ sky/50 rounded-lg" p-2 bg-sky:5>🔁 a fresh <code>.copy()</code> <b>per call</b></div>
</div>

<div v-click="5" mt-4 text-5>

Every **entry point** back into Python is a boundary too. 🚪

</div>

<div v-click="5" absolute bottom-4 right-10 text-4 op60>Source: <a href="https://github.com/whitphx/stlite/blob/main/packages/kernel/py/stlite-lib/stlite_lib/pyodide_proxy_context.py" target="_blank">stlite-lib/stlite_lib/pyodide_proxy_context.py</a></div>

<!--
There's a second kind of edge: code outside Python calling back into Python. The edges so far all had a Python caller. A thread pool, `to_thread`, `create_task`: something in Python made the call, so there was a context to copy, or to forget to copy.

But sometimes the caller is not Python at all. A C library calls your callback. A GUI toolkit calls your click handler. Or, in the browser, JavaScript calls your Python function. In all of these, there is no Python caller, so there is no context to copy.

Let me show it with the one I know best: Pyodide. Pyodide is CPython compiled to WebAssembly, so Python runs in the browser, and JavaScript can call Python functions. I work with it every day, because Stlite, the project in the case study later, runs on Pyodide.

Same `handle()` as before, running as its own task. It sets the user and hands a callback to JavaScript. The callback lives at module level, like our `index()`, so nobody gives it the user. It reads the variable. `create_proxy()` wraps the Python function so JavaScript can hold on to it, and `setTimeout()` is the browser's timer. It calls our function one second from now.

[click]
And it prints the default. When JavaScript calls back in, no task is being created and there's no Python caller to copy from. Pyodide just runs the function in whatever context is current at that moment, which is the thread's top-level context. That's the one your module-level code runs in, not the task's copy. The user was set in the task's copy, so it was never in there.

[click]
So we take the copy ourselves. `copy_context()` runs while `handle()` is still handing the callback over, and every call runs inside that snapshot. `.copy()` on a context just makes another one with the same values.

[click]
Now it prints the user. And notice when the copy happened: at the handoff, not when JavaScript calls. By the time JavaScript calls, there's nothing left to copy.

[click]
Why the extra `.copy()`? When we handed work to a thread pool, we called `copy_context()` fresh for every hop. Here one snapshot is reused for every call, so each call takes its own copy of it. That's the same deal a task gets: its own copy, so whatever one call sets never leaks into the next.

[click]
So the edges go both ways. Leaving the event loop is one. Coming back in from something that isn't Python is the other. A C library, a GUI toolkit, or JavaScript.

And this one was a real bug in Stlite. App code that ran from a JavaScript callback could not find its app's data, for the same reason we just saw. The fix is this same pattern: Stlite wraps `create_proxy()` so that every callback runs in a snapshot taken at the handoff. The link to that code is at the bottom of the slide.
-->

---
hide: true
---

# `Token`: putting it back

```py {*|1|3|5}{maxHeight:'220px'}
token = user_var.set("guest")

do_work()  # sees "guest"

user_var.reset(token)  # back to "alice"
```

<div mt-6 text-5>

<v-clicks at="4">

- 🔁 **Same task, no copy** — so you put the old value back yourself
- 🧹 **Libraries stay polite** — borrow the variable, hand it back

</v-clicks>

</div>

<!--
One more piece of the API: the `Token`. A `Token` lets you undo a `set()`. We're in alice's task, and we change the value for a short time.

[click]
`set()` doesn't just return None. It gives you back a token, which remembers the value before your change. Here, that's alice.

[click]
The work runs and sees the new value.

[click]
And reset puts alice back.

[click]
Why do we need this? The copy only happens when a new task starts. Here we stay in the same task, so the old value is gone unless you put it back yourself. `reset()` with the token does that.

[click]
And this matters most if you write a library. A polite library may change a context variable while it does its job, but it puts the old value back with `reset()` before it returns. Then the application that called it never sees the change.
-->

---

# Where you've already met it

<div mt-6 text-6>

<v-clicks>

- 🪵 **Request IDs in logs** — a `logging.Filter` that calls `.get()`
- 🔭 **Tracing** — `opentelemetry.context` is `contextvars` underneath; the current span follows your `await`
- 💾 **Async DB sessions** — SQLAlchemy's `async_scoped_session` is scoped to a context
- 🌐 **Web frameworks** — Flask's `request`, and the `current_user` from our first route function

</v-clicks>

</div>

<div v-click="5" absolute bottom-10 inset-x-0 text-center text-5>

The usual example is 🪵 **logs**. It's **not just for logging**.

</div>

<!--
Now let's look at real tools that use `contextvars`. You've probably used some of them already.

[click]
Request IDs in logs. At the start of each request, a middleware stores a new request ID in a context variable. Then a `logging.Filter` reads it and adds it to every log record.

[click]
Distributed tracing. OpenTelemetry records each operation as a span, and a new span needs to know which span is running now, so it can attach to it as a child. OpenTelemetry keeps that current span in a context variable, so it stays right across awaits.

[click]
Async database sessions. SQLAlchemy can scope a session to the current task.

[click]
And web frameworks. Since Flask version two point two, Flask's `request` lives in a context variable, and Flask-Login's `current_user` uses it too.

[click]
Request IDs in logs is the example you see most often. But it can make `contextvars` look like a logging tool. Three of these four have nothing to do with logging.
-->

---
layout: statement
---

## Now you know which logical execution you're in.<br>That alone does not fix anything. 🔓

<div mt-8 op70 text-5>

🧠 **logical execution**<br>
one unit of work: a request, a task, a callback · **on any thread**

</div>

<!--
Every example so far asked one question: which logical execution am I in? Whose work am I doing right now?

`contextvars` answers that question. But knowing the answer does not make anything safe.

I learned this in a real project. Let me show you.
-->

---
layout: section
---

# 🔬 Case study: Stlite

<div mt-4 op70 text-5>
Streamlit in the browser, and one very global variable
</div>

<!--
This is Stlite. I'm its author and maintainer, and it's the project where I learned that.
-->

---

# What is Stlite?

<div mt-6 grid="~ cols-[1fr_auto]" gap-8 items-center>

<div text-6>

<v-clicks>

- 🎈 **Streamlit** — the Python framework for data apps
- 🌐 **…running in the browser** — on Pyodide, CPython compiled to WebAssembly
- 🚫 **No server** — no backend, no deploy; the Python is in the tab
- 📦 **The whole runtime ships as a web page**

</v-clicks>

</div>

<div>
<img src="/stlite.svg" alt="Stlite" w="220px" dark:hidden>
<img src="/stlite-dark.svg" alt="Stlite" w="220px" hidden dark:block>
</div>

</div>

<!--
A quick introduction, because the architecture is why this talk exists.

[click]
Streamlit is a Python framework for data apps. You write only a Python script, and it becomes a web app.

[click]
Stlite is Streamlit running in the browser, on Pyodide: CPython compiled to WebAssembly.

[click]
And there is no server. The Python interpreter runs inside the browser tab.

[click]
So the whole runtime ships as a static web page.
-->

---

# No backend, just a tab

<div grid="~ cols-[1.15fr_1fr]" gap-5 mt-0 items-start class="stlite-grid">

<div>

<div text-4 mb-1>📄 <b>app.py</b>: a Streamlit script</div>

<<< @/samples/stlite-demo/app.py py

<div text-4 mt-2 mb-1>🌐 <b>stlite.html</b>: a static page (+ Stlite's <code>&lt;script&gt;</code>)</div>

<<< @/samples/stlite-demo/stlite.html#slide-mount html

</div>

<div v-click="1">

<LiveEmbed url="/stlite-demo/stlite.html" title="stlite.html" light padding="0.4rem" height="280px" :zoom="0.5">

<img src="/stlite-demo.png" alt="The Sales dashboard, running from a static HTML file in the browser" style="width: 100%; height: auto;" />

</LiveEmbed>

<div v-click="2" mt-4 text-5 text-center>

**Static files only.**<br>The Python runs **in the page**. 🪄

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 14px;
  --slidev-code-line-height: 1.5;
}
/* A code block will not shrink below its longest line, which would widen its
   track and push the window off the slide. */
.stlite-grid > * {
  min-width: 0;
}
</style>

<!--
Here's a Stlite app. On the left is the whole source code of this app: a short Streamlit script, and a web page that loads it.

[click]
On the right is that page, running live in this slide. When I move the slider, the chart changes.

[click]
It's only static files. There is no server. The Python code runs right here, in the browser tab.

Now let me show you the part that made my life hard.
-->

---
clicks: 3
---

# Who runs your script?

<div mt-4 mx-auto max-w-180 text-4>

<div rounded-xl p-3 border transition-all duration-500 :class="$clicks >= 1 ? 'border-amber-400/60 bg-amber-400/10' : 'border-transparent'">

<div text-center mb-2 transition-opacity duration-500 :class="$clicks >= 1 ? 'op100' : 'op0'">🎈 <b>The Streamlit runtime</b>: the host. <span op70>It runs your script again on every interaction.</span></div>

<div v-click="2" mb-2 rounded-lg p-2 border="~ amber-400/60" bg-white dark:bg-black>
<div op70 mb-1>Only in <b>Stlite</b>: before each run, the host sets up the app's world:</div>

```py
os.chdir("/home/app-a")
os.environ["HOME"] = "/home/app-a"
```

</div>

<div rounded-lg p-2 border="~ emerald-400/60" bg-emerald-400:10>
<div mb-1>📄 <b>app.py</b>: your script</div>

```py
rows = st.slider("Rows", 10, 100, 60)
df = pd.read_csv("data.csv")
```

</div>

</div>

</div>

<div v-click="3" mt-4 text-5 text-center>

The **host** calls `os.chdir()`. **Your script** just uses relative paths. 📂

</div>

<!--
`app.py` is the application script, the one a Stlite user writes. It has no server code. So who runs it?

[click]
The Streamlit runtime does. It's the host, and it runs your script in the same Python interpreter.

[click]
And one Stlite runtime can run several apps, which regular Streamlit never does. So before each run, Stlite moves to the app's own directory and sets the `HOME` environment variable for it.

[click]
So the host calls `os.chdir()` to prepare for running the app script, and your script knows nothing about it. It just opens `data.csv` and expects it to be in its own directory.
-->

---
plainBackground: true
---

# Many apps, one Python

<div mt-4 mx-auto max-w-200 text-4 class="nest">

<div border="~ gray-400/50 rounded-xl" p-2 bg-gray-400:5 :class="{ hl: $clicks === 1 }">
<div text-center op70 mb-1>🌐 <b>Browser</b>: one JavaScript thread (a Web Worker)</div>

<div border="~ violet-400/50 rounded-lg" p-2 bg-violet-400:5 :class="{ hl: $clicks === 2 }">
<div text-center op70 mb-1>🐍 <b>Pyodide</b>: one Python interpreter, on WebAssembly</div>

<div border="~ sky-400/50 rounded-lg" p-2 bg-sky-400:5 :class="{ hl: $clicks === 3 }">
<div text-center op70 mb-1>🧵 <b>one thread</b></div>

<div border="~ rose-400/50 rounded-lg" p-2 bg-rose-400:5 :class="{ hl: $clicks === 4 }">
<div text-center op70 mb-2>⚡ <b>one event loop</b></div>

<div grid="~ cols-3" gap-2 rounded-lg :class="{ hl: $clicks === 5 }">
<div border="~ emerald-400/60 rounded-lg" p-2 bg-emerald-400:10 text-center><b>🎈 App A</b><br><span op70><code>/home/app-a</code></span></div>
<div border="~ emerald-400/60 rounded-lg" p-2 bg-emerald-400:10 text-center><b>🎈 App B</b><br><span op70><code>/home/app-b</code></span></div>
<div border="~ emerald-400/60 rounded-lg" p-2 bg-emerald-400:10 text-center><b>🎈 App C</b><br><span op70><code>/home/app-c</code></span></div>
</div>

</div>
</div>

<div v-click="6" mt-2 border="~ amber-400/60 rounded-lg" p-2 bg-amber-400:10 text-center>
📁 one <code>os.getcwd()</code> · 🌍 one <code>os.environ</code> — <b>shared by every app</b>
</div>

</div>
</div>

</div>

<div v-click="7" mt-4 text-5 text-center>

Three apps, but **they all share one interpreter.** 😬

</div>

<style>
.nest .hl { outline: 3px solid rgb(245 158 11); outline-offset: 2px; transition: outline-color 0.3s; }
</style>

<!--
This diagram shows the layers that Stlite apps run inside, from the outside in.

[click]
Stlite runs in a web browser environment, on one JavaScript thread.

[click]
Inside it is Pyodide: one Python interpreter.

[click]
And that interpreter has one thread. Python cannot start more threads here.

[click]
On that thread, there is one event loop.

[click]
And inside that loop, a page can run several Stlite apps. They are all tasks on the same event loop, and each has its own home directory.

[click]
But the current directory and the environment variables are shared across the whole process. Every app shares them.

[click]
So these are three separate apps, each relying on its own home directory. But there is only one current directory, and they all share it.
-->

---
hide: true
---

# Each app wants its own directory

<div mt-6 grid="~ cols-[1.3fr_1fr]" gap-6>

<div>

<div text-4 mb-1>🎈 <b>The host</b> <span op70>(pseudocode)</span></div>

```py {*|6|7|*}{'data-id':'dirs'}
def run_app(app):
    os.chdir(app.home)
    os.environ["HOME"] = app.home
    exec(app.code)

run_app(app_a)
run_app(app_b)
```

<div v-click="3" mt-3>
<div text-4 mb-1>📄 <b>App A's</b> <code>app.py</code></div>

```py {'data-id':'appa'}
df = pd.read_csv("data.csv")
```

</div>

</div>

<div flex="~ col" gap-1 text-4 style="margin-top: 10.3rem">
<div data-id="d-a" v-click="1" border="~ amber/50 rounded-lg" p-1 bg-amber:5 text-center>🎈 <b>Host</b> runs <b>App A</b> in <code>/home/app-a</code></div>
<div data-id="d-b" v-click="2" border="~ amber/50 rounded-lg" p-1 bg-amber:5 text-center>🎈 <b>Host</b> runs <b>App B</b> in <code>/home/app-b</code></div>
<div data-id="d-s" v-click="3" border="~ emerald/50 rounded-lg" p-3 bg-emerald:5 text-center style="margin-top: 1rem">📄 <b>App A's</b> script: a relative path</div>
</div>

</div>

<FancyArrow v-click="1" from="[data-id=d-a] @ left" to="[data-id=dirs] .line:nth-child(6) @ right" arc="0" />
<FancyArrow v-click="2" from="[data-id=d-b] @ left" to="[data-id=dirs] .line:nth-child(7) @ right" arc="0" />
<FancyArrow v-click="3" from="[data-id=d-s] @ left" to="[data-id=appa] .line:nth-child(1) @ right" arc="0" />

<div v-click="4" mt-6 text-5>

`os.getcwd()` is **one value, for the whole process**. There is no per-task version. 🌍

</div>

<!--
Now put the two pictures together: one interpreter, many apps, and a host that moves to each app's directory before it runs that app's script. Here is the host's code, as pseudocode. The `run_app` function moves to the app's home directory, sets `HOME`, and then runs the app's script.

[click]
The host runs App A. So it moves to App A's directory first. App A's files live there.

[click]
Then the host runs App B, and moves to App B's directory.

[click]
And this line, in App A's script, is why it matters. A user writes `read_csv` with a relative path, like anyone would. Which file that opens depends on the current directory at that moment.

[click]
And here is the problem. There is exactly one current working directory for the whole process. Python has no "current directory for this task". So you cannot give each app its own.
-->

---

# So here's the bug

<div mt-2 grid="~ cols-[minmax(0,1.1fr)_minmax(0,1fr)]" gap-5>

<div>

<div text-4 mb-1>🎈 <b>The host</b> <span op70>(pseudocode)</span></div>

<div class="bug-host">

```py {*|6-8|2-3|4|4|*}
async def run_app(app):
    os.chdir(app.home)
    os.environ["HOME"] = app.home
    await exec_script(app.code)

await asyncio.gather(
    run_app(app_a), run_app(app_b)
)
```

</div>

</div>

<div>

<div class="bug-app">

<div v-click="4">

<div text-4 mb-1>📄 <b>App A's</b> <code>app.py</code></div>

```py
resp = await pyfetch(url)
df = pd.read_csv("data.csv")
```

</div>

<div v-click="9" mt-3>

<WindowMockup title="App A" dark codeblock>

```shell
FileNotFoundError: [Errno 44]
  No such file or directory: 'data.csv'
```

</WindowMockup>

<div mt-2 text-4 op70>…because the process is now in <code>/home/app-b</code></div>

</div>

</div>

</div>

</div>

<div v-click="5" mt-3 text-4 class="btl">
<div class="btl-row btl-lane btl-a">
<div class="btl-name">App A's task</div>
<div class="btl-ca">chdir <code>app-a</code></div>
<div v-click="6" class="btl-ca">⏸️ <code>await</code></div>
<div></div><div></div>
<div v-click="9" class="btl-ca">read <code>data.csv</code> ❌</div>
</div>
<div class="btl-row btl-lane btl-b">
<div class="btl-name">App B's task</div>
<div></div><div></div>
<div v-click="7" class="btl-cb">chdir <code>app-b</code></div>
<div v-click="8" class="btl-cb">⏸️ <code>await</code></div>
<div></div>
</div>
<div class="btl-row btl-cwd" :class="{ 'btl-hl': $clicks >= 10 }">
<div class="btl-name"><code>os.getcwd()</code></div>
<div class="btl-v">/home/app-a</div>
<div v-click="6" class="btl-v">/home/app-a</div>
<div v-click="7" class="btl-v btl-bad">/home/app-b</div>
<div v-click="8" class="btl-v btl-bad">/home/app-b</div>
<div v-click="9" class="btl-v btl-bad">/home/app-b</div>
</div>
<div class="btl-row">
<div class="btl-name btl-time">time</div>
<div class="btl-axis"></div>
</div>
<div v-click="10" class="btl-tag">🌍 <code>os.getcwd()</code>: <b>one per process</b>, shared by both tasks</div>
</div>

<style>
.bug-host { --slidev-code-font-size: 15px; --slidev-code-line-height: 1.45; }
.bug-app { --slidev-code-font-size: 15px; }
.btl { border: 1px solid rgb(245 158 11 / 0.5); border-radius: 0.5rem; padding: 0.3rem 0.6rem; background: rgb(245 158 11 / 0.05); }
.btl-row { display: grid; grid-template-columns: 9.5rem repeat(4, minmax(0, 1fr)) minmax(0, 1.35fr); gap: 0.4rem; align-items: center; margin: 0.15rem 0; padding: 0 0.3rem; border: solid transparent; border-width: 0 1.5px; border-radius: 0.4rem; }
.btl-lane { border-width: 1.5px; background-image: linear-gradient(to right, transparent 9.5rem, rgb(128 128 128 / 0.6) 9.5rem); background-size: 100% 2px; background-repeat: no-repeat; background-position: 0 50%; }
.btl-a { border-color: rgb(14 165 233 / 0.6); background-color: rgb(14 165 233 / 0.08); }
.btl-b { border-color: rgb(16 185 129 / 0.6); background-color: rgb(16 185 129 / 0.08); }
.btl-lane .btl-name { font-weight: 700; }
.btl-name { position: relative; white-space: nowrap; }
.btl-ca, .btl-cb, .btl-v { border-radius: 0.25rem; padding: 0 0.25rem; text-align: center; white-space: nowrap; }
.btl-ca { background: rgb(186 230 253); }
.btl-cb { background: rgb(167 243 208); }
html.dark .btl-ca { background: rgb(7 89 133); }
html.dark .btl-cb { background: rgb(6 95 70); }
.btl-v { font-family: var(--slidev-code-font-family, monospace); border: 1px solid rgb(128 128 128 / 0.45); }
.btl-bad { border-color: rgb(244 63 94 / 0.7); color: rgb(225 29 72); }
.btl-cwd { transition: background-color 0.3s, border-color 0.3s; }
.btl-hl { box-shadow: 0 0 0 1.5px rgb(245 158 11); background-color: rgb(245 158 11 / 0.12); }
.btl-tag { margin-top: 0.2rem; text-align: center; color: rgb(217 119 6); }
.btl-time { text-align: right; font-weight: 700; opacity: 0.8; }
.btl-axis { grid-column: 2 / span 5; position: relative; height: 0; border-top: 2px solid currentColor; opacity: 0.7; margin-right: 10px; }
.btl-axis::after { content: ''; position: absolute; right: -10px; top: -7px; border-left: 12px solid currentColor; border-top: 6px solid transparent; border-bottom: 6px solid transparent; }
</style>

<!--
This is what goes wrong. The code is pseudocode, but it does what Stlite's host does.

[click]
The last line runs each app as its own task, with `gather()`.

[click]
Each task first moves to its app's directory and sets `HOME`.

[click]
Then it runs the app's script. Everything the user's code does happens on this line.

[click]
And assume App A's code looks like this. It has an `await`-ed call: it waits for the network, then reads `data.csv` with a relative path.

[click]
The timeline at the bottom shows what happens, step by step. First, App A's task moves to App A's directory.

[click]
App A's script reaches the `await`, and its task pauses.

[click]
So the event loop runs App B's task, and the host calls `os.chdir()` for App B.

[click]
App B's script also reaches an `await`, and pauses.

[click]
Now App A resumes and reads `data.csv`. But the process is still in App B's directory, so the file is not found.

[click]
Same shape as the threading dot local bug: a value overwritten during an `await`. But a better storage class does not help here, because the current directory belongs to the whole process.
-->
---

# Step 1: store each app's directory in a `ContextVar`

```py {maxHeight:'230px'}
home_dir_contextvar: ContextVar[str | None] = ContextVar(
    "home_dir", default=None
)

home_dir_contextvar.set(app_home_dir)
```

<div mt-4 text-5>

Set **when an app is started**, before its script runs. 🚪

</div>

<div v-click="1" mt-6 text-5 border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>

Any code in each task can get **its app's directory**. ✅

</div>

<div absolute bottom-6 left-14 text-4 op60>

Source: <a href="https://github.com/whitphx/stlite/blob/main/packages/kernel/py/stlite-lib/stlite_lib/server/task_context.py" target="_blank">stlite-lib/stlite_lib/server/task_context.py</a>

</div>

<!--
So how do we fix it? Step one: store each app's directory in a context variable when the app starts. So far, this looks the same as storing per-task data, like the user in our first example. We will build on it in the next step.

[click]
Now any code running in each task can get its app's directory.
-->

---
layout: statement
---

## The `ContextVar` knows the right directory.<br>But `os.getcwd()` is still wrong. 🤷

<!--
But that doesn't fix the bug yet.

The context variable knows the right directory, but nothing calls `os.chdir()`. Knowing the right directory is not the same as being in it.
-->

---
hide: true
---

# Step 2: change the directory, then change it back

<div text-4 op70 mb-2>🎈 the host · <b>simplified</b> pseudocode</div>

```py {*|2|3-5|6|7-8}
@contextmanager
def app_directory(home):
    orig_cwd, orig_home = os.getcwd(), os.environ.get("HOME")
    os.chdir(home)
    os.environ["HOME"] = home
    yield
    os.chdir(orig_cwd)
    os.environ["HOME"] = orig_home
```

<div v-click="5" mt-4 text-5>

Change, run, **revert**. The change is only **temporary**. 🔁

</div>

<!--
Step two: use that value to change the real directory. This is pseudocode.

[click]
It's a context manager. It takes `home`, the value from step one.

[click]
On the way in, it remembers where the process is, then moves to the app's directory and sets `HOME`.

[click]
At the `yield`, the code wrapped by this context manager runs.

[click]
On the way out, it reverts the changed settings.

[click]
So the app-specific values in the process-wide state, like the current directory, are only temporary, and they are always reverted.
-->

---

# Step 2: change the directory on each resume

<div text-4 op70 mb-2>🎈 the host · <b>simplified</b> pseudocode</div>

<div grid="~ cols-[minmax(0,1.35fr)_minmax(0,1fr)]" gap-5>

<div class="hook-code">

```py {*|1-4|6|7-10|11-12|13-15|*}
class DirectorySyncCoroutineProxy(Coroutine):
    def __init__(self, coro):
        self.iter = coro.__await__()
        self.home = home_dir_contextvar.get()

    def send(self, value):
        orig_cwd = os.getcwd()
        orig_home = os.environ.get("HOME")
        os.chdir(self.home)
        os.environ["HOME"] = self.home
        try:
            return self.iter.send(value)
        finally:
            os.chdir(orig_cwd)
            os.environ["HOME"] = orig_home
```

</div>

<div flex="~ col" gap-3 text-5>
<div v-click="2" border="~ sky/40 rounded-lg" px-3 py-2 bg-sky:5>🪝 <code>send()</code>: called by the <b>event loop</b> on <b>every resume</b></div>
<div v-click="3" border="~ amber/40 rounded-lg" px-3 py-2 bg-amber:5>📁 before the step: <b>move in</b></div>
<div v-click="4" border="~ violet/40 rounded-lg" px-3 py-2 bg-violet:5>▶️ <b>one step</b>, up to the next <code>await</code></div>
<div v-click="5" border="~ amber/40 rounded-lg" px-3 py-2 bg-amber:5>↩️ after the step: <b>move back</b></div>
<div v-click="6" border="~ emerald/40 rounded-lg" px-3 py-2 bg-emerald:5>🎯 every step runs in <b>its own app's directory</b></div>
</div>

</div>

<style>
.hook-code { --slidev-code-font-size: 15px; --slidev-code-line-height: 1.4; }
</style>

<!--
Now we need a hook point: a place in each task where we can call `os.chdir()` and set `HOME`. And it must run every time the task resumes, because a task runs in steps, from one `await` to the next.

[click]
So we wrap the script's coroutine in a proxy class. When the proxy is created, it reads the app's directory from the context variable from step one.

[click]
And `send()` is the method the event loop calls every time it resumes a coroutine. That's our hook point.

[click]
Before the step, it remembers the current settings, then moves to the app's directory and sets `HOME`.

[click]
Then it runs one step of the script, until its next `await`.

[click]
After the step, even if it fails, it puts the original settings back. The real class does the same for `throw()` and `close()`.

[click]
So every step of every app runs in its own app's directory.
-->

---
plainBackground: true
---

# Two tasks, one directory, no collisions

<div mt-24 text-4 class="btl">
<div class="btl-row btl-lane btl-a">
<div class="btl-name">App A's task</div>
<div v-click="1" class="btl-ca">▶️ resume</div>
<div v-click="2" class="btl-ca">⏸️ <code>await</code></div>
<div></div><div></div>
<div v-click="5" class="btl-ca">read <code>data.csv</code> ✅</div>
</div>
<div class="btl-row btl-lane btl-b">
<div class="btl-name">App B's task</div>
<div></div><div></div>
<div v-click="3" class="btl-cb">▶️ resume</div>
<div v-click="4" class="btl-cb">⏸️ <code>await</code></div>
<div></div>
</div>
<div class="btl-row">
<div class="btl-name"><code>os.getcwd()</code></div>
<div v-click="1" class="btl-v btl-good">/home/app-a</div>
<div v-click="2" class="btl-v btl-back">↩️ original</div>
<div v-click="3" class="btl-v btl-good">/home/app-b</div>
<div v-click="4" class="btl-v btl-back">↩️ original</div>
<div v-click="5" class="btl-v btl-good">/home/app-a</div>
</div>
<div class="btl-row">
<div class="btl-name btl-time">time</div>
<div class="btl-axis"></div>
</div>
</div>

<div v-click="6" mt-8 text-5 text-center>

Each resume **moves in** to its own directory; each <code>await</code> **moves back**. ✅

</div>

<style>
.btl { border: 1px solid rgb(245 158 11 / 0.5); border-radius: 0.5rem; padding: 0.3rem 0.6rem; background: rgb(245 158 11 / 0.05); }
.btl-row { display: grid; grid-template-columns: 9.5rem repeat(4, minmax(0, 1fr)) minmax(0, 1.35fr); gap: 0.4rem; align-items: center; margin: 0.15rem 0; padding: 0 0.3rem; border: solid transparent; border-width: 0 1.5px; border-radius: 0.4rem; }
.btl-lane { border-width: 1.5px; background-image: linear-gradient(to right, transparent 9.5rem, rgb(128 128 128 / 0.6) 9.5rem); background-size: 100% 2px; background-repeat: no-repeat; background-position: 0 50%; }
.btl-a { border-color: rgb(14 165 233 / 0.6); background-color: rgb(14 165 233 / 0.08); }
.btl-b { border-color: rgb(16 185 129 / 0.6); background-color: rgb(16 185 129 / 0.08); }
.btl-lane .btl-name { font-weight: 700; }
.btl-name { position: relative; white-space: nowrap; }
.btl-ca, .btl-cb, .btl-v { border-radius: 0.25rem; padding: 0 0.25rem; text-align: center; white-space: nowrap; }
.btl-ca { background: rgb(186 230 253); }
.btl-cb { background: rgb(167 243 208); }
html.dark .btl-ca { background: rgb(7 89 133); }
html.dark .btl-cb { background: rgb(6 95 70); }
.btl-v { font-family: var(--slidev-code-font-family, monospace); border: 1px solid rgb(128 128 128 / 0.45); }
.btl-bad { border-color: rgb(244 63 94 / 0.7); color: rgb(225 29 72); }
.btl-cwd { transition: background-color 0.3s, border-color 0.3s; }
.btl-hl { box-shadow: 0 0 0 1.5px rgb(245 158 11); background-color: rgb(245 158 11 / 0.12); }
.btl-tag { margin-top: 0.2rem; text-align: center; color: rgb(217 119 6); }
.btl-time { text-align: right; font-weight: 700; opacity: 0.8; }
.btl-axis { grid-column: 2 / span 5; position: relative; height: 0; border-top: 2px solid currentColor; opacity: 0.7; margin-right: 10px; }
.btl-axis::after { content: ''; position: absolute; right: -10px; top: -7px; border-left: 12px solid currentColor; border-top: 6px solid transparent; border-bottom: 6px solid transparent; }
.btl-good { border-color: rgb(16 185 129 / 0.7); color: rgb(5 150 105); }
.btl-back { opacity: 0.7; font-family: inherit; }
</style>

<!--
Here's the same timeline as the bug, now with the proxy in place.

[click]
App A's task resumes. The proxy moves into App A's directory.

[click]
App A reaches an `await`. The proxy puts the original directory back, and the next task runs.

[click]
App B's task resumes, and the proxy moves into App B's directory.

[click]
App B reaches an `await`, and the directory is put back again.

[click]
App A resumes. The proxy moves into App A's directory again, so reading `data.csv` works this time.

[click]
So each resume moves into its own app's directory, and each `await` moves back. The two apps never see each other's directory.
-->

---
layout: section
---

# ⚠️ Drawing the boundary

<div mt-4 op70 text-5>
The one lesson worth taking home
</div>

<!--
Now let's step back from Stlite and sum up what we learned.
-->

---
hide: true
---

# Four common mistakes

<div mt-6 text-6>

<v-clicks>

- 📸 **Copied at `create_task()`, not when the task starts** — set the value *before* you create the task
- 🧵 **Threads inherit nothing** — `run_in_executor` drops it; `asyncio.to_thread` copies it for you
- 🔇 **The failure is silent** — you get the *default*, not an exception
- 🌍 **Process-wide state stays process-wide** — `os.getcwd()`, `os.environ`

</v-clicks>

</div>

<!--
Here are four common mistakes. We've seen all of them today.

[click]
The copy is made when you call `create_task()`, not when the task starts running. So set the value first, then create the task.

[click]
Threads don't get your context on their own. A thread from a thread pool starts with an empty context, and that's what `run_in_executor` gives you. `to_thread` is different, because it copies the context for you.

[click]
And these failures are silent. You don't get an exception, you get the default value. Which means the bug shows up later, somewhere else, as wrong data rather than a crash.

[click]
And the fourth one is the Stlite lesson. Process-wide state stays process-wide. The current directory and the environment variables have one value for the whole process. Even perfect use of `contextvars` does not change that.
-->

---
layout: statement
---

## `contextvars` tells *you* which context you're in.<br>It does not change process-wide state. 🧭

<!--
If you remember one sentence from this talk, make it this one.

`contextvars` answers a question: which logical execution is this? It does not protect process-wide state, and it does not keep tasks apart.

What you do with the answer is up to you. In Stlite, we used it to keep a directory setting per task. A custom class that wraps each script's coroutine gives us a hook on every step, and there we move the directory in and out.
-->

---
hide: true
---

# Hidden context, or just a parameter?

<div mt-6 text-4>

| | 🧭 hidden context | 📮 explicit parameter |
|---|---|---|
| **Use it when** | every layer needs it, and you don't own the layers | it's part of what the function *does* |
| **Classic fit** | current user, request ID, trace span | the user whose data this function loads |
| **You pay in** | invisible in signatures, awkward to test | passing it through every function |
| **Fails by** | silently returning the default | a `TypeError`, right away |

</div>

<div v-click="1" mt-6 text-5>

Hidden context makes code **harder to read**. Use it only where passing the value **really isn't practical**. 🧾

</div>

<!--
So when should you actually reach for this?

Less often than you might think.

Hidden context earns its place when every layer needs the value and you don't own all the layers. The logged-in user has to reach a permission check twenty frames down, through library code you didn't write. You can't thread a parameter through that. Our very first route function is the textbook case: Flask calls `index()` for you, and you don't own that call, so the user can't arrive as an argument.

But if the value is part of what the function does — this function loads this user's orders — pass it. Just pass it. Same kind of value, different job.

And look at the bottom row, because I think it's the deciding one. An explicit parameter fails loudly. You forget it, and you find out immediately. Hidden context fails silently, by handing you a default that looks perfectly reasonable.

[click]
So hidden context has a cost: the code is harder to read and test. Sometimes that cost is worth it. Just choose it on purpose.
-->

---

# Key takeaways

<div mt-4 text-5>

<v-clicks>

- 🧵 **`threading.local()` didn't break** — "one thread, one request" did
- 📸 **`ContextVar` follows the task** — each task gets its own copy of the context
- 🧭 **It tells you the context; it does not change process-wide state** — `os.getcwd()` and `os.environ` stay shared
- 🔁 **Process-wide state? Borrow it** — move in on every resume, move back on every pause

</v-clicks>

</div>

<div v-click mt-5 grid="~ cols-[1fr_auto]" gap-8 items-center>

<div text-base flex="~ col" gap-2>

<div flex="~ gap-2" items-center>
<div i-ri-github-line text-xl op50 />
<div><a href="https://github.com/whitphx/stlite" target="_blank">whitphx/stlite</a> — in-browser Streamlit · <a href="https://github.com/whitphx/stlite/blob/main/packages/kernel/py/stlite-lib/stlite_lib/server/task_context.py" target="_blank"><code>task_context.py</code></a></div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-file-text-line text-xl op50 />
<div><a href="https://peps.python.org/pep-0567/" target="_blank">PEP 567</a> · <a href="https://docs.python.org/3/library/contextvars.html" target="_blank">docs.python.org/3/library/contextvars</a></div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-code-s-slash-line text-xl op50 />
<div><a href="https://github.com/whitphx/slides/tree/main/decks/202610-pycontw-contextvars" target="_blank">whitphx/slides</a> — this deck</div>
</div>

<div mt-2 w-min flex="~ gap-1" items-center>
  <div i-ri-user-3-line op50 ma text-xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

</div>

<div flex="~ gap-12" items-start>

<div flex="~ col" items-center gap-2>
<div class="qr-box" w-33 h-33>
<QRCode :width="185" :height="185" type="svg" data="https://slides.whitphx.info/202610-pycontw-contextvars/"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
</div>
<div op70 text-sm text-center leading-tight>These slides</div>
</div>

<div flex="~ col" items-center gap-2>
<div class="qr-box" w-33 h-33>
<QRCode :width="135" :height="135" type="svg" data="https://github.com/whitphx/stlite"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
</div>
<div op70 text-sm text-center leading-tight>Stlite</div>
</div>

</div>

</div>

<style>
/* The two codes carry URLs of different lengths, so they differ in module count
   and each needs its own exact-multiple width to avoid qr-code-styling's dot
   flooring. Scaling both SVGs to one box is what makes them the same size. */
.qr-box :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

<!--
So, to wrap up.

[click]
threading dot local never broke. What broke is the assumption that one thread means one request.

[click]
A `ContextVar` follows the task. Each task gets its own copy of the context.

[click]
But it only tells you which context you're in. The current directory and environment variables are still shared.

[click]
So for process-wide state, borrow it: move in when the task resumes, move back when it pauses.

[click]
That's all from me. Thank you very much.
The slides are behind the first QR code, and Stlite is behind the second.
Please come and find me afterwards.
-->

