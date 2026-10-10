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

<!--
I'm Yuichi, whitphx online.

[click]
I build and maintain open source projects in the Python ecosystem.
The one that matters for today is Stlite, which is Streamlit running entirely in the browser.

[click]
And you can find me in all the usual places.
-->

---

# What you'll leave with

<div mt-10 text-6>

<v-clicks>

- 🎯 **What `contextvars` actually solves** — and when `threading.local()` stops being enough
- 🔀 **How a value travels** — across `await`, across tasks, across threads
- 🧱 **Where its limits are** — `contextvars` answers *which* context, not *is it safe*

</v-clicks>

</div>

<!--
OK, so let's get into the talk. Here's a quick overview of where we're going: three things I want you to walk out with.

[click]
First, what problem the `contextvars` module actually solves. It's a small API, but the problem behind it is easy to get wrong.

[click]
Second, how a value you store with `contextvars` moves around your program. Does it go along when your code crosses an await? When it starts a new task? When it hands work to a thread? This is where the surprises live.

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

# A view you've written a hundred times

<div mt-6 grid="~ cols-[1.25fr_1fr]" gap-8 items-center>

<div class="toy-code">

```py {*|10|8|7|*}{'data-id':'toy'}
from flask import Flask
from flask_login import current_user

app = Flask(__name__)

@app.route("/")
def index():
    with open("greeting.txt") as f:
        greeting = f.read()
    return f"{greeting}, {current_user.name}!"
```

</div>

<div flex="~ col" gap-5 text-5>
<div v-click="3" data-id="toy-args" border="~ rose/50 rounded-lg" p-3 bg-rose:5>🚫 <b>no arguments</b></div>
<div v-click="2" data-id="toy-dir" border="~ amber/50 rounded-lg" p-3 bg-amber:5>📁 <b>current directory</b></div>
<div v-click="1" data-id="toy-user" border="~ sky/50 rounded-lg" p-3 bg-sky:5>👤 <b>current user</b></div>
</div>

</div>

<FancyArrow v-click="1" from="[data-id=toy-user] @ left" to="[data-id=toy] .line:nth-child(10) @ right" arc="0.1" />
<FancyArrow v-click="2" from="[data-id=toy-dir] @ left" to="[data-id=toy] .line:nth-child(8) @ right" arc="0.1" />
<FancyArrow v-click="3" from="[data-id=toy-args] @ left" to="[data-id=toy] .line:nth-child(7) @ right" arc="-0.1" color="red" />

<div v-click="4" mt-8 text-5 text-center>

**Who** is asking, and **where** the file is: neither was passed in. 👻

</div>

<style>
.toy-code {
  --slidev-code-font-size: 20px;
  --slidev-code-line-height: 1.6;
}
</style>

<!--
Let me show you a piece of code you've probably written a hundred times. A Flask app with one page. It reads a greeting from a file and says hello to whoever is logged in.

[click]
`current_user` here is the user who sent this request. Flask-Login works it out for us.

[click]
And `open("greeting.txt")` is a relative path. Which file it opens depends on the current working directory.

[click]
Now look at the function itself. `index()` takes no arguments. Nobody passed it the user, and nobody passed it the directory.

[click]
And yet it knows who is asking, and where to look. Both values are just there when the function runs.
-->

---
plainBackground: true
---

# Python is full of "current"

<div mt-8 grid="~ cols-3" gap-4 text-5>

<div v-click="1" border="~ sky/40 rounded-lg" p-4 bg-sky:5>🌐 <b>current request</b><br><span op70 text-4>what was asked</span></div>
<div v-click="2" border="~ sky/40 rounded-lg" p-4 bg-sky:5>👤 <b>current user</b><br><span op70 text-4>on whose behalf</span></div>
<div v-click="3" border="~ sky/40 rounded-lg" p-4 bg-sky:5>💾 <b>current transaction</b><br><span op70 text-4>which session commits</span></div>
<div v-click="4" border="~ sky/40 rounded-lg" p-4 bg-sky:5>⚙️ <b>current runtime</b><br><span op70 text-4>which app is running</span></div>
<div v-click="5" border="~ amber/40 rounded-lg" p-4 bg-amber:5>📁 <b>current directory</b><br><span op70 text-4><code>os.getcwd()</code></span></div>
<div v-click="6" border="~ amber/40 rounded-lg" p-4 bg-amber:5>🌍 <b>current environment</b><br><span op70 text-4><code>os.environ</code></span></div>

</div>

<div v-click="7" mt-8 text-5 text-center>

None of these are function arguments. **They're just… around.** 👻

</div>

<!--
And those two aren't special. Once you start looking, Python code reads a lot of values that were never passed to it as arguments.

[click]
The current request.

[click]
The current user, which we just saw.

[click]
The current database transaction.

[click]
The current runtime, whatever "runtime" means in your system.

[click]
The current working directory, the other one from our example.

[click]
The current environment variables.

[click]
Notice that none of these appear in a function signature. No caller hands them over. Every layer just reaches out and reads them.

Keep an eye on the colours, by the way. The blue ones belong to one logical execution: a request, a task, an app. The orange ones belong to the operating system.
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
.row-offset { height: 36px; }
</style>

<!--
Before any code, let's fix the setting, because the code on the next slide only makes sense in it.

Our example runs on a classic web server. One process, a pool of threads, and each incoming request gets a thread of its own. That thread handles the request from start to finish, and only that request.

[click]
So while alice's request is being handled, Thread 1 belongs to alice. One thread, one request.
-->

---

# The sync answer

<div text-4 op70 mb-2>🧵 on the thread-per-request server</div>

```py {*|1|3-5|7-8|10-11|*}{maxHeight:'340px'}
_local = threading.local()

def handle(request):
    _local.user = request.user
    index()

def current_user():
    return _local.user

def index():
    print(f"Hello, {current_user()}!")
```

<div v-click="5" mt-4 text-5>

Per-thread storage **is** per-request storage here. ✅

</div>

<!--
So on that server, how would you build something like `current_user` yourself?

[click]
The user changes from request to request, so a plain module-level global won't do. On this server, the classic answer is threading dot local: one value per thread.

[click]
At the top of each request, you stash the user on it, and then call the view.

[click]
`current_user()` reads it straight back out.

[click]
And the view is a stripped-down version of our `index()` from before. It still takes no arguments. Nobody passed the user down. It was just there.

[click]
And on this server, that's exactly right. Each thread handles one request, so one value per thread means one value per request. This is not bad code.
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
<div border="~ rose/50 rounded" p-2 bg-rose:5>
<div text-4 mb-1><b>Thread 1</b></div>
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

<div text-4 text-center op80>one thread = one request ✅</div>
<div v-click="2" text-4 text-center op80>one thread = <b>many</b> requests ❓</div>

</div>

<div v-click="3" mt-2 text-center text-5>

In async code, `threading.local()` **no longer means per-request**. 💥

</div>

<style>
.row-offset { height: 36px; }
</style>

<!--
Here's the same picture again, on the left: the thread-per-request server our code was written for. One process, three threads, one request each. Per-thread storage really is per-request storage.

But once we go async, that stops being true.

[click]
And on the right is asyncio. Same one process, the same three requests. But notice the picture has one more layer: the requests are not sitting directly on a thread any more. Each one is wrapped in something called a task, and all three tasks share the single thread, taking turns and interleaving at every await.

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

<div mt-6 grid="~ cols-[1.25fr_1fr]" gap-8 items-start>

<div text-5>

<v-clicks>

- 🙋 **Someone starts it** — your code calls `create_task()` or `gather()`; a web framework does it per request
- 📦 **It wraps one coroutine** — the caller carries on; the task is its own unit of work
- 🔁 **The loop owns them all** — one thread, switching at every `await`

</v-clicks>

</div>

<div v-click="1" border="~ rose/50 rounded-lg" p-3 bg-rose:5>
<div text-4 mb-2><b>the event loop</b></div>
<div flex="~ col" gap-2>
<div border="~ rose/40 rounded" px-2 py-1 bg-white dark:bg-black text-4 text-center>Task · alice's request</div>
<div border="~ rose/40 rounded" px-2 py-1 bg-white dark:bg-black text-4 text-center>Task · bob's request</div>
<div border="~ rose/40 rounded" px-2 py-1 bg-white dark:bg-black text-4 text-center>Task · carol's request</div>
</div>
</div>

</div>

<div v-click="4" mt-8 text-5 text-center>

Three requests, three tasks, **one thread** — taking turns. 🔁

</div>

<!--
So: task. That is the extra layer you just saw on the right of the last slide. Let me be precise about what one is, because the rest of the talk leans on it.

[click]
A task does not appear on its own. Something starts it. Usually that is your code calling create_task, or gather, which makes one per coroutine you hand it. In a web framework it is the framework, starting one per incoming request. Hold onto that, because who started it turns out to matter a lot later.

[click]
What it wraps is a single coroutine. The caller does not wait around. It carries on, and the task becomes its own unit of work with its own lifetime.

[click]
And the event loop owns the whole pile. One thread, running one task at a time, switching between them every time one of them hits an await.

[click]
So: three requests, three tasks, one thread, taking turns. That is the execution model for the rest of the talk. And taking turns is exactly what is about to break our example.
-->

---

# Watch `threading.local()` break

<div mt-4 grid="~ cols-[1.15fr_1fr]" gap-5>

<div>

```py {*|8|4|5|*}{maxHeight:'330px'}
_local = threading.local()

async def index():
    await asyncio.sleep(0.01)
    return f"Hello, {_local.user}!"

async def handle(user):
    _local.user = user
    print(f"{user} sees: {await index()}")

await asyncio.gather(handle("alice"), handle("bob"))
```

</div>

<div v-click="4">

<WindowMockup title="Terminal" dark codeblock>

```shell
alice sees: Hello, bob!
bob sees: Hello, bob!
```

</WindowMockup>

</div>

</div>

<div v-click="5" mt-6 text-5>

**alice** stored her name, **yielded**, and bob overwrote the slot before she came back. 🫠

</div>

<!--
Let me show you the failure, because it's short.

Here's the same app, made async. `handle()` plays the server's part: it's told who the request is from, stores the user, and calls the view. `index()` reads the user back, and it still takes no arguments. Two requests come in, one from alice and one from bob.

[click]
Alice's task stores her name.

[click]
Then `index()` awaits. And that's the moment it hands the thread over to bob's task, which stores his name in the same slot.

[click]
Then alice's task resumes and reads the slot.

[click]
And alice gets greeted as bob. Both lines say bob.

[click]
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
That's exactly what contextvars is.
-->

---

# `ContextVar`: declare, set, get

```py {*|3-5|7|8}{'data-id':'cv'}{maxHeight:'300px'}
from contextvars import ContextVar

user_var = ContextVar(
    "user", default="anonymous"
)

user_var.set("alice")
user_var.get()
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
Three lines change: the declaration, the set, and the get.

[click]
And now each task reads back its own value, across the await. Same interleaving, same single thread, right answer.

That's the whole pitch of the module. Now let's look at what's actually underneath it, because the mechanism is what tells you where it stops working.
-->

---
plainBackground: true
---

# `Context`: what a task carries

<div mt-4 grid="~ cols-[1.05fr_1fr]" gap-8>

<div>

```py {*|3|5|7}{'data-id':'ctxcode'}{maxHeight:'220px'}
from contextvars import copy_context

ctx = copy_context()

ctx.run(handler)

ctx[user_var]
```

</div>

<div flex="~ col" gap-4>

<div border="~ sky/50 rounded-lg" p-4 bg-sky:5>

<div text-4 op70 mb-3>one <code>Context</code></div>

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
    print(user_var.get())
```

</div>

</div>

</div>

<FancyArrow v-click="2" from="[data-id=handler-def] @ left" to="[data-id=ctxcode] .line:nth-child(5) @ right" arc="0.2" />

<div v-click="4" absolute bottom-10 inset-x-0 text-center text-5>

`set()` and `get()` always touch **the one you are running inside**. 🎯

</div>

<!--
The second concept is the Context itself, the thing every task carries around. Picture it as a dictionary: every context variable in the program, mapped to whatever value it holds right now.

[click]
copy_context takes a snapshot of that whole mapping and hands it back to you as one object.

[click]
And you can run a function inside that snapshot. handler here is nothing special, just an ordinary function that reads the current user. But while it runs inside ctx, every get call sees the values from the snapshot, not from wherever we happen to be standing when we call it.

[click]
You can also read a variable straight out of the snapshot, like a dictionary lookup.

[click]
So when I said set binds in "the current context", this box is the thing it means. There is always one of these running, set writes into that one, and get reads from that one.

Which leaves exactly one question. When a new task starts, where does its context come from?
-->

---
plainBackground: true
---

# The rule behind most surprises

<div mt-6 flex="~" items-center justify-center gap-8>

<div data-id="parent" border="~ sky/50 rounded-lg" p-4 bg-sky:5 w-64>
<div text-4 op70 mb-2>the <b>caller's</b> context</div>
<div text-5><code>user_var</code> = <b>"alice"</b></div>
</div>

<div v-click="1" data-id="mid" text-center op80 w-44>
<div text-5><code>create_task()</code></div>
<div text-4 mt-1>copies the context</div>
</div>

<div v-click="2" data-id="child" border="~ violet/50 rounded-lg" p-4 bg-violet:5 w-64>
<div text-4 op70 mb-2>the <b>task's</b> context</div>
<div text-5><code>user_var</code> = <b>"alice"</b></div>
</div>

</div>

<FancyArrow v-click="2" from="[data-id=parent] @ right" to="[data-id=child] @ left" arc="-0.4" />

<div v-click="3" mt-10 grid="~ cols-2" gap-6 text-5>

<div border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
✅ the task <b>inherits</b> what you set before it started
</div>

<div v-click="4" border="~ rose/40 rounded-lg" p-4 bg-rose:5>
❌ what the task sets <b>never</b> comes back to you
</div>

</div>

<!--
So now put the two together. We have tasks, and we have contexts. One rule connects them, and it explains almost every surprise people hit.

[click]
When you create a task,

[click]
the task gets a copy of that context. Not the program's context, not some global one: a snapshot of whoever called create_task, taken at the moment they called it. That is why I made you hold onto who starts a task.

[click]
Which means the task inherits everything you had set before you spawned it. That's the part people expect.

[click]
And it means anything the task sets stays inside the task. It never propagates back out to you. That's the part that surprises people.

That's also why alice and bob each kept their own user a few slides ago. `gather` made a task for each of them, and each task got its own copy.

Copy, not share. Say it once and most of the confusion goes away.
-->

---

# Set it before you spawn it

<div mt-4 grid="~ cols-[1.1fr_1fr]" gap-5>

<div>

```py {*|4|5|2}{maxHeight:'270px'}
async def worker():
    print(user_var.get())

task = asyncio.create_task(worker())
user_var.set("alice")
```

</div>

<div v-click="3">

<WindowMockup title="Terminal" dark codeblock>

```shell
anonymous
```

</WindowMockup>

<div mt-3 text-4 op70>the default — the set never landed</div>

</div>

</div>

<div v-click="4" mt-6 text-5>

Swap the two lines and it prints `alice`. **The snapshot is taken at `create_task()`.** 📸

</div>

<!--
Here's the classic version of that bug.

[click]
We create the task. The snapshot is taken right here, on this line.

[click]
And then we set the value. One line later, and it's already too late.

[click]
So the worker prints the default. The set happened in our context, after the task had already taken its copy.

[click]
The fix is to swap two lines. And that's the whole point: the ordering matters because the copy happens at create_task, not when the task first runs. Set first, then spawn.
-->

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
run_in_executor does not. Same idea, different function, opposite behaviour. Your worker runs on a pool thread with a fresh, empty context, and every get returns the default.

[click]
If you need it, you copy the context yourself and hand run the function. A bit ugly, but explicit.

[click]
I'm not asking you to memorise which function does which. I'm asking you to treat every hop off the event loop as a boundary you go and check. Because the failure is silent. You get the default, not an exception.
-->

---
plainBackground: true
---

# The edges: called from outside Python

<div mt-1 text-4 op70>🌐 Pyodide: Python in the browser, called back by <b>JavaScript</b></div>

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

<div v-click="5" absolute bottom-4 right-10 text-sm op60>Source: <a href="https://github.com/whitphx/stlite/blob/main/packages/kernel/py/stlite-lib/stlite_lib/pyodide_proxy_context.py" target="_blank">stlite-lib/stlite_lib/pyodide_proxy_context.py</a></div>

<!--
There's a second kind of edge: something outside Python calling back in. The edges so far all had a Python caller. A thread pool, to_thread, create_task: something in Python made the call, so there was a context to copy, or to forget to copy.

This is Pyodide, which is CPython compiled to WebAssembly and running in the browser. It's what powers the project in the case study coming up.

Same `handle()` as before, running as its own task. It sets the user and hands a callback to JavaScript. The callback lives at module level, like our `index()`, so nobody gives it the user. It reads the variable. `create_proxy()` wraps the Python function so JavaScript can hold on to it, and `setTimeout()` is the browser's timer. It calls our function one second from now.

[click]
And it prints the default. When JavaScript calls back in, no task is being created and there's no Python caller to copy from. Pyodide just runs the function in whatever context is current at that moment, which is the thread's top-level context. That's the one your module-level code runs in, not the task's copy. The user was set in the task's copy, so it was never in there.

[click]
So we take the copy ourselves. `copy_context()` runs while `handle()` is still handing the callback over, and every call runs inside that snapshot. `.copy()` on a context just makes another one with the same values.

[click]
Now it prints the user. And notice when the copy happened: at the handoff, not when JavaScript calls. By the time JavaScript calls, there's nothing left to copy.

[click]
Why the extra `.copy()`? On the executor slide, we called `copy_context()` fresh for every hop. Here one snapshot is reused for every call, so each call takes its own copy of it. That's the same deal a task gets: its own copy, so whatever one call sets never leaks into the next.

[click]
So the edges go both ways. Leaving the event loop is one. Coming back in from something that isn't Python is the other. A C library, a GUI toolkit, or JavaScript.

And this one was a real bug. Streamlit, the data-app framework, needs its session for every call, and Stlite looked it up from the running task. A JavaScript callback runs in no task, so every Streamlit call from it failed, unless the app attached the session by hand. The fix put the session in a context variable, just like our user, and wraps `create_proxy()` like this. So every callback an app wraps with it runs in the snapshot.
-->

---

# `Token`: putting it back

```py {*|1|3|5}{maxHeight:'220px'}
token = user_var.set("admin")

run_admin_job()

user_var.reset(token)
```

<div mt-6 text-5>

<v-clicks at="4">

- 🔁 **Same task, no copy** — so you put the old value back yourself
- 🧹 **Libraries stay polite** — borrow the variable, hand it back

</v-clicks>

</div>

<!--
One more piece of the API: the Token. Say alice's request has to run one job as admin.

[click]
set doesn't just return None. It gives you back a token, which remembers what the value was before you touched it. Here, that's alice.

[click]
The admin job runs.

[click]
And reset puts alice back.

[click]
Why do you need this, if tasks get their own copy? Because there's no copy here. This is all one task, alice's task, so nothing protects her value except you putting it back.

[click]
And it's how a library borrows a context variable without permanently changing it for the application that called it.
-->

---

# Where you've already met it

<div mt-6 text-6>

<v-clicks>

- 🪵 **Request IDs in logs** — a logging filter that calls `.get()`
- 🔭 **Tracing** — `opentelemetry.context` is `contextvars` underneath; the current span follows your `await`
- 💾 **Async DB sessions** — SQLAlchemy's `async_scoped_session` is scoped to a context
- 🌐 **Web frameworks** — Flask's `request`, and the `current_user` from our first view

</v-clicks>

</div>

<!--
And you've almost certainly used this already, without writing any of it yourself.

[click]
The request id in your log lines. That's a logging filter calling get on a context variable.

[click]
Distributed tracing. OpenTelemetry's context API is contextvars underneath. That's how the current span knows which span it's inside, across awaits, without passing it around.

[click]
Async database sessions. SQLAlchemy can scope a session to the context, so "the current session" means the current task's session.

[click]
And web frameworks. Since Flask 2.2, Flask's `request` lives in a context variable, and Flask-Login's `current_user` is looked up through Flask's context variables too. So the `current_user` in our very first view was sitting on this all along.

And if you use Streamlit, you've met the other side of it. Regular Streamlit keeps that session, the `ScriptRunContext`, on the current thread. If you've ever had to call `add_script_run_ctx()` before a Streamlit call worked from a worker thread, that's state keyed by thread, the shape this talk started from. Stlite moving it into a context variable is the same move we just made: from "which thread am I on" to "which execution am I in".

So it's already load-bearing in your stack.
-->

---
layout: statement
---

## Every example you were *taught* with is a logging filter. 🪵

<!--
But here's what bugs me about how this module gets taught.

Look at that last slide again: three of those four have nothing to do with logging. And yet every tutorial, every blog post, every conference talk teaches the thing with the same example. Request IDs in logs.

And that's a fine example. It's just a small one. It leaves you thinking contextvars is a logging convenience.

It isn't. It's a way to model logical execution, and the rest of this talk is about what that buys you and where it runs out.
-->

---
layout: statement
---

## You know *which* execution you're in.<br>Nothing is safe yet. 🔓

<!--
OK. So at this point we have a working mental model.

Values follow the logical execution. They're copied into tasks. There are edges where you leave the event loop, and where outside code calls back in.

But notice what we actually have. We can answer a question: which logical execution is this? That's it. It's an answer.

Knowing the answer is not the same as anything being safe. And the difference between those two things is where I spent a genuinely unpleasant amount of time in a real project.

Let me show you that project.
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
<img src="/stlite.svg" alt="Stlite" w="220px">
</div>

</div>

<!--
Quick introduction, because the architecture is the reason this talk exists.

[click]
Streamlit is a Python framework for building data apps. You write a script, it becomes a web app.

[click]
Stlite is Streamlit running in the browser, on Pyodide, which you met on the edges slide: CPython compiled to WebAssembly.

[click]
And the key word is no server. There's no backend anywhere. The Python interpreter is running inside the browser tab.

[click]
So the entire runtime — the framework, the interpreter, your script — ships as a static web page.
-->

---

# No backend, just a tab

<WindowMockup title="https://example.com/my-app.html" light>

<div p-4 class="mock-page" flex="~ col" gap-3>
<div text-5 font-bold>🎈 Sales dashboard</div>
<div text-4 op70>Move the slider to filter</div>
<div flex="~" items-center gap-3>
  <div text-4>Threshold</div>
  <div w-60 h-1 bg-gray-300 rounded relative>
    <div absolute left-30 top--1 w-3 h-3 rounded-full class="mock-knob"></div>
  </div>
  <div text-4>42</div>
</div>
<div flex="~ gap-2" items-end h-24>
  <div w-8 h-16 class="mock-bar"></div>
  <div w-8 h-24 class="mock-bar"></div>
  <div w-8 h-10 class="mock-bar"></div>
  <div w-8 h-20 class="mock-bar"></div>
  <div w-8 h-14 class="mock-bar"></div>
</div>
</div>

</WindowMockup>

<div v-click="1" mt-5 text-5 text-center>

The Python that renders this is running **in the page**. There is nothing behind it. 🪄

</div>

<style>
/* `light` pins the frame to white but leaves slot content on the theme's
   text colour: white-on-white in dark mode without this. */
.mock-page { color: #1f2937; }
.mock-bar { background: #36709E; border-radius: 3px 3px 0 0; }
.mock-knob { background: #36709E; }
</style>

<!--
This is roughly what that looks like. An ordinary web page with an ordinary Streamlit app in it.

[click]
And the only thing worth noticing is what isn't there. No API calls, no backend, no deployment. You move the slider, and Python runs in the tab to re-render the chart.

That's the product. Now let me show you the part that made my life hard.
-->

---
plainBackground: true
---

# Many apps, one Python

<div mt-6 flex="~" items-center justify-center gap-24>

<div flex="~ col" gap-3>
<div data-id="appA" border="~ violet/50 rounded-lg" p-3 bg-violet:5 text-4 w-44><b>App A</b><br><span op70>/home/app-a</span></div>
<div data-id="appB" border="~ violet/50 rounded-lg" p-3 bg-violet:5 text-4 w-44><b>App B</b><br><span op70>/home/app-b</span></div>
<div data-id="appC" border="~ violet/50 rounded-lg" p-3 bg-violet:5 text-4 w-44><b>App C</b><br><span op70>/home/app-c</span></div>
</div>

<div v-click="1" data-id="env" border="~ amber/50 rounded-lg" p-5 bg-amber:5 w-80>
<div text-5 mb-2><b>one Python environment</b></div>
<div text-4 op80 flex="~ col" gap-1>
<div>🧵 one thread</div>
<div>⚡ one event loop</div>
<div>📁 one <code>os.getcwd()</code></div>
<div>🌍 one <code>os.environ</code></div>
</div>
</div>

</div>

<FancyArrow v-click="1" from="[data-id=appA] @ right" to="[data-id=env] @ (0%, 25%)" arc="0.1" />
<FancyArrow v-click="1" from="[data-id=appB] @ right" to="[data-id=env] @ (0%, 50%)" arc="0.1" />
<FancyArrow v-click="1" from="[data-id=appC] @ right" to="[data-id=env] @ (0%, 75%)" arc="0.1" />

<div v-click="2" mt-8 text-5 text-center>

Each app is a separate logical runtime. **They all share one interpreter.** 😬

</div>

<!--
Here's the setup.

A page can host more than one Stlite app, and when they share one browser worker they all live together.

[click]
And they share everything. One Python environment. One thread, because the browser gives you one. One event loop. And critically, one current working directory and one set of environment variables, because those belong to the interpreter, not to your app.

[click]
So from Python's point of view these are three logical runtimes, but there is exactly one of every global thing they need.

And each app has its own home directory, because each app has its own files.
-->

---

# Each app wants its own directory

<div mt-6 grid="~ cols-[1.3fr_1fr]" gap-6>

<div>

```py {*|1-2|4-5|7}{'data-id':'dirs'}{maxHeight:'280px'}
os.chdir("/home/app-a")
os.environ["HOME"] = "/home/app-a"

os.chdir("/home/app-b")
os.environ["HOME"] = "/home/app-b"

pd.read_csv("data.csv")
```

</div>

<div flex="~ col" gap-6 text-4 mt-1>
<div data-id="d-a" v-click="1" border="~ violet/50 rounded-lg" p-3 bg-violet:5 text-center><b>App A's</b> script</div>
<div data-id="d-b" v-click="2" border="~ emerald/50 rounded-lg" p-3 bg-emerald:5 text-center><b>App B's</b> script</div>
</div>

</div>

<FancyArrow v-click="1" from="[data-id=d-a] @ left" to="[data-id=dirs] .line:nth-child(1) @ right" arc="0.15" />
<FancyArrow v-click="2" from="[data-id=d-b] @ left" to="[data-id=dirs] .line:nth-child(4) @ right" arc="0.15" />

<div v-click="4" mt-6 text-5>

`os.getcwd()` is **one value, for the whole process**. There is no per-task version. 🌍

</div>

<!--
Why does the directory matter at all?

[click]
Because a Streamlit script is ordinary Python. It opens files with relative paths. App A's files live in app A's directory.

[click]
So App B needs a different one.

[click]
And this line is why it matters. Remember `open("greeting.txt")` in our very first view? Same thing. A user writes read_csv with a relative path, like anyone would. Which file that resolves to depends entirely on the current directory at that instant.

[click]
And here's the wall. There is exactly one current working directory per process. The OS has no concept of "the current directory for this task". You cannot have one per app, because it isn't yours to partition.
-->

---

# So here's the bug

<div mt-4 grid="~ cols-[1.1fr_1fr]" gap-5>

<div>

```py {*|2|3|4}{maxHeight:'280px'}
async def run_app(home):
    os.chdir(home)
    await render()
    return open("data.csv").read()
```

</div>

<div v-click="4">

<WindowMockup title="Terminal" dark codeblock>

```shell
FileNotFoundError:
  '/home/app-b/data.csv'
```

</WindowMockup>

<div mt-3 text-4 op70>…raised by <b>App A</b></div>

</div>

</div>

<div v-click="5" mt-6 text-5>

App A moved to its directory, **awaited**, and App B moved the whole process somewhere else. 💥

</div>

<!--
And this is what it looks like when it goes wrong.

[click]
App A sets the directory it needs.

[click]
Then it awaits. Which hands the thread to App B, which calls chdir for its own directory.

[click]
And when App A resumes, it opens a relative path.

[click]
And gets App B's directory. A file-not-found for a file that exists, in a directory that app never asked about.

[click]
This is the same shape as the threading dot local bug from the first half. Something got overwritten across an await. But this time I can't fix it by choosing a better storage class, because the thing being overwritten belongs to the operating system.
-->

---

# Step 1: remember *which*

```py {*|1-3|5}{maxHeight:'230px'}
home_dir_contextvar: ContextVar[str | None] = ContextVar(
    "home_dir", default=None
)

home_dir_contextvar.set(app_home_dir)
```

<div v-click="2" mt-4 text-5>

Bound at **every entry point** where JavaScript calls into Python. 🚪

</div>

<div v-click="3" mt-6 text-5 border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>

Any code, at any depth, can now ask: **which directory should this task be in?** ✅

</div>

<div v-click="4" mt-4 text-sm op60>

Source: <a href="https://github.com/whitphx/stlite/blob/main/packages/kernel/py/stlite-lib/stlite_lib/server/task_context.py" target="_blank">stlite-lib/stlite_lib/server/task_context.py</a>

</div>

<!--
So step one is the part contextvars handles beautifully.

[click]
One context variable holding the home directory this task belongs to.

[click]
And it gets set at every entry point where JavaScript calls into Python. Every browser event that starts Python work binds it first.

That's the edge from earlier: when JavaScript calls Python, there's no Python caller to copy from. These entry points aren't callbacks we wrap with `create_proxy()`. JavaScript calls them directly, and each call lands in a fresh task with the top-level context, so we bind on entry, every time.

[click]
And now the question "which directory should this task be in" has a correct answer, available anywhere, at any depth, for free.

[click]
This is real code, it's in the repo if you want to read it.
-->

---
layout: statement
---

## `contextvars` gave us the answer.<br>Nobody told the OS. 🤷

<!--
And this is the exact moment the talk turns.

I have a perfect, reliable answer to "which directory should I be in". I can ask for it from anywhere.

And the process is still sitting in the wrong directory, because nothing I've written actually calls chdir.

Knowing is not applying. contextvars did its job completely, and I still have the bug.
-->

---

# Step 2: apply it, then put it back

```py {*|2-3|6-7|10-11|*}{maxHeight:'340px'}
class TaskSpecificDirectoryConfig:
    def __init__(self, home):
        self.wanted = DirectoryConfig(cwd=home, home_dir=home)

    def __enter__(self):
        self.saved = DirectoryConfig(os.getcwd(), os.environ.get("HOME"))
        self._apply(self.wanted)

    def __exit__(self, *excinfo):
        self.wanted = DirectoryConfig(os.getcwd(), os.environ.get("HOME"))
        self._apply(self.saved)
```

<div v-click="4" mt-3 text-5 border="~ amber/40 rounded-lg" p-3 bg-amber:5>

`__exit__` **saves before it restores** — the app may have called `os.chdir()` itself, and that has to survive. 🔁

</div>

<!--
So step two. A context manager that does the applying.

[click]
It is built with the directory this task wants, which is exactly the value step one put into the context variable. That is where the two halves join up.

[click]
On the way in, it writes down where the process currently is, and then moves it to where this task wants to be.

[click]
On the way out, it puts back what it found. This is the Token pattern from the first half, except the thing being saved and restored is the operating system's state rather than a context variable.

[click]
And there's one subtlety I want to call out, because it took me a while.

On the way out, before restoring, it saves the current directory again. Why? Because the app's own code might have called chdir while it was running. That's a legitimate thing for a user script to do. If we just restored blindly, we'd throw away the app's own change, and next time we resume we'd put it back in the wrong place. So the app's move has to survive being suspended.
-->

---

# Around every resume

````md magic-move {at:1}

```py
class TaskSpecificDirectoryConfig:
    def __enter__(self): ...
    def __exit__(self, *excinfo): ...
```

```py
class DirectorySyncCoroutineProxy(Coroutine):
    def __init__(self, coro):
        self.iter = coro.__await__()
        home = home_dir_contextvar.get()
        self._dir = (
            TaskSpecificDirectoryConfig(home)
            if home
            else nullcontext()
        )

    def send(self, value):
        with self._dir:
            return self.iter.send(value)
```

````

<div v-click="2" mt-3 text-5 border="~ sky/40 rounded-lg" p-3 bg-sky:5>

`send()` is what the **event loop** calls to resume a coroutine. Every entry point hands the loop a `DirectorySyncCoroutineProxy(coro)` rather than the bare coroutine — so every step runs in the right place. 🎯

</div>

<!--
But a context manager only helps if something enters it at the right moments. And the right moment is every single time this coroutine gets resumed.

[click]
So: a proxy that wraps the coroutine.

It reads the context variable once, at construction, and builds the directory context manager for that task. Note the nullcontext fallback — if there's no home directory bound, this does nothing at all.

[click]
And then send. send is the method the event loop calls every time it resumes a coroutine. Each await that comes back is a call to send.

So by wrapping send in the directory context manager, every single step of that coroutine runs in its own directory, and the directory is put back the instant it yields.

The real class does the same for throw and close, so exceptions and cancellation are covered too.
-->

---
plainBackground: true
---

# Two tasks, one directory, no collisions

<div mt-10 grid="~ cols-[9rem_1fr_1fr_1fr]" gap-3 items-center>

<div text-4 op70>the thread runs</div>
<div v-click="1" border="~ violet/50 rounded-lg" p-3 bg-violet:5 text-4 text-center><b>App A</b> · step 1</div>
<div v-click="2" border="~ emerald/50 rounded-lg" p-3 bg-emerald:5 text-4 text-center><b>App B</b> · step 1</div>
<div v-click="3" border="~ violet/50 rounded-lg" p-3 bg-violet:5 text-4 text-center><b>App A</b> · step 2</div>

<div text-4 op70><code>os.getcwd()</code></div>
<div v-click="1" text-4 text-center><code>/home/app-a</code></div>
<div v-click="2" text-4 text-center><code>/home/app-b</code></div>
<div v-click="3" text-4 text-center><code>/home/app-a</code></div>

</div>

<div v-click="4" mt-10 text-5 text-center>

Each resume **enters** its own directory; each yield **leaves** it.<br>The global is only ever **borrowed**. 🔐

</div>

<!--
Putting it together, this is what the timeline looks like on that one thread.

[click]
App A gets resumed. The proxy moves the process into A's directory, and A's code runs there.

[click]
Then A hits an await, the directory goes back, and B gets its turn in its own directory.

[click]
And when A comes back for its next step, the proxy moves the process into A's directory again.

[click]
So the process-global directory is never owned by anyone. It's borrowed for the length of one step, and handed back. Which is the closest thing to "a current directory per task" that you can build when the operating system only gives you one.
-->

---
layout: section
---

# ⚠️ Drawing the boundary

<div mt-4 op70 text-5>
The pitfalls, and the one lesson worth taking home
</div>

<!--
Let's pull back out and generalise.
-->

---

# Four things that will bite you

<div mt-6 text-6>

<v-clicks>

- 📸 **Copied at task creation** — set the value *before* `create_task()`, or the task never sees it
- 🧵 **Threads inherit nothing** — `run_in_executor` drops it; `asyncio.to_thread` copies it for you
- 🔇 **The failure is silent** — you get the *default*, not an exception
- 🌍 **Global side effects stay global** — `cwd`, `os.environ`, signal handlers, `locale`

</v-clicks>

</div>

<!--
Four pitfalls. Three of them we've seen.

[click]
The copy happens at task creation, so ordering matters. Set, then spawn.

[click]
Threads inherit nothing on their own. A brand new thread starts with a completely empty context, which is what run_in_executor hands you. to_thread is the exception, and only because it copies the context across for you explicitly.

[click]
And these failures are silent. You don't get an exception, you get the default value. Which means the bug shows up later, somewhere else, as wrong data rather than a crash.

[click]
And the fourth one is the Stlite lesson. Global side effects stay global. The current directory, environment variables, signal handlers, locale. Perfect context handling does not touch any of them.
-->

---
plainBackground: true
---

# Python 3.13+: thread ≠ logical execution

<div mt-8 grid="~ cols-3" gap-4 text-4>

<div v-click="1" border="~ sky/40 rounded-lg" p-4 bg-sky:5>
<div text-5 mb-2>🧠 <b>logical execution</b></div>
<div op80>a task, a request, an app</div>
<div mt-2 op70>partitioned by <b><code>contextvars</code></b></div>
</div>

<div v-click="2" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
<div text-5 mb-2>🧵 <b>the thread</b></div>
<div op80>an OS thread</div>
<div mt-2 op70>partitioned by <b><code>threading.local</code></b></div>
</div>

<div v-click="3" border="~ amber/40 rounded-lg" p-4 bg-amber:5>
<div text-5 mb-2>🌍 <b>the process</b></div>
<div op80><code>cwd</code> · <code>environ</code> · signals</div>
<div mt-2 op70>partitioned by <b>nothing</b></div>
</div>

</div>

<div v-click="4" mt-8 text-5>

Free-threading makes these **three different axes** impossible to keep confusing. 🔪

</div>

<div v-click="5" mt-4 text-5>

And it makes the third column **worse** — real parallel writers to one `os.chdir()`. ⚠️

</div>

<!--
And free-threaded Python sharpens this, which is why it's worth mentioning even though it's new.

There are really three different things here, and we've historically been sloppy about the difference.

[click]
There's the logical execution — a task, a request, an app. contextvars partitions that.

[click]
There's the OS thread. threading dot local partitions that. And for years these two lined up closely enough that people used them interchangeably.

[click]
And then there's the process. The current directory, the environment, signal handlers. And nothing partitions those. There is no per-thread current directory, and there's no per-context one either.

[click]
Free-threading is the build with no GIL, where Python threads finally run in parallel on separate cores. And it is what makes it impossible to keep conflating the first two. Threads now run genuinely in parallel, so "which thread am I on" and "which request am I serving" drift apart in a way you can actually observe.

[click]
And it makes the third column strictly worse. Under the GIL, two tasks fighting over the current directory were at least taking turns. With real parallelism, you have genuinely concurrent writers to a single global. The borrowing trick I showed you gets harder, not easier.
-->

---
layout: statement
---

## `contextvars` tells *you* which context you're in.<br>It never tells the OS. 🧭

<!--
If you remember one sentence from this talk, this is the one.

contextvars is a mechanism for answering a question. Which logical execution is this?

It is not a mechanism for making anything safe. It doesn't protect global state, it doesn't synchronise anything, it doesn't isolate you from other tasks. It answers a question, and answering it correctly is genuinely valuable, but the answer is all you get.

Everything you do with that answer is still your design problem.
-->

---

# Hidden context, or just a parameter?

<div mt-6 text-4>

| | 🧭 hidden context | 📮 explicit parameter |
|---|---|---|
| **Use it when** | every layer needs it, and you don't own the layers | it's part of what the function *does* |
| **Classic fit** | current user, request id, trace span, locale | the user whose data this function loads |
| **You pay in** | invisible in signatures, awkward to test | threading it through everything |
| **Fails by** | silently returning the default | a `TypeError`, right away |

</div>

<div v-click="1" mt-6 text-5>

Ambient state is a **tax on readability**. Charge it only where passing the value is genuinely impractical. 🧾

</div>

<!--
So when should you actually reach for this?

The honest answer is: less often than it's fun to.

Hidden context earns its place when every layer needs the value and you don't own all the layers. The logged-in user has to reach a permission check twenty frames down, through library code you didn't write. You can't thread a parameter through that. Our very first view is the textbook case: Flask calls `index()` for you, and you don't own that call, so the user can't arrive as an argument.

But if the value is part of what the function does — this function loads this user's orders — pass it. Just pass it. Same kind of value, different job.

And look at the bottom row, because I think it's the deciding one. An explicit parameter fails loudly. You forget it, and you find out immediately. Hidden context fails silently, by handing you a default that looks perfectly reasonable.

[click]
So treat ambient state as a tax. It's worth paying sometimes. Just notice that you're paying it.
-->

---

# Key takeaways

<div mt-4 text-5>

<v-clicks>

- 🧵 **`threading.local()` didn't break** — "one thread, one request" did
- 📸 **Copied at task creation** — the rule behind most surprises
- 🧭 **Models *which*, not *safe*** — `cwd` and `os.environ` stay process-wide
- 🔁 **Global API? Borrow it** — apply on entry, restore on exit
- 🏗️ **Building a runtime? The boundary is yours to draw**

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
Context is copied at task creation, not shared. That one rule explains most of the confusing behaviour.

[click]
contextvars models which context you're in. It does not make anything safe. The current directory and the environment are still process-wide, no matter how clean your context handling is.

[click]
So when you have to reconcile a logical context with a global API, you borrow it. Apply on entry, restore on exit, and do that around every resume rather than once per task.

[click]
And if you're building a runtime, or a framework, or an async library — you are the one who decides where your context boundary is. Nobody draws that line for you, and the language will not complain if you draw it wrong.

[click]
That's all from me. Thank you very much.
The slides are behind the first QR code, and Stlite is behind the second.
Please come and find me afterwards, I'd love to hear what you're building.
-->

