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
PyCon Taiwan 2026
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
OK, so let's get into the talk. Here's a quick overview: three things you'll learn today.

[click]
First, what problem the `contextvars` module actually solves. It's a small API, but the problem behind it is easy to get wrong.

[click]
Second, how a value you store with `contextvars` moves around your program. Does it go along when your code crosses an await? When it starts a new task? When it runs a function in another thread? This is where the surprises live.

[click]
And third, where the limits of `contextvars` are. There is a point where it stops helping, and I found it the hard way in a real project. That's the second half of the talk.
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
Let me show you a piece of code you've probably written a hundred times. A Flask app with one page. It says hello to whoever is logged in.

[click]
`current_user` here is the user who sent this request. Flask-Login works it out for us.

[click]
Now look at the function itself. The `index` function takes no arguments. Nobody passes the user to it.

[click]
So the current user is not an argument. It's just there when the function runs. How does Python manage a value like this?
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
So how does the `index` function get the current user? To answer that, we first need to look at the server it runs on.

Our example runs on a classic web server. One process, a pool of threads, and each incoming request is handled in its own dedicated thread. That thread works on the request from start to finish, and only on that request.

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
So on that server, how does something like `current_user` work? Here is a simplified version. It is not Flask's real code. It shows what Flask and Flask-Login do for you, inside the library.

[click]
The user changes from request to request, so a plain module-level global won't work in this case. On this thread-based web server, the answer is threading dot local: one value per thread.

[click]
At the top of each request, Flask sets the user on it, and then calls your route function. The server has already given this request a thread of its own, so the `handle` function runs on that thread.

[click]
The `current_user` function is the Flask-Login part. It reads the user straight back out.

[click]
And the route function is a stripped-down version of our `index` function from before. It still takes no arguments. Nobody passed the user down. But the `current_user` function still returns the user for this request, because it reads the value for the current thread. That's what threading dot local gives us.

[click]
And on this server, that's exactly right. Each thread handles one request, so one value per thread means one value per request. This is not bad code.

This is roughly what Flask did in version one. The links to the real code are on the slide.
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
The current user is only one example. Python code reads many values that were never passed to it as arguments.

[click]
The current request.

[click]
The current user, our example.

[click]
The current database transaction. SQLAlchemy's `scoped_session`, for example, keeps one session per thread by default, with `threading.local()`.

[click]
The current runtime: which app is running, in a system that runs more than one.

[click]
None of these appear in a function signature. No caller passes them in. Every layer just reads them when it needs them.

And on a thread-per-request server, `threading.local()` is the classic tool for values like these. That's how they've been managed.
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
On the left is the thread-per-request server our code was written for. One process, many threads, one thread per request. Per-thread storage really is per-request storage.

But once we go async, that stops being true.

[click]
And on the right is an async web server, built on asyncio. Same one process, the same requests. But there is only one thread, and it has two new layers inside it. The first is the event loop. It is the scheduler that runs on that thread and decides what runs next. Inside the event loop, each request runs in something called a task. In the usual async web setup, the server puts each request into its own task, and the event loop runs those tasks. All the tasks share the one thread. They take turns, and the event loop switches between them at every await.

[click]
So one thread is serving many requests at once.

[click]
And that's the problem. In an async setup, threading dot local does not give you what you want. It still does exactly what it promises, one value per thread. But one thread is now many requests, so per-thread no longer means per-request. The tool is fine. The mapping you were relying on is gone.

If you're wondering about your own apps: Flask on its threaded server is the picture on the left. An async framework like FastAPI or Starlette, with `async def` handlers, is the picture on the right.

And before we fix it, we should be precise about that new word on the right: task.
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
A task doesn't appear on its own. Something starts it. Let's look at a small example.

[click]
The `greet` function is defined with `async def`. So calling `greet("alice")` gives you a coroutine. A coroutine is a function call that can pause at each `await`.

[click]
We pass that coroutine to `asyncio.create_task()`, and that starts a task. In a web app, the server does this for you: Uvicorn, for example, starts one task for each request. Remember who starts a task. It matters later.

[click]
Each task runs one coroutine. And `create_task()` doesn't wait for it to finish. So the `main` function keeps going and prints its line right away.

[click]
And the event loop runs all the tasks, on one thread. So the tasks run concurrently, not in parallel. The event loop switches between them when the running coroutine reaches an `await`. For this talk, just remember: one thread, many tasks, taking turns.

[click]
So: three requests, three tasks, one thread, taking turns. That is the execution model for the rest of the talk. And taking turns is exactly what is about to break our example.
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
.tl-row { display: grid; grid-template-columns: 7.5rem repeat(5, 1fr); gap: 0.4rem; align-items: center; margin: 0.1rem 0; }
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
.tl-a, .tl-b, .tl-v { border-radius: 0.25rem; padding: 0 0.4rem; text-align: center; white-space: nowrap; }
.tl-a { background: rgb(14 165 233 / 0.18); }
.tl-b { background: rgb(16 185 129 / 0.2); }
.tl-v { font-family: var(--slidev-code-font-family, monospace); border: 1px solid rgb(128 128 128 / 0.45); }
.tl-bad { border-color: rgb(244 63 94 / 0.7); color: rgb(225 29 72); }
.tl-time { grid-column: 2; text-align: right; opacity: 0.6; }
.tl-code { --slidev-code-font-size: 14px; --slidev-code-line-height: 1.4; }
</style>

<!--
Let me show you the failure. Here's the same app, made async. Like before, this is not real framework code. It runs, but it is a simplified version that shows how an async web framework works.

[click]
The `handle` function plays the framework's part. It's told who the request is from, stores the user in `_local.user`, and calls the route function.

[click]
The `index` function is the route function. It reads the user back, and it still takes no arguments.

[click]
The last line plays the server receiving two requests. `asyncio.gather()` runs `handle("alice")` and `handle("bob")` as two tasks, one per request, on the same thread. The timeline at the bottom follows these two tasks.

[click]
Alice's task runs first. It stores "alice" in `_local.user`.

[click]
Then the `index` function awaits. Alice's task stops here and waits, so the event loop runs the other task: bob's task.

[click]
Bob's task runs the same line, and stores "bob" in the same slot. It is the same slot because both tasks are on the same thread.

[click]
Then bob's task also reaches the await, and waits.

[click]
Now alice's task resumes and reads the slot. It gets "bob".

[click]
And alice gets greeted as bob. Both lines say bob. The timeline shows why: one slot, two tasks, and bob's write came between alice's write and alice's read.

Nobody did anything wrong here. There's one slot per thread, and two requests took turns writing into it. In a real service, this is alice looking at bob's page. That's not a cosmetic bug. That's a data leak.
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

What do I mean by logical execution? It's the code that runs for one request, from start to finish. On the async server, that's one task. The task stops at each `await`, other tasks run on the same thread, and later it picks up where it left off. The thread is shared, but the task's own line of work goes on.

So we want a value that belongs to that line of work, and goes with it across every `await`. That's exactly what the `contextvars` module gives us.
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
So this is what the standard library gives us instead. A ContextVar is like threading dot local, except the value follows the logical execution rather than the thread. Same idea, right scope.

The API is small. There are three things.

[click]
You declare a ContextVar once, at module level, like a global. The default is what you get when nobody has set it.

[click]
You set it. And this is the important word: it binds the value in the current context. Not in a global, not on the thread. We'll unpack what "current context" means in a moment.

[click]
And you get it back.

[click]
The shape is the same as the threading dot local version. Declare in one place, read from anywhere, no passing it through every function. What changes is the thing it's attached to.
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
Three lines change. The `threading.local()` object becomes a `ContextVar`. Reading `_local.user` becomes `user_var.get()`. And writing `_local.user` becomes `user_var.set()`.

[click]
And now each task reads back its own value, across the await. The tasks still take turns in the same order, on the same single thread. But now we get the right answer.

That's the main idea of the `contextvars` module. Next, let's look at how it works inside, because how it works is what tells you where it stops working.
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

<div data-id="ctx-run-line" absolute style="left:490px;top:195px;width:1px;height:1px"></div>
<FancyArrow v-click="2" from="[data-id=handler-def] @ right" to="[data-id=ctx-run-line]" arc="-0.3" />

<div v-click="4" absolute bottom-10 inset-x-0 text-center text-5>

`set()` and `get()` always use **the `Context` you are running in**. 🎯

</div>

<!--
The second concept is the Context itself, the thing every task carries around. Picture it as a dictionary: every context variable in the program, mapped to whatever value it holds right now.

[click]
There is always a current context. Your code is running inside one right now, even if you never created it. `copy_context()` takes a snapshot of that current context, the whole mapping, and gives it back to you as one object.

[click]
And you can run a function inside that snapshot. handler here is nothing special, just an ordinary function that reads the current user. But while it runs inside ctx, every get call sees the values from the snapshot, not from wherever we happen to be standing when we call it.

[click]
You can also read a variable straight out of the snapshot, like a dictionary lookup.

[click]
So when I said `set()` binds a value in "the current context", I meant a `Context` like the mapping on the left. There is always exactly one current context. `set()` writes into it, and `get()` reads from it.

Which leaves exactly one question. When a new task starts, where does its context come from?
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

<div v-click="4" mt-4 grid="~ cols-2" gap-6 text-5>

<div border="~ emerald/40 rounded-lg" p-3 bg-emerald:5>
✅ the task <b>inherits</b> what you set before it started
</div>

<div v-click="5" border="~ rose/40 rounded-lg" p-3 bg-rose:5>
❌ what the task sets <b>never</b> comes back to you
</div>

</div>

<style>
.rule-code { --slidev-code-font-size: 14px; --slidev-code-line-height: 1.5; }
</style>

<!--
Now let's put tasks and contexts together. One rule connects them.

[click]
Here's our fixed example again. The last line is the caller. It calls `gather()`. At that moment, the caller's context has no user set.

[click]
`gather()` creates one task for each request. Each new task gets a copy of the caller's context, taken at that moment.

[click]
Then each task runs `user_var.set(user)` in its own copy. Alice's copy gets "alice", and bob's copy gets "bob".

[click]
So a task starts with everything the caller had set before.

[click]
And what a task sets stays in the task. The caller's context still has no user.
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
So far, we've only used `contextvars` in our own small example. Now let's look at real tools that use it. You've probably used some of them already, without knowing `contextvars` was inside.

[click]
First, request IDs in logs. Many web apps put a request ID in every log line, so you can find all the lines for one request. A common way to do this with Python's standard `logging` module is a `logging.Filter`. The filter calls `get()` on a context variable that holds the current request ID, and adds it to each log record.

[click]
Distributed tracing. OpenTelemetry's context API is contextvars underneath. That's how the current span knows which span it's inside, across awaits, without passing it around.

[click]
Async database sessions. SQLAlchemy can scope a session to the context, so "the current session" means the current task's session.

[click]
And web frameworks. Since Flask version two point two, Flask's `request` lives in a context variable, and Flask-Login's `current_user` is looked up through Flask's context variables too. So the `current_user` in our very first route function was sitting on this all along.

So your stack already depends on it.

[click]
Request IDs in logs is the example you see most often. It's a good example, but a small one. It can make you think `contextvars` is just a logging tool.

It is not. Three of these four have nothing to do with logging. contextvars is much more general than that.
-->

---
layout: statement
---

## Now you know which logical execution you're in.<br>That alone does not fix anything. 🔓

<div mt-8 op70 text-5>

🧠 **logical execution**: one unit of work (a request, a task, a callback), **on any thread**

</div>

<!--
So far, every example asked one question: which logical execution am I in? In other words, whose work am I doing right now? A request, a task, a callback. It's not the thread.

`contextvars` answers that question. But that's all it does. Knowing the answer does not make anything safe.

I learned this the hard way, in a real project. Let me show you that project.
-->

---
layout: section
---

# 🔬 Case study: Stlite

<div mt-4 op70 text-5>
Streamlit in the browser, and one very global variable
</div>

<!--
This is Stlite. It's the project where I hit the wall I just described.
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
Quick introduction, because the architecture is the reason this talk exists.

[click]
Streamlit is a Python framework for building data apps. You write only a Python script. No JavaScript, no HTML, no frontend code at all. And that script becomes a web app.

[click]
Stlite is Streamlit running in the browser, on Pyodide: CPython compiled to WebAssembly.

[click]
And the key word is no server. There's no backend anywhere. The Python interpreter is running inside the browser tab.

[click]
So the entire runtime — the framework, the interpreter, your script — ships as a static web page.
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
Here is an example of a Streamlit app running on Stlite. On the left is all of its source code. `app.py` is a short Streamlit script: a title, a slider, and a chart. `stlite.html` is a static HTML page that loads Stlite and runs `app.py`.

[click]
On the right is that same page, running live inside this slide. When I move the slider, the chart changes.

[click]
And notice what is not there. The whole app is two static files. There is no backend, and no API calls. When I move the slider, Python runs in this tab and draws the chart again.

That's the product. Now let me show you the part that made my life hard.
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
`app.py` was an ordinary script. It has no server code and no main loop. So who runs it?

[click]
The Streamlit runtime does. It is the host. It runs your script in the same Python interpreter, not in a separate process.

[click]
And this part is special to Stlite. Regular Streamlit runs one app per runtime, so it never needs this. But one Stlite runtime can run several apps. So before each run, Stlite prepares the world for that app: it moves to the app's own directory, and sets `HOME` for it.

[click]
So there are two sides. The host calls `os.chdir()`. Your script does not know about any of that. It just opens files with relative paths, like `data.csv`, and expects them to be in its own directory.
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
Here's the setup. Let's go from the outside in.

[click]
Everything runs in the browser. Stlite runs in a Web Worker, and that worker has one JavaScript thread.

[click]
Inside it is Pyodide: one Python interpreter, compiled to WebAssembly.

[click]
And that interpreter has only one thread. The browser environment is single-threaded here, so Python cannot start more threads. This is one of the big limitations of Pyodide.

[click]
On that one thread, there is one event loop.

[click]
And inside that one event loop, a page can run several Stlite apps. Here, three. They are not separated by threads or by processes. They are all tasks on the same loop. Each app has its own home directory, because each app has its own files.

[click]
And here we meet a new kind of value. So far, everything we stored, like the user and the request, lived in our own variables, so we could move it into a context variable. The current working directory and the environment variables are different. Python keeps them for the whole process, not for a thread or a task. There is one current directory and one set of environment variables, and every app shares them.

[click]
So to their developers, these are three separate apps. But there is exactly one of every global thing they need.
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

<div v-click="5" mt-3 text-4 border="~ amber/50 rounded-lg" p-3 bg-amber:5>

⏸️ App A's script **awaits**. The loop runs **App B**, and the host calls `os.chdir("/home/app-b")`.

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

<div v-click="6" mt-3>

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

<div v-click="7" mt-4 text-5>

The host moved to App A's directory. App A **awaited**. The host moved to App B's. 💥

</div>

<style>
.bug-host { --slidev-code-font-size: 15px; --slidev-code-line-height: 1.45; }
.bug-app { --slidev-code-font-size: 15px; }
</style>

<!--
This is what happens when it goes wrong. The code on the left is pseudocode. It is not Stlite's real code, but it does the same thing: it is how the host runs the apps.

[click]
The last line starts the apps. The host runs each app's script as its own task, with `gather()`. Here, App A and App B.

[click]
Inside each task, the host first moves to that app's own directory, and sets `HOME` for it. Each app has its own files there.

[click]
Then it runs the app's script and awaits it. Everything the user's code does happens inside this one line. And that code reads global state, like the current directory, without anyone passing it in.

[click]
Here is App A's script. In Stlite, a script can use `await`. This one first waits for the network, and then reads a CSV file with a relative path, like anyone would. Which file that opens depends on the current directory at that moment.

[click]
While App A's script waits for the network, the event loop runs another task: App B's task, from the same `gather()`. So the host calls `os.chdir()` again, for App B.

[click]
Then App A's script resumes and reads `data.csv`. But the process is now in App B's directory, so the file is not found. The file exists. It is just in a different directory.

[click]
This is the same shape as the `threading.local()` bug from the first half. A value was overwritten during an `await`. But this time a better storage class does not help, because the current directory is shared by the whole process.
-->
---

# Step 1: store each app's directory in a `ContextVar`

```py {*|1-3|5}{maxHeight:'230px'}
home_dir_contextvar: ContextVar[str | None] = ContextVar(
    "home_dir", default=None
)

home_dir_contextvar.set(app_home_dir)
```

<div v-click="2" mt-4 text-5>

Set **when an app is started**, before its script runs. 🚪

</div>

<div v-click="3" mt-6 text-5 border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>

Now any code can get **the directory this task should use**. ✅

</div>

<div absolute bottom-6 left-14 text-4 op60>

Source: <a href="https://github.com/whitphx/stlite/blob/main/packages/kernel/py/stlite-lib/stlite_lib/server/task_context.py" target="_blank">stlite-lib/stlite_lib/server/task_context.py</a>

</div>

<!--
So how do we fix it? Step one: store each app's directory in a context variable.

[click]
Here is the context variable. It holds the home directory of the app that this task belongs to.

[click]
We set it when an app is asked to start, before its script runs. So the task that runs that app's script starts with the right value.

[click]
Now any code, in any function, can get the directory that this task should use.
-->

---
layout: statement
---

## The `ContextVar` knows the right directory.<br>But `os.getcwd()` is still wrong. 🤷

<!--
But this does not fix the bug yet.

The context variable knows the right directory for each task. Any code can read it.

But the process is still in the wrong directory. Nothing we have written so far calls `os.chdir()`.

Knowing the right directory is not the same as being in it. contextvars did its job, and we still have the bug.
-->

---

# Step 2: change the directory, then change it back

<div text-4 op70 mb-2>🎈 the host · <b>simplified</b> pseudocode</div>

```py {*|2|3-5|6|7-8}
@contextmanager
def app_directory(home):
    saved = (os.getcwd(), os.environ.get("HOME"))
    os.chdir(home)
    os.environ["HOME"] = home
    yield
    os.chdir(saved[0])
    os.environ["HOME"] = saved[1]
```

<div v-click="5" mt-4 text-5>

Move in, run, **move back**. The directory is only **borrowed**. 🔁

</div>

<!--
So step two. Now we use that value to change the real directory. Here is a simplified version, as pseudocode.

[click]
It's a context manager. It takes `home`, the directory this app should use. That is exactly the value step one put into the context variable.

[click]
On the way in, it remembers where the process is now. Then it moves to the app's directory and sets `HOME`. These are the same `os.chdir()` and `os.environ` calls as in the `run_app` function.

[click]
Then, at the `yield`, the app's code runs.

[click]
On the way out, it puts back what it found: change a value, then put the old one back. Here the value is process-wide state, not a context variable.

[click]
So the app never owns the directory. It borrows it, and gives it back.
-->

---

# Step 3: do it every time the task resumes

<div text-4 op70 mb-2>🎈 the host · <b>simplified</b> pseudocode</div>

````md magic-move {at:2}

```py
async def run_app(app):
    with app_directory(app.home):
        await exec_script(app.code)
```

```py
class DirectorySyncCoroutineProxy(Coroutine):
    def __init__(self, coro):
        self.iter = coro.__await__()
        self.home = home_dir_contextvar.get()

    def send(self, value):
        with app_directory(self.home):
            return self.iter.send(value)
```

````

<div mt-3 grid>

<div v-click="[1,2]" style="grid-area: 1 / 1" text-5 border="~ rose/40 rounded-lg" p-3 bg-rose:5>

❌ The `with` stays open while App A is **paused** at `await`. App B moves the directory. App A **resumes** in the wrong one.

</div>

<div v-click="3" style="grid-area: 1 / 1" text-5 border="~ sky/40 rounded-lg" p-3 bg-sky:5>

`send()` is what the **event loop** calls to **resume** a coroutine. So **every step** runs in the right directory. 🎯

</div>

</div>

<!--
But where do we use this context manager? This is the part that took me the longest.

The first idea is simple: wrap the whole script in it. Move in, run the script, move back.

[click]
But this does not work. The `with` block stays open while App A's script is paused at an `await`. While it is paused, App B's task runs, and moves the directory to App B's. When App A resumes, nothing moves it back. So we are back to the same bug.

The problem is that a task does not run in one piece. It runs in steps. It runs until an `await` pauses it, and later the event loop resumes it. So we need to move in every time the task resumes, and move back every time it pauses. Is there a place that runs exactly at those moments?

[click]
There is. We wrap the script's coroutine in a proxy. When it is created, it reads the app's directory from the context variable.

[click]
And then `send()`. `send()` is the method the event loop calls every time it resumes a coroutine. It runs one step, until the next `await` pauses it.

So we wrap `send()` in our context manager. Every step of the script runs in its own app's directory, and the directory is put back as soon as the step pauses. Stlite wraps the script's coroutine in this proxy before it creates the task. The real class does the same for `throw()` and `close()`, so errors and cancellation are covered too.
-->

---
plainBackground: true
---

# Two tasks, one directory, no collisions

<div mt-10 grid="~ cols-[8rem_1fr_auto_1fr_auto_1fr]" gap-2 items-center>

<div text-4 op70>the thread runs</div>
<div v-click="1" border="~ violet/50 rounded-lg" p-3 bg-violet:5 text-4 text-center><b>App A</b> · step 1</div>
<div v-click="2" border="~ dashed gray/60 rounded-lg" px-2 py-3 text-4 text-center>⏸️ <code>await</code><br><span op70>→ next task</span></div>
<div v-click="3" border="~ emerald/50 rounded-lg" p-3 bg-emerald:5 text-4 text-center><b>App B</b> · step 1</div>
<div v-click="4" border="~ dashed gray/60 rounded-lg" px-2 py-3 text-4 text-center>⏸️ <code>await</code><br><span op70>→ next task</span></div>
<div v-click="5" border="~ violet/50 rounded-lg" p-3 bg-violet:5 text-4 text-center><b>App A</b> · step 2</div>

<div text-4 op70><code>os.getcwd()</code></div>
<div v-click="1" text-4 text-center><code>/home/app-a</code></div>
<div v-click="2" text-4 text-center op60>put back</div>
<div v-click="3" text-4 text-center><code>/home/app-b</code></div>
<div v-click="4" text-4 text-center op60>put back</div>
<div v-click="5" text-4 text-center><code>/home/app-a</code></div>

</div>

<div v-click="6" mt-10 text-5 text-center>

Each resume **moves in** to its own directory; each <code>await</code> **moves back**.<br>The directory is only ever **borrowed**. 🔐

</div>

<!--
Putting it together, this is what the timeline looks like on that one thread.

[click]
App A's task resumes. The proxy moves the process into App A's directory, and App A's code runs there.

[click]
Then App A's code reaches an `await`. The step ends, so the proxy puts the directory back. The event loop hands the turn to the next task.

[click]
App B's task resumes, and the proxy moves the process into App B's directory.

[click]
App B also reaches an `await`. The directory is put back again, and the turn goes back to App A.

[click]
App A's task resumes for its next step, and the proxy moves the process into App A's directory again.

[click]
So no task owns the process-wide directory. Each task borrows it for one step, and gives it back. That is the closest thing to "a current directory per task" you can build when the process only has one.
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
If you remember one sentence from this talk, this is the one.

contextvars is a mechanism for answering a question. Which logical execution is this?

It does not make anything safe. It doesn't protect process-wide state, and it doesn't keep tasks away from each other. It answers one question, and that answer is useful. But it's all you get.

What you do with the answer is still up to you. In Stlite, we used it to move the directory in and out on every step.
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
threading dot local never broke. What broke is the assumption underneath it, that one thread means one request. Async took that away.

[click]
A `ContextVar` follows the task, not the thread. Each task gets its own copy of the context, so each request sees its own value.

[click]
But `contextvars` only tells you which context you're in. It does not change process-wide state. The current directory and the environment variables are still shared by the whole process.

[click]
So when many tasks need their own version of process-wide state, like the current directory, you borrow it. Move in when the task resumes, and move back when it pauses. Every step, not once per task.

[click]
That's all from me. Thank you very much.
The slides are behind the first QR code, and Stlite is behind the second.
Please come and find me afterwards, I'd love to hear what you're building.
-->

