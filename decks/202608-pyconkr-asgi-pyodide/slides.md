---
theme: ../../themes/triangle
title: "ASGI on Pyodide: building a web server inside your browser"
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

<h1 text-5xl leading-16>
ASGI on Pyodide
<br>
<small text-3xl op80>Building a web server inside your browser</small>
</h1>

<div mt-12 text-xl op80>
Yuichiro Tachibana (橘 祐一郎) · @whitphx
</div>

<div absolute bottom-8 right-10 text-sm op60>
PyCon Korea 2026 · Aug 15
</div>

<!-- Hi everyone, thanks for coming. Today I want to talk about something that sounds a little weird the first time you hear it — running a web server inside a browser tab. No network, no Uvicorn, just Python running in the page. But here's the thing: this talk isn't really about the browser. It's about what you get when you cut a clean interface — and ASGI is that interface. The browser is just the most extreme place I've taken it. Let me show you. -->

---

<h1>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div class="portfolio" w-130 mt-6 v-click="1">

- <span class="heading">Created</span>: <span class="item"><img src="/portfolio/awesome_emacs_keymap.svg">Awesome Emacs Keymap</span>, <span class="item"><img src="/portfolio/stlite.png">Stlite: In-browser Streamlit</span>, <span class="item">🎈 Streamlit-WebRTC</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio-Lite: Serverless Gradio</span>, <span class="item">🤗 Transformers.js.py</span>
- <span class="heading">Contributed to</span>: <span class="item"><img src="/portfolio/streamlit-mark-color.svg" style="height: 0.8em;">Streamlit</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio</span>
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🌏APAC, 🇪🇺Euro, 🇹🇼TW, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT, <span v-mark.circle.red="2">🇰🇷KR</span></span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item">🐍SciPyData2026</span>

<div absolute top-48 right-0>
<a href="https://github.com/whitphx" target="_blank" rel="noopener noreferrer">
<img src="/github_whitphx.png" alt="GitHub @whitphx" w="400px">
</a>
</div>

</div>

<div absolute left-12 bottom-10 w-min flex="~ gap-1" items-center justify-center v-click="3">
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

<!-- Quick intro. I'm Yuichiro Tachibana, whitphx online. I build and maintain open source projects in the Python ecosystem. The two that matter most for today are Stlite — Streamlit running entirely in the browser — and Gradio-Lite, the same idea for Gradio. Building those runtimes is exactly where this talk comes from. So this isn't a textbook tour of ASGI; it's a report from actually shipping Python web frameworks into unusual places. -->

---

# What this talk is about

<div mt-6 text-2xl>

<v-clicks>

- Your app ⇄ **ASGI** ⇄ Uvicorn
- Solid contract → **either side swappable**
- How far can the *server* side stretch? <span v-click="4" font-bold text-sky-600>Into a browser tab — and beyond</span>

</v-clicks>

</div>

<div v-click="5" mt-8 border="~ sky/50 rounded-lg" p-4 bg-sky:10 text-xl text-center>

**Cut a clean interface → run anywhere something can *call* you.**<br>
<span op80>One FastAPI app · three runtimes · zero changes</span>

</div>

<!-- Here's the whole talk in one slide. When you write a FastAPI app, your code never actually touches the network. Uvicorn does that part, and between your app and Uvicorn there's an interface — ASGI. Now, because that interface is a real, well-specified contract, the two sides are decoupled. Frameworks evolve on one side, servers evolve on the other, and neither needs to know the other's internals. And the question I want to push on today is: how far can you stretch the server side? The answer turns out to be: much further than you'd think. Into a browser tab. And past it. So here's the key message to hold onto: cut a clean interface, and your app runs anywhere something can call it. To prove it, one FastAPI app is going to run on three wildly different runtimes today, without changing a line. -->

---

# Agenda

<div mt-6 text-xl>

<v-clicks>

- 🧩 **The boundary you use every day** — what ASGI already does for you
- ⚡ **ASGI in 90 seconds** — `scope`, `receive`, `send`
- 🌐 **The extreme case** — the same app, running in a browser tab (demo)
- 🛠️ **Building the bridge** — doing Uvicorn's job in ~45 lines
- 🏭 **The production proof** — Stlite & friends
- ☁️ **Full circle** — the same stack on Cloudflare Workers
- 🧭 **When to reach for this** — practical uses & honest limits

</v-clicks>

</div>

<!-- The plan for the next forty minutes. We start with the boundary you already use every day without looking at it. Then a quick ASGI refresher — ninety seconds, just the three words you need. Then the fun part: the same app running in a browser tab, live. Then we build the thing that makes it possible — a bridge that does Uvicorn's job in about forty-five lines of Python. Then the production side: Stlite and Gradio-Lite, where this actually ships. Then we go full circle and run the same stack on Cloudflare Workers. And we close with what this is actually good for, and where it honestly breaks down. -->

---
layout: section
---

# 🧩 The boundary you use every day

<div mt-4 op70>
…without ever looking at it
</div>

<!-- Let's start with the thing you already do, probably every week. -->

---
clicks: 1
---

# You deploy this pair every week

<div class="deploy-grid" mt-4 :class="$clicks >= 1 ? 'revealed' : ''">

<div class="deploy-cell deploy-left">

<div text-sm mb-1>Demo app — <b>ordinary FastAPI</b></div>

```py {*}
import platform, sys
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/runtime")
async def runtime() -> str:
    py = platform.python_version()
    return f"Python {py} on {sys.platform}"
```

</div>

<div class="deploy-cell deploy-right">

<div text-sm mb-1>…and how everyone runs it</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uvicorn main:app
INFO:  Started server process
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

</WindowMockup>

<div mt-4 text-lg>

App: ***what* to answer**<br>
Uvicorn: ***how* requests arrive**

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 24px;
  --slidev-code-line-height: 1.5;
}
.deploy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.deploy-cell {
  min-width: 0;
}
/* Both panes sit at their final width for the whole animation, so nothing
   inside them re-wraps while it moves. The code starts spanning both columns
   and shrinks into one; a code block scrolls rather than re-wraps, so its
   width is the one thing here that is safe to animate. */
.deploy-left {
  width: calc(200% + 1.25rem);
  transition: width 700ms ease;
}
.deploy-grid.revealed .deploy-left {
  width: 100%;
}
.deploy-right {
  position: relative;
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.deploy-grid.revealed .deploy-right {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!-- This is an excerpt from the demo app we'll use all day. It has an endpoint that answers the question "where am I running?" — it reports the Python version and the platform. Completely ordinary FastAPI; if you've written any, this is muscle memory. And on the right, the way everyone runs it: uvicorn app dot main colon app. Done. But notice the division of labor here, because it's the whole talk. Your app defines what to answer. Uvicorn deals with how requests arrive — sockets, HTTP parsing, all of it. Your code and Uvicorn's code never actually touch. Something sits between them. -->

---

# Two ecosystems, one contract

<div grid="~ cols-[1fr_auto_1fr]" gap-4 items-center mt-8 text-center>

<div v-click="1" border="~ violet/40 rounded-lg" p-4 bg-violet:5 data-id="apps">
<div text-2xl>🐍</div>
<b>App frameworks</b><br>
<span op70 text-sm>FastAPI · Starlette · Django<br>Litestar · Quart …</span>
</div>

<div v-click="3" px-2 text-center data-id="asgi">
<div text-2xl op60>⇄</div>
<div text-2xl><b>ASGI</b></div>
<div op70 text-sm mt-1><code>scope</code> · <code>receive</code> · <code>send</code></div>
</div>

<div v-click="2" border="~ sky/40 rounded-lg" p-4 bg-sky:5 data-id="servers">
<div text-2xl>🖥️</div>
<b>Servers</b><br>
<span op70 text-sm>Uvicorn · Hypercorn<br>Daphne · Granian …</span>
</div>

</div>

<div v-click="4" mt-16 text-2xl op90 text-center>

Each side evolves **independently** — nobody coordinates 🤝

</div>

<!-- Between them sits ASGI — the standard interface between an async Python web app and whatever runs it. On one side, the app frameworks: FastAPI, Starlette, Django, Litestar, Quart. On the other, the servers: Uvicorn, Hypercorn, Daphne, Granian. They talk through three things — scope, receive, and send — and we'll unpack those in a minute. But look at what this contract buys the ecosystem: each side evolves without asking the other's permission. Granian showed up, written in Rust, and every existing framework just ran on it. Litestar showed up, and every existing server could serve it. Nobody coordinated anything. That's what a good interface does. And by the way — this idea is much older than async Python. -->

---

# Not a new idea: WSGI walked first

<div mt-2 text-lg>

Same motivation, one standard earlier — **the synchronous era**:

</div>

<div grid="~ cols-[1fr_auto_1fr]" gap-4 items-stretch mt-5>

<div v-click="1" border="~ gray/40 rounded-lg" p-3 bg-gray:5>
<div text-lg>📜 <b>WSGI</b> <span op60 text-sm>— <a href="https://peps.python.org/pep-0333/" target="_blank">PEP 333</a>, 2003</span></div>
<div mt-2 text-sm><code>def app(environ, start_response)</code></div>
<div op80 text-sm mt-1>Flask · Django ⇄ Gunicorn · uWSGI</div>
<div op80 text-sm mt-1><b>One sync call</b> — request → response, done</div>
</div>

<div v-click="2" self-center text-2xl op60>→</div>

<div v-click="2" border="~ sky/40 rounded-lg" p-3 bg-sky:5>
<div text-lg>⚡ <b>ASGI</b> <span op60 text-sm>— 2016–, born from Django Channels</span></div>
<div mt-2 text-sm><code>async def app(scope, receive, send)</code></div>
<div op80 text-sm mt-1>Same decoupling, <b>async events</b></div>
<div op80 text-sm mt-1>WebSockets · streaming · long-lived connections</div>
</div>

</div>

<div v-click="3" mt-6 text-xl op90 text-center>

**One call → a conversation of events**

</div>

<!-- Because this isn't a new idea. Back in 2003 — PEP 333 — Python standardized WSGI, the same contract with the same motivation, for the synchronous world. One function, environ and start_response, and that's why Flask runs on Gunicorn, uWSGI, whatever — twenty years of any framework on any server. But WSGI's shape is one synchronous call per request: request in, response out, done. And that shape simply can't express a WebSocket, or a response that streams over time, or any long-lived connection — there's no place in the contract for "and then, later, another message." So when Django Channels needed exactly those things, ASGI grew out of that work as WSGI's async successor: same decoupling, but the single call became a conversation of events. That's the contract we'll use all day. I won't go deeper into WSGI — the point is just the lineage: this boundary has been earning its keep for two decades. -->

---
layout: statement
---

## We take this decoupling for granted.

<div mt-8 text-2xl op80 v-click="1">

🤔 How far can the **"server" side** be stretched?

</div>

<!-- And honestly? We take this completely for granted. You pick a server off a list, it works, you never think about it again. But if the contract really is solid — if the app truly doesn't know or care who's calling it — then a fun question appears: how far can you stretch the server side before something breaks? That question is the rest of this talk. -->

---
layout: section
---

# ⚡ ASGI in 90 seconds

<div mt-4 op70>
<code>scope</code>, <code>receive</code>, <code>send</code>
</div>

<!-- To answer it, we need to know exactly what the contract says. Ninety seconds, three words. If you know ASGI cold this is a refresher; if you don't, this is genuinely all you need for the rest of the talk. -->

---

# An ASGI app is one async callable

<div mt-2 text-lg>

The entire interface: **one coroutine, three arguments**

</div>

```py {*}{'data-id':'asgi-signature'}
async def app(scope, receive, send):
    ...
```

<div mt-24 grid="~ cols-3" gap-6 text-sm>

<div v-click="1">
<div data-id="ann-scope" border="~ sky/40 rounded-lg" p-3 bg-white dark:bg-black>
📋 <b><code>scope</code></b><br><span op80>connection type · path · headers</span>
</div>
<FancyArrow from="[data-id=ann-scope] @ top" to="[data-id=asgi-signature] .line:nth-child(1) span:nth-child(5) @ bottom" arc="0.2" />
</div>

<div v-click="2">
<div data-id="ann-receive" border="~ violet/40 rounded-lg" p-3 bg-white dark:bg-black>
📥 <b><code>receive()</code></b><br><span op80>async <b>inbox</b> — events from the client</span>
</div>
<FancyArrow from="[data-id=ann-receive] @ top" to="[data-id=asgi-signature] .line:nth-child(1) span:nth-child(7) @ bottom" arc="0.2" />
</div>

<div v-click="3">
<div data-id="ann-send" border="~ emerald/40 rounded-lg" p-3 bg-white dark:bg-black>
📤 <b><code>send()</code></b><br><span op80>async <b>outbox</b> — events to the client</span>
</div>
<FancyArrow from="[data-id=ann-send] @ top" to="[data-id=asgi-signature] .line:nth-child(1) span:nth-child(9) @ bottom" arc="0.2" />
</div>

</div>

<style>
* {
  --slidev-code-font-size: 28px;
  --slidev-code-line-height: 1.5;
}
</style>

<!-- Here's the entire app-facing surface of ASGI. It's one async function taking three things. Scope is a dict that describes the connection — what kind it is, the path, the headers, that sort of metadata. receive is an async callable; you await it to pull the next event from the client — a chunk of request body, for example. And send is an async callable; you await it to push an event out — your response status, your headers, your body. That's it. Think of receive as an inbox and send as an outbox, both async. A server's whole job is to build the scope and to implement receive and send. Remember that sentence. -->

---
clicks: 6
---

# You don't even need a framework

<div class="framework-grid" mt-3 :class="$clicks >= 5 ? 'revealed' : ''">

<div class="framework-cell framework-left">

<div text-sm mb-1>A complete ASGI app — <b>no framework</b></div>

<<< @/samples/raw-asgi/raw_asgi.py py {*|1|2|3-7|8-11|*}

</div>

<div class="framework-cell framework-right">

<div text-sm mb-1>…and Uvicorn serves it, no questions asked</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uvicorn raw_asgi:app
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

<div v-click="6">

```shell
$ curl -i localhost:8000
HTTP/1.1 200 OK
content-type: text/plain

Hello, PyCon KR!
```

</div>

</WindowMockup>

<div v-click="6" mt-3 text-center text-lg leading-tight>🖥️ <b>Whoever calls <code>app(...)</code> = the server</b></div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 22px;
  --slidev-code-line-height: 1.5;
}
.framework-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.framework-cell {
  min-width: 0;
}
/* Both panes sit at their final width for the whole animation, so nothing
   inside them re-wraps while it moves. The code starts spanning both columns
   and shrinks into one; a code block scrolls rather than re-wraps, so its
   width is the one thing here that is safe to animate. */
.framework-left {
  width: calc(200% + 1.25rem);
  transition: width 700ms ease;
}
.framework-grid.revealed .framework-left {
  width: 100%;
}
.framework-right {
  position: relative;
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.framework-grid.revealed .framework-right {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!-- To really demystify it, here's a complete ASGI application with no framework at all. It checks that the connection is HTTP, then sends two events: a response-start with the status and headers, and a response-body with the bytes. That is a whole working web app — and it is worth walking through, because every line is doing something a server cares about. [click] The signature: one async callable, three arguments, exactly the contract we just learned. [click] It checks the connection type, because an ASGI app can be handed HTTP, WebSocket, or lifespan. [click] Then the first event out: response.start, carrying the status and the headers. [click] And the second: response.body, carrying the bytes. Two sends, and the response is complete. [click] So let's run it: I point Uvicorn at it exactly the way I pointed it at FastAPI a few slides ago, and it starts up without complaint. [click] Now curl it — and there's a real HTTP response, headers and all. Uvicorn cannot tell the difference; it never asks what framework this is, because there is no framework. It just calls the callable. One aside for the curious: Uvicorn also logs that the lifespan protocol appears unsupported, because our eleven lines ignore lifespan entirely — our bridge ignores it too, and there is an appendix slide on it if anyone asks. So Starlette and FastAPI, for all their routing and dependency injection and validation, ultimately compile down to exactly this: a callable that reads scope and talks through receive and send. And now flip it around, because this is the sentence the whole talk stands on: whoever calls this function — whoever builds the scope and passes in receive and send — that thing IS the server. By the way, this exact file lives in the slides repo with a test suite, so what you're reading is verified working code. -->

---
clicks: 6
---

# Now a POST — enter `receive`

<div class="post-grid" mt-3 :class="$clicks >= 5 ? 'revealed' : ''">

<div class="post-cell post-left">

<div text-sm mb-1>Same shape — plus the <b><code>receive</code></b> loop</div>

<<< @/samples/raw-asgi/raw_asgi_post.py py {*|4-9|6|8-9|11-13|*}{'data-id':'post-app'}

</div>


<div class="post-cell post-right">

<div text-sm mb-1>…and the body comes back out the other side</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uvicorn raw_asgi_post:app
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

<div v-click="6">

```shell
$ curl -X POST localhost:8000 \
       -d 'hello, PyCon KR'
You said: hello, PyCon KR
```

</div>

</WindowMockup>

<div v-click="6" mt-3 text-center text-lg leading-tight>📥 <b>The body arrives as events</b> — never as a value</div>

</div>

</div>
<div v-click="[2,4]">
<div class="receive-impl" data-id="ann-receive-impl" absolute top-40 right-6 w-88 bg-white dark:bg-black p-3 rounded border="~ violet/50 rounded-lg">
<div text-xs op70 mb-1>…and the other side of it — what a server hands in:</div>

```py
async def receive():
    return {"type": "http.request",
            "body": b"hello, PyCon KR",
            "more_body": False}
```

</div>
<FancyArrow from="[data-id=ann-receive-impl] @ left" to="[data-id=post-app] .line:nth-child(6) @ right" arc="-0.15" />
</div>

<style>
* {
  --slidev-code-font-size: 18px;
  --slidev-code-line-height: 1.5;
}
/* The `*` rule above sets the variable on every descendant, so overriding it
   for the aside has to reach the descendants too. */
.receive-impl,
.receive-impl * {
  --slidev-code-font-size: 13px;
  --slidev-code-line-height: 1.4;
}
.post-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.post-cell {
  min-width: 0;
}
.post-left {
  width: calc(200% + 1.25rem);
  transition: width 700ms ease;
}
.post-grid.revealed .post-left {
  width: 100%;
}
.post-right {
  position: relative;
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.post-grid.revealed .post-right {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!-- That app never touched receive, because a GET has no body to read. So here is the same eleven lines with the third argument doing its job. [click] This block is the whole difference: the request body is not a value sitting in scope, it is a stream you pull. [click] You await receive, and you get one event — and since everyone always wants to see the other side, that is what the server hands in: a plain async callable it closes over the request, returning one http.request event per call. Uvicorn's is fed by its HTTP parser as bytes come off the socket; ours, later in this talk, is fed by a JavaScript value. Same four lines either way. [click] And you keep going until an event comes back with more_body false, because a large upload arrives in pieces and the client is still typing while your handler is already running. That is why receive is an async callable and not a bytes attribute — the body may not exist yet when the app starts. [click] After that it is the send pair you already know, with the body echoed back. [click] Point Uvicorn at it, same as before. [click] POST some bytes, and they come back out. Everything a framework does with request.body or a parsed form starts here, in this loop. And this is the last piece of the contract: scope describes the connection, receive pulls from the client, send pushes back. That is all of ASGI. -->

---
clicks: 3
---

# So what does a framework give you?

<div class="fw-grid" mt-3 :class="$clicks >= 2 ? 'revealed' : ''">

<div class="fw-cell fw-left">

<div text-sm mb-1>FastAPI — routing, validation, docs…</div>

<<< @/samples/fastapi-is-asgi/app.py py {*}

<div v-click="1" mt-3>

<div text-sm mb-1>…and inside FastAPI itself:</div>

```py {*}
class FastAPI(Starlette):
    ...
    async def __call__(
        self,
        scope: Scope, receive: Receive, send: Send
    ) -> None:
        ...
```

<div text-xs op60 mt-1><a href="https://github.com/fastapi/fastapi/blob/master/fastapi/applications.py#L1160" target="_blank">fastapi/applications.py</a></div>

</div>

</div>

<div class="fw-cell fw-right">

<div text-sm mb-1>…and <code>app</code> is <b>still just the callable</b> <span op70>(<code>python -m asyncio</code> allows <code>await</code>)</span></div>

```py {*}
$ python -m asyncio

>>> callable(app)
True
>>> list(inspect.signature(app).parameters)
['scope', 'receive', 'send']

>>> await app(scope, receive, send)
>>> events
['http.response.start',
 'http.response.body']
```

<div v-click="3" mt-3 text-center text-lg leading-tight>

🎁 A framework is a **nicer way to write the same callable**

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 16px;
  --slidev-code-line-height: 1.5;
}
.fw-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.fw-cell {
  min-width: 0;
}
/* Both panes sit at their final width for the whole animation, so nothing
   inside them re-wraps while it moves. The code starts spanning both columns
   and shrinks into one; a code block scrolls rather than re-wraps, so its
   width is the one thing here that is safe to animate. */
.fw-left {
  width: calc(200% + 1.25rem);
  transition: width 700ms ease;
}
.fw-grid.revealed .fw-left {
  width: 100%;
}
.fw-right {
  position: relative;
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.fw-grid.revealed .fw-right {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!-- So if eleven lines is a working app, what is FastAPI for? All the things you actually want: routing, request parsing, validation, dependency injection, generated docs. You write decorated functions instead of dictionaries. [click] And here is why, straight from FastAPI's own source: the class defines __call__ with the ASGI signature, and hands straight through to Starlette. [click] So the thing FastAPI gives you is not some special framework construct that a server has to know about. Ask inspect for its signature and you get exactly three parameters: scope, receive, send. It IS an ASGI application, in the same sense our eleven lines were. You can await it directly, no server anywhere — it returns None, because the response went out through the send callable we passed in, which is precisely the ASGI contract. That's checked by a test in the repo, by the way — it reads the signature off type(app).__call__ and calls the object by hand. [click] So a framework is not a different kind of thing from what we just wrote. It is a much nicer way to write the same callable. Which means anything that can call our eleven lines can call FastAPI too — hold that thought. -->

---
clicks: 6
---

# One request, start to finish

<div grid="~ cols-[1fr_auto_1fr]" gap-2 mt-2 text-sm items-center>

<div text-center text-xs op60 font-bold>🖥️ Server <span op70>(Uvicorn · <code>bridge.py</code>)</span></div>
<div></div>
<div text-center text-xs op60 font-bold>🐍 ASGI application</div>

<div v-click="1" border="~ sky/40 rounded-lg" p-2 bg-sky:8 text-center>builds <code>scope</code><br><span text-xs op70><code>{"type": "http", …}</code></span></div>
<div v-click="1" text-center text-xl op60>→</div>
<div v-click="1" text-xs op80><code>await app(scope, receive, send)</code><br><span op70>one call for the whole request</span></div>

<div v-click="2" text-xs op80 text-right>the app wants the body</div>
<div v-click="2" text-center text-xl op60>←</div>
<div v-click="2" border="~ emerald/40 rounded-lg" p-2 bg-emerald:8 text-center><code>await receive()</code></div>

<div v-click="3" border="~ sky/40 rounded-lg" p-2 bg-sky:8 text-center><code>{"type": "http.request",</code><br><code>"body": b"…", "more_body": False}</code></div>
<div v-click="3" text-center text-xl op60>→</div>
<div v-click="3" text-xs op80>body delivered</div>

<div v-click="4" text-xs op80 text-right>status + headers</div>
<div v-click="4" text-center text-xl op60>←</div>
<div v-click="4" border="~ emerald/40 rounded-lg" p-2 bg-emerald:8 text-center><code>send({"type": "http.response.start"…})</code></div>

<div v-click="5" text-xs op80 text-right>bytes <span op70>(repeat while <code>more_body</code>)</span></div>
<div v-click="5" text-center text-xl op60>←</div>
<div v-click="5" border="~ emerald/40 rounded-lg" p-2 bg-emerald:8 text-center><code>send({"type": "http.response.body"…})</code></div>

<div v-click="6" text-xs op80 text-right>response complete</div>
<div v-click="6" text-center text-xl op60>←</div>
<div v-click="6" border="~ gray/40 rounded-lg" p-2 bg-gray:8 text-center>the coroutine <b>returns</b><br><span text-xs op70>no "done" event — returning <i>is</i> the signal</span></div>

</div>

<div absolute left-6 top-40 text-xs op50 style="writing-mode: vertical-rl">time ↓</div>

<!-- Let's put the three pieces in order, because the sequence is the part people get wrong. The server builds the scope and makes one call — for HTTP, exactly one call carries the whole request. [click] Inside, the app awaits receive when it wants the body. [click] The server answers with an http.request event; more_body false means that is all of it. [click] Then the app pushes its response out through send, in pieces: first response.start with the status and headers. [click] Then one or more response.body events with the bytes — that is where streaming happens, by keeping more_body true. [click] And here is the bit worth correcting if you have imagined this protocol: there is no completion event, no "done" message. The response is finished when the last body event has more_body false, and the request is finished when the coroutine returns. That return is the only completion signal there is — which is exactly why our bridge could just await the app and then read what it had collected. -->

---

# Three connection types, one shape

<div mt-4 text-lg>

`scope["type"]` — three protocols, **one loop**:

</div>

<div grid="~ cols-3" gap-4 mt-6 text-sm>

<div v-click="1" border="~ sky/40 rounded-lg" p-4 bg-sky:5>
<div text-xl mb-1>🌐 <b><code>"http"</code></b></div>
<span op80>request → response</span>
</div>

<div v-click="2" border="~ violet/40 rounded-lg" p-4 bg-violet:5>
<div text-xl mb-1>🔌 <b><code>"websocket"</code></b></div>
<span op80>long-lived, two-way<br>
<span op60>(→ appendix)</span></span>
</div>

<div v-click="3" border="~ amber/40 rounded-lg" p-4 bg-amber:5>
<div text-xl mb-1>♻️ <b><code>"lifespan"</code></b></div>
<span op80>startup / shutdown<br>
<span op60>(→ appendix)</span></span>
</div>

</div>

<div v-click="4" mt-8 text-center text-xl>

Today: **`http`** — it carries the whole idea ✅

</div>

<!-- ASGI carries three kinds of connection, and the app figures out which one by reading scope type. The nice part is they all share the same receive-and-send loop, so once you understand one, the others are variations. HTTP is request-response. WebSocket is the long-lived two-way one — same loop, different event names. And lifespan is the odd one — it's not a client connection at all, it's the app's own startup and shutdown signal. Now, to keep this talk focused, I'm going to do everything through HTTP. WebSocket and lifespan work the same way in spirit, and I've put both in appendix slides at the end — happy to walk through them in Q&A. HTTP alone carries the whole idea. -->

---
clicks: 1
---

# Demo, step 1: the normal case

<div class="demo-grid" mt-3 :class="$clicks >= 1 ? 'revealed' : ''">

<div class="demo-cell demo-left">

<div text-sm mb-1><code>main.py</code> <span op70>— the demo app (abridged)</span></div>

```py {*}
app = FastAPI()

@app.get("/")
async def index() -> str:
    return PAGE

@app.get("/api/runtime")
async def runtime() -> str:
    return f"Python {py} on {sys.platform}"
```

</div>

<div class="demo-cell demo-right">

<div text-sm mb-1>…run it, open the page, click the button</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uv run uvicorn main:app
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

</WindowMockup>

<div mt-3>

<WindowMockup title="http://127.0.0.1:8000" light>

<div p-3>
<div text-base font-bold mb-2>Runtime</div>
<button border="~ gray/40 rounded" px-2 py-1 text-xs bg-gray:10>Where am I running?</button>
<div mt-2 font-mono text-sm>Python 3.12 on <b>darwin/arm64</b> 🖥️</div>
</div>

</WindowMockup>

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 22px;
  --slidev-code-line-height: 1.5;
}
.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.demo-cell {
  min-width: 0;
}
/* Both panes sit at their final width for the whole animation, so nothing
   inside them re-wraps while it moves. The code starts spanning both columns
   and shrinks into one; a code block scrolls rather than re-wraps, so its
   width is the one thing here that is safe to animate. */
.demo-left {
  width: calc(200% + 1.25rem);
  transition: width 700ms ease;
}
.demo-grid.revealed .demo-left {
  width: 100%;
}
.demo-right {
  position: relative;
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.demo-grid.revealed .demo-right {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!-- Here's the app itself — step one of three. It's a handful of FastAPI routes: one serves the page, one reports where Python is running, one bumps a counter so we have some in-process state to watch. Nothing you haven't written before. [click] And here it is in its natural habitat: uvicorn main:app, open localhost:8000, and there's a little page with a button. Click it, and the app answers: Python 3.12 on darwin arm64 — my laptop. A real HTTP request went over a real socket to a real server process. Nothing surprising. All of this is in the slides repo, if you want it — one FastAPI app and the three ways we're going to run it today. Keep the button in mind. Its answer is about to get weird. -->

---

# What's actually running where — step 1

<div mt-6>

<ServerStackFigure />

</div>

<div v-click="1" mt-4 text-center text-xl>

The server half = **Uvicorn**. Watch that box 👀

</div>

<!-- Before we break anything, let's map what just happened, top-down. At the top, your app — main.py. Below it, Uvicorn, doing the whole server half: it accepts TCP connections, parses the HTTP bytes, builds a scope, and calls the app with scope, receive, and send — the interface we just learned. Both live in a CPython process on some machine. And at the bottom, the browser page, talking to it over the actual network. Completely ordinary. But keep your eye on Uvicorn's box — the sky-blue one — because the entire rest of this talk is about what else can sit in it. -->

---
layout: statement
---

## The contract has no sockets in it.

<div mt-8 text-2xl op80>

<v-clicks>

A **server** is anything that can build a `scope` and call the app.

🤔 So… do we even need a server *machine*?

</v-clicks>

</div>

<!-- But wait. Look back at what the contract actually said. A dict. Two async callables. Nowhere — nowhere — does ASGI mention sockets, or ports, or processes, or Linux. Which means a "server" is anything that can build a scope and call the app. Anything. And once you say it like that, a slightly unhinged question becomes very reasonable: do we even need a server machine? -->

---
layout: section
---

# 🌐 The extreme case

<div mt-4 op70>
A server inside your browser
</div>

<!-- Let's find out, by taking the server side somewhere it very obviously does not belong: inside the browser. -->

---

# The enabler: Pyodide

<img src="/pyodide-logo.svg" alt="Pyodide" absolute top-10 right-12 h-16 />

<div mt-4 text-lg>

[Pyodide](https://pyodide.org/): **CPython compiled to WebAssembly** — real Python, in a browser tab

</div>

<div grid="~ cols-[2fr_1fr]" gap-8 mt-6 items-center>

<div>

<v-clicks>

- No backend, no install — **just a web page**
- Python ⇄ JavaScript, direct calls
- `asyncio` on the browser's event loop
- ⚠️ **Single thread** · no sockets

</v-clicks>

</div>

<div v-click="5" border="~ gray/40 rounded-lg" p-3 bg-gray:5 text-center>
<div text-xs op70 mb-2>Browser tab</div>
<div border="~ violet/40 rounded" p-2 bg-violet:5 text-sm>🐍 Pyodide<br><span text-xs op80>CPython on WASM</span></div>
<div text-xl op50 my-1>⇅</div>
<div border="~ sky/40 rounded" p-2 bg-sky:5 text-sm>🌐 JavaScript / DOM</div>
</div>

</div>

<div absolute bottom-3 right-4 text-xs op40>
Pyodide logo by the Pyodide project, CC BY 4.0
</div>

<!-- One slide on the enabler, because it deserves at least that. Pyodide is CPython — the real thing — compiled to WebAssembly, so it runs inside a browser tab. asyncio works. You can install pure-Python packages with micropip. Python and JavaScript can call each other directly, and Python's event loop rides on the browser's. One constraint to remember: single interpreter, single thread, and no sockets — the browser sandbox doesn't hand those out. Keep those four facts in mind — every one of them comes back later. -->

---

# Python, called from JavaScript

<div mt-1 text-sm>The whole boundary in one file — Python source as a <b>string</b>, the value comes back:</div>

<<< @/samples/pyodide-hello/hello.mjs js {*|1,3|5-9|11|*}

<div v-click="4" mt-2>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ node hello.mjs
Python 3.13.2 on emscripten
```

</WindowMockup>

</div>

<style>
* {
  --slidev-code-font-size: 16px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- Concretely, what does calling Python from JavaScript look like? This is the whole thing. Import loadPyodide, await it — that downloads the WebAssembly build and starts an interpreter. Then runPythonAsync takes Python source as a plain JavaScript string; here I import sys and evaluate an f-string. And the last expression's value comes straight back across the boundary as a JavaScript string, which I can just console.log. [click] Run it with node, and there it is: Python 3.13.2 on emscripten — emscripten being the WebAssembly platform, which is Python telling us it is not on your operating system any more. That is the entire trick the rest of this talk builds on: JavaScript can start Python, hand it code, and get values back. -->

---
clicks: 4
---

# So… can we just call our app?

<div grid="~ cols-2" gap-8 mt-2>

<div>

<div v-click="1">

Now we can reach **`app`** from JavaScript:

```js
const { app } = pyodide.pyimport("main");
```

</div>

<div v-click="2" mt-6>

And JavaScript already speaks HTTP, with **`fetch`**:

```js
const res = await fetch("/api/runtime", {
  method: "GET",
});
```

</div>

</div>

<div v-click="3">

So if we had **our own `fetch`**, the page could call the Python app directly:

```js
async function asgiFetch(url, options) {
  ...

  await app(scope, receive, send);

  ...
  return response;
}
```

</div>

</div>

<div v-click="4" absolute bottom-5 inset-x-0 flex justify-center>
<div border="~ red/50 rounded-lg" px-6 py-3 bg-white dark:bg-black text-center>
<div text-2xl>🕳️ missing: <b>HTTP request</b> → <b>ASGI call</b></div>
<div mt-1 op80>on a server, that’s <b><code>uvicorn</code></b> · in Pyodide, <b>nobody</b></div>
</div>
</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.5;
}
</style>

<!-- So let us line up what we have. [click] Pyodide hands us the app object — one pyimport, and the FastAPI app from step one is sitting in a JavaScript variable. [click] And the page already knows how to speak HTTP: fetch is right there, and every frontend in the world is written against it. [click] So put those together. If we had our own fetch — same signature, same Request in, same Response out — but instead of going to the network, it called our app the way ASGI says to call it, then the frontend would not know the difference. That is the whole design. And you can see the hole in the middle of it: scope, receive and send do not exist yet. Nobody builds them. [click] So let me name the missing piece precisely, because it is the whole problem. On a server, a request comes off the network as HTTP bytes, and something turns those bytes into an ASGI call — builds the scope dict, implements receive and send, awaits the app. That something is Uvicorn. Simplifying a little, that translation layer is exactly what does not exist in Pyodide. There is no Uvicorn in a browser tab, so nobody turns a request into an ASGI call. That, and only that, is what we are missing. -->

---
layout: statement
---

## No Uvicorn in the tab.<br>**So let's write that layer ourselves.** 🛠️

<div mt-8 text-2xl op80 v-click="1">

It's small enough to read in a talk ✍️

</div>

<!-- Which is, honestly, the fun part. Nobody has written that translation layer for the browser, so we are going to write it. [click] And the reason I can put it on slides at all is that it is small — small enough to read end to end in the next few minutes. -->

---
layout: section
---

# 🛠️ Building the bridge

<div mt-4 op70>
Doing Uvicorn's job, one piece at a time
</div>

<!-- Here is the how. Nobody has written that server for us, so we are going to write it — this is the heart of the talk. Everything on the next few slides is real code from the demo repo — bridge.py, slightly trimmed for the screen. -->

---

# The one function we have to write

<div mt-2 text-lg>

`bridge.py` — request in, **one ASGI call**, response out:

</div>

```py {*}{'data-id':'skeleton'}
async def dispatch(app, request):
    ...

    await app(scope, receive, send)

    ...

    return response
```

<div v-click="1">
<div data-id="ann-before" absolute top-36 right-6 w-56 bg-white dark:bg-black p-2 rounded border="~ sky/50 rounded-lg" text-sm>

① the **`scope`** · ② **`receive`** + **`send`**

</div>
<FancyArrow from="[data-id=ann-before] @ left" to="[data-id=skeleton] .line:nth-child(2) @ right" arc="-0.05" />
</div>

<div v-click="2">
<div data-id="ann-after" absolute top-66 right-6 w-56 bg-white dark:bg-black p-2 rounded border="~ emerald/50 rounded-lg" text-sm>

③ collect what the app **sent**

</div>
<FancyArrow from="[data-id=ann-after] @ left" to="[data-id=skeleton] .line:nth-child(6) @ right" arc="0.05" />
</div>

<div v-click="3" absolute bottom-12 inset-x-0 text-xl text-center>

Fill in the blanks and you have **a server** 🛠️

</div>

<style>
* {
  --slidev-code-font-size: 22px;
  --slidev-code-line-height: 1.5;
}
</style>

<!-- So here is the shape of the thing we have to write, and it is one function. It takes the app and a request, and somewhere in the middle it makes the one ASGI call we spent the whole last section on: await app with scope, receive, send. [click] Everything before that call is the server's homework — build the scope dict, and implement receive and send. [click] Everything after it is collecting what the app pushed out through send and handing it back. [click] That is genuinely all a server is, once someone else owns the sockets. So let's fill in the blanks, in that order. -->

---

# ① Turn the request into a `scope`

<div mt-1 text-lg>

From `bridge.py` — JS request → **the dict ASGI specifies**:

</div>

```py {*|3|6-8|10-11|*}
async def dispatch(app, request):
    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "method": request["method"],
        "scheme": "http",
        "path": request["path"],
        "raw_path": request["path"].encode(),
        "query_string": request["query"].encode(),
        "headers": [(k.lower().encode(), v.encode()) for k, v in request["headers"]],
    }
```

<div v-click="5" mt-3 text-lg text-center>

Filling this dict correctly **is** what "implementing the server" means

</div>

<style>
* {
  --slidev-code-font-size: 16px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- Step one: build the scope. JavaScript handed us a plain object — method, path, query, headers. Our job is to reshape it into the dict the spec describes. Most of it is mechanical: the type is the string http, the method and path come straight across. But look at the details, because this is where the spec stops being abstract. The path is a str while the query string is bytes. Headers are not a dict — they're a list of two-byte-string tuples, with the names lowercased. ASGI is picky about every one of these. And that pickiness is the point: filling this dict correctly is what implementing the server actually means. You never learn this from using FastAPI. You learn it the moment you stand on the other side of the contract. -->

---

# ② Wire up `receive` and `send`

<div mt-1 text-lg>

`receive`: **body in** · `send`: **response out**

</div>

```py {*|1-3|5-11|*}{maxHeight:'330px','data-id':'wire-up'}
    async def receive():
        return {"type": "http.request",
                "body": request_body, "more_body": False}

    status, headers, chunks = None, [], []
    async def send(event):
        nonlocal status, headers
        if event["type"] == "http.response.start":
            status, headers = event["status"], event["headers"]
        elif event["type"] == "http.response.body":
            chunks.append(bytes(event.get("body", b"")))
```

<div v-click="3" mt-3 text-center text-lg>

An **inbox** and an **outbox** — that's the whole server side 📥📤

</div>

<style>
* {
  --slidev-code-font-size: 18px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- Step two: the two callables. receive is how the app asks for the request body — we hand back one http.request event carrying the bytes JavaScript gave us, more_body false, and if the app asks again we tell it the client's gone. [click] send is the reverse: the app emits its response in pieces — first http.response.start with the status and headers, then http.response.body events with the bytes. We don't interpret any of it; we just listen and stash. [click] And that is the whole server side of the contract: an inbox the app pulls from, an outbox it pushes to. Two closures over a few local variables. -->

---

# ③ Run the app, return the response

<div mt-1 text-lg>

**One call** — then collect what `send` gathered:

</div>

```py {*|1|2-3|*}{'data-id':'run-app'}
    await app(scope, receive, send)
    response = {"status": status, "headers": headers, "body": b"".join(chunks)}
    return response
```

<div v-click="3">
<div data-id="ann-server" mt-10 w-max mx-auto text-xl text-center>

`scope` + `receive` + `send` + `await app(...)` = **a server**

</div>
<FancyArrow from="[data-id=ann-server] @ topleft" to="[data-id=run-app] .line:nth-child(1) span:nth-child(2) @ bottom" arc="0.3" color="red" />
</div>

<style>
* {
  --slidev-code-font-size: 17px;
  --slidev-code-line-height: 1.6;
}
</style>

<!-- And here is the punchline the whole section was walking towards, and it is one line. [click] Await the app, with our scope, our receive, our send. That is the call. Everything on the last three slides existed to make those three arguments. [click] When the coroutine returns, the response is already sitting in the variables send filled in — status, headers, and the body chunks joined together — so we package them up and hand them back to JavaScript. [click] And that is the whole thing. A scope, a receive, a send, and one await. No sockets, no HTTP parsing, no port, no process. Just a function that fulfills a contract. -->

---

# ④ Call it from JavaScript

<div mt-1 text-sm><code>main.js</code> — <code>pyimport</code> is Python's <code>import</code>, spelled in JavaScript:</div>

<<< @/samples/runtime-agnostic-asgi-app/step2-browser/main.js#slide-call js {*}

<div mt-2 text-sm>…and <b>our own <code>fetch</code></b>, which answers out of Pyodide instead of the network:</div>

<<< @/samples/runtime-agnostic-asgi-app/step2-browser/main.js#slide-fetch js {1-3,6,9-13|1,9-13|6|*}{'data-id':'dispatch-js'}

<div v-click="[1,2]">
<div data-id="ann-sig" absolute top-40 right-4 w-52 bg-white dark:bg-black p-2 rounded border="~ teal/60 rounded-lg" text-sm>

`fetch()`'s exact shape — **`Request` in, `Response` out**

</div>
<FancyArrow from="[data-id=ann-sig] @ left" to="[data-id=dispatch-js] .line:nth-child(1) @ right" arc="-0.15" />
<FancyArrow from="[data-id=ann-sig] @ bottom" to="[data-id=dispatch-js] .line:nth-child(9) @ right" arc="0.25" />
</div>

<div v-click="3">
<div data-id="ann-ffi" absolute bottom-4 right-4 w-52 bg-white dark:bg-black p-2 rounded border="~ amber/60 rounded-lg" text-sm>

**Pyodide's FFI** — values get converted <span op70>(→ appendix)</span>

</div>
<FancyArrow from="[data-id=ann-ffi] @ top" to="[data-id=dispatch-js] .line:nth-child(5) @ right" arc="0.2" color="red" />
<FancyArrow from="[data-id=ann-ffi] @ left" to="[data-id=dispatch-js] .line:nth-child(7) @ right" arc="0.2" color="red" />
</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- Fair question at this point: we've written Python, but who calls it? This is the JavaScript side, on the page itself. pyimport is the Python import statement, spelled in JavaScript: it hands back the module, and destructuring pulls out the app and our dispatch function as ordinary JavaScript values. And the thing we wrap them in is asgiFetch — the function we sketched before the section started. [click] Look at its two ends, because they are the whole design. It takes input and init, exactly what fetch takes, and it returns a Response, exactly what fetch returns. Anything on the page that can call fetch can call this instead and never notice. [click] In between is the line that matters, the only one on this slide I would ask you to remember: dispatch(app, pyRequest). Calling Python is just calling a function, and because dispatch is a coroutine, JavaScript awaits it exactly like a Promise. [click] Now the two lines I greyed out. Because we are sitting on Pyodide's foreign function interface, values do not cross for free: toPy turns the JavaScript object into a Python one on the way in, and toJs turns the response dict back on the way out. I have an appendix slide on what that costs and where it bites — ask me in Q&A. One more production note: running Python on the page's main thread blocks rendering, so real apps move it to a Web Worker; the bridge is identical, and there is a step-2b variant in the repo. Stlite does exactly that, as you'll see in a minute. -->

---
layout: statement
---

## `bridge.py`: ~45 lines.<br>The app **never noticed**.

<div mt-8 text-2xl op80 v-click="1">

Does it actually run? **Let's watch it.** 👀

</div>

<!-- So step back and look at what we built. Forty-five lines of Python. No sockets, no HTTP parsing, no server process — and a full FastAPI app is supposed to run on top of it, completely unaware that anything unusual is happening. That is the claim. Let's go see whether it holds. -->

---

# Demo, step 2: the same app, no server

<div mt-2 flex justify-center>

<WindowMockup title="Live demo" light w-160>

<div p-5 text-lg>

<v-clicks>

- 📄 Static page + Pyodide + **the same `main.py`**
- 🖱️ "Where am I running?" → `Python 3.14 on emscripten/wasm32` 🤯
- 🕵️ Network tab: **silent**
- ✂️ Kill the file server → **still answering**

</v-clicks>

</div>

</WindowMockup>

</div>

<div v-click="5" mt-4 text-center text-xl>

Responses made **inside the tab** — nothing leaves it.

</div>

<!-- OK, live demo time — step two. [DEMO] I have a static page here, served by a dumb file server — no backend logic at all. It boots Pyodide right there on the page and loads the exact same main.py from step one. Same page appears. Now I click the button… and look at the answer: Python 3.14 on emscripten wasm32. That's the app telling us it's running inside the browser. Watch the Network tab while I click again — nothing. No request leaves the page. And for the finale: I kill the file server entirely… and the app keeps answering. There is no server anymore. The response is being produced by Python running right next to the JavaScript, in the same tab — by the forty-five lines you just read. OK — back to slides.

[DEMO SETUP] Serve the repo root, not step2-browser/ — the page loads ../main.py by relative fetch, and from inside the subdirectory that path falls outside the document root and Pyodide never boots. Open /step2-browser/. Also let Pyodide finish booting before killing the file server; the runtime and packages come from the CDN, but main.py and bridge.py come from that server. -->

---
clicks: 1
---

<h1>What’s actually running where — step <span class="step-swap"><span :class="$clicks >= 1 ? 'op0' : ''">1</span><span class="step-two" :class="$clicks >= 1 ? '' : 'op0'">2</span></span></h1>

<StackCompare mt-4 :columns="[
  { key: 'server', label: '① Server' },
  { key: 'browser', label: '② Browser', hidden: $clicks < 1 },
]">
  <template #server><ServerStackFigure /></template>
  <template #browser><BrowserStackFigure /></template>
</StackCompare>

<div class="punchline" mt-4 text-center text-xl :class="$clicks >= 1 ? 'op100' : 'op0'">

One box swapped — **the bridge plays Uvicorn's role** 🛠️

</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
.step-swap {
  position: relative;
  display: inline-block;
}
.step-swap > span {
  transition: opacity 700ms ease 250ms;
}
.step-swap > .step-two {
  position: absolute;
  left: 0;
}
</style>

<!-- Here's the step-one picture again — app on top, Uvicorn as the server half, the page at the bottom, over the network. Now watch. [click] The browser version fades in next to it. Compare them layer by layer, top-down: the app — same file, unchanged, byte for byte. scope, receive, send — same interface. The page at the bottom — same UI, still issuing ordinary requests. The differences: the machine became the browser tab running Pyodide, the network became a plain function call… and Uvicorn's sky-blue box now holds bridge.py, about forty-five lines of our code. That's the whole trick — one box swapped, and the bridge is playing Uvicorn's role. Keep this top-down layering in mind; we'll see it again with Streamlit later. -->

---
layout: statement
---

## Something in that tab is<br>**doing Uvicorn's job**.

<div mt-8 text-2xl op80 v-click="1">

But a tidy demo is not proof. 🧐<br>Does the contract survive a **real framework**?

</div>

<!-- So that's the trick, stated honestly: something in that tab is doing Uvicorn's job — and that something was small enough to read in a talk, which is the part I find genuinely lovely. But let's be honest with ourselves: a demo app with three endpoints is a tidy little world. Real frameworks are messy. Static files, sessions, realtime updates, state everywhere. Does the contract survive contact with one of those? -->

---
layout: section
---

# 🏭 The production proof

<div mt-4 op70>
Streamlit in the browser
</div>

<!-- It does — and I can say that with some confidence, because I've shipped it. Twice. -->

---

# First: what is Streamlit?

<div grid="~ cols-[1fr_1fr]" gap-6 mt-3 items-start>

<div>

<div text-sm mb-1>Pure Python — <b>no HTML, no JS, no frontend build</b>:</div>

<<< @/samples/streamlit-demo/app.py py {*}{maxHeight:'200px'}

<div v-click="1" mt-2>

<WindowMockup title="localhost:8501" light padding="0.4rem">

<img src="/streamlit-demo.png" alt="The demo app running: a Sales dashboard title, a Rows slider, and a line chart" style="max-height: 168px; width: auto;" />

</WindowMockup>

</div>

</div>

<div v-click="2" class="w-full text-sm">

<div class="border border-gray-400/40 rounded-xl p-2 bg-gray-400/5">
<div class="text-center text-xs op60 mb-1">🖥️ Server machine — CPython</div>
<div class="border border-emerald-400/40 rounded-lg p-2 bg-emerald-400/10 text-center leading-tight">
🐍 <b>Your script</b><br><span class="text-xs op80">the code above</span>
</div>
<div class="text-center text-xs op60 my-0.5">⇅</div>
<div class="border border-violet-400/40 rounded-lg p-2 bg-violet-400/5 text-center leading-tight">
🎈 <b>Streamlit server</b><br><span class="text-xs op80">a Python HTTP server</span>
</div>
</div>

<div class="text-center text-xs op60 my-0.5">⇅ HTTP + WebSocket</div>

<div class="border border-gray-400/40 rounded-xl p-2 bg-gray-400/5">
<div class="text-center text-xs op60 mb-1">🌐 Browser</div>
<div class="border border-teal-400/40 rounded-lg p-2 bg-teal-400/10 text-center leading-tight">
📄 <b>Bundled SPA</b><br><span class="text-xs op80">shipped inside the package</span>
</div>
</div>

<div v-click="3" mt-6 text-center text-lg>

`pip install streamlit` ships<br>**the server *and* its frontend**<br>
<span text-base op80>the same shape as our demo app 👀</span>

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.5;
}
</style>

<!-- Before I show you Stlite, thirty seconds on what Streamlit actually is, because the architecture is the part that matters today. You write a plain Python script — that's it. No HTML, no JavaScript, no frontend build step. Call st.title, st.slider, st.line_chart, and [click] you get this — an interactive dashboard, and dragging that slider re-runs the script and redraws the chart. [click] So how does a script become a web page? When you run streamlit run, it starts an HTTP server, written in Python, in your process. That server hands the browser a JavaScript single-page app — and that frontend isn't something you built or fetched from a CDN, it's shipped inside the pip package. The SPA then talks back to the Python server over HTTP and a WebSocket. [click] That's the part I want you to hold onto: one Python package contains both halves of a web application — the server and the frontend it serves. And look at the picture — your code on top, a Python HTTP server under it, a frontend page in the browser talking over the network. That's exactly the shape we spent the first half of this talk taking apart. Which raises the obvious question: if we could move our demo app's server into the browser, could we do it to this one? -->

---

# What are these frameworks built on?

<div mt-2 text-sm>

| Framework | Server stack |
| --------- | ------------ |
| Streamlit | Starlette — **ASGI** <span op70>(since 1.57)</span> |
| Shiny for Python | Starlette — **ASGI** |
| marimo | Starlette — **ASGI** |
| Panel (HoloViz) | Bokeh / Tornado |
| Gradio | FastAPI — **ASGI** |

</div>

<div v-click="1" mt-4 text-lg>

**Heavyweight** apps: static assets · sessions · state · realtime

</div>

<div v-click="2" mt-2 text-xl>

Underneath, nearly all of them are **an ASGI app + a server** 🤔

</div>

<!-- Before we go further, look at what these frameworks are actually built on. Streamlit, Shiny, marimo, Gradio — the right-hand column is the interesting one, because almost all of them are ASGI underneath. Shiny sits on Starlette, Gradio on FastAPI, marimo on Starlette, and Streamlit joined them in 1.57 when it swapped Tornado out for Starlette and Uvicorn. Panel is the holdout, still on Bokeh's Tornado server. [click] And these are heavyweight things — static assets, sessions, per-user state, realtime updates. Nothing like a three-endpoint demo. [click] But structurally? An ASGI app with a server underneath it. Which is exactly the shape we just took apart. So the obvious question: if the server half is swappable for our forty-five lines, is it swappable for these too? -->

---
clicks: 1
---

# Standard Streamlit vs. Stlite

<StackCompare mt-2 :columns="[
  { key: 'streamlit', label: 'Standard Streamlit' },
  { key: 'stlite', label: 'Stlite', hidden: $clicks < 1 },
]">
  <template #streamlit><StreamlitStackFigure aligned /></template>
  <template #stlite><StliteStackFigure /></template>
</StackCompare>

<div class="punchline" mt-2 text-center text-lg :class="$clicks >= 1 ? 'op100' : 'op0'">

Same app, same Streamlit — **only the server half and the runtime change** 🎈

</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
</style>

<!-- Same picture as the demo app, with a much bigger passenger on top. On the left, standard Streamlit: your script, the Streamlit server running it, Uvicorn underneath turning HTTP into ASGI calls, all on CPython on some machine — and the React frontend in the visitor's browser over the network. [click] And here's Stlite. Read the rows across. Your script: same. The Streamlit server, with its ScriptRunner and all its state: same — that's the whole point, it's the real Streamlit, not a reimplementation. scope, receive, send: same interface. The frontend at the bottom: the same bundled React SPA. What changed is the two layers we've been swapping all talk — Uvicorn becomes Stlite's ASGI bridge, CPython becomes Pyodide, and the network becomes messages inside the page. And notice one difference from our demo: Stlite puts Pyodide in a Web Worker. Ours ran on the main thread because that makes the call easy to see; production moves it off the main thread so Python cannot freeze the UI. The bridge is the same either way. Same swap as our forty-five-line demo, just carrying a whole framework. -->

---
clicks: 1
---

# Real frameworks, really in the browser

Not just Streamlit — the same swap, done across the ecosystem:

<div class="fw-table" mt-2 text-sm :class="$clicks >= 1 ? 'reveal' : ''">

| Framework | In-browser version | Server stack |
| --------- | ------------------ | ------------ |
| Streamlit | <img src="/stlite.svg" alt="Stlite" inline h-5 /> [Stlite](https://github.com/whitphx/stlite) (me) | Starlette — **ASGI** <span op70>(since 1.57)</span> |
| Shiny for Python | [Shinylive](https://shiny.posit.co/py/docs/shinylive.html) (Posit) | Starlette — **ASGI** |
| marimo | [WASM notebooks](https://docs.marimo.io/guides/wasm/) | Starlette — **ASGI** |
| Panel (HoloViz) | [`panel convert`](https://panel.holoviz.org/how_to/wasm/index.html) | Bokeh / Tornado |
| Gradio | [Gradio-Lite](https://github.com/gradio-app/gradio-lite) <span op60>(me — now unmaintained)</span> | FastAPI — **ASGI** |

</div>

<div v-click="1" mt-4 text-xl text-center>

Each one needed a **server half** in the browser — **ASGI is the right shape** 💡

</div>

<style>
/* The middle column is present from the start so the table never reflows;
   it just is not visible until the click. */
.fw-table :is(th, td):nth-child(2) {
  opacity: 0;
  transition: opacity 600ms ease;
}
.fw-table.reveal :is(th, td):nth-child(2) {
  opacity: 1;
}
</style>

<!-- So it worked for Streamlit. [click] And it is not just Streamlit: the middle column is every project that has already done this. Posit built Shinylive for Shiny. marimo ships WASM notebooks. Panel has a convert command. I worked with the Gradio team on Gradio-Lite, though that one is unmaintained now — the WASM work moved into Gradio itself. Every one of them faced the same hole where the server used to be, and filled it the same way. For the ASGI-native ones that is a bridge like ours; Panel, on Tornado, had to do more work. That is the argument for the standard: target the interface, and the port is a bridge instead of a rewrite. -->

---
layout: statement
---

## The app doesn't care **who calls it**.

<div mt-8 text-2xl op80 v-click="1">

Then the browser can't be the only unusual caller… 😏

</div>

<!-- So here's where we've landed: the app genuinely does not care who calls it. Uvicorn, forty-five lines of bridge, doesn't matter. And once you really believe that sentence, you start looking around for other unusual callers. Because the browser can't possibly be the only one. -->

---
layout: section
---

# ☁️ Full circle

<div mt-4 op70>
The same stack, back on the server — at the edge
</div>

<!-- And here's my favorite one, because it closes a loop. -->

---

# Cloudflare Workers run Python — on Pyodide

<div mt-8 text-xl leading-13>

<v-clicks>

- ☁️ **Cloudflare Workers** — serverless at the edge, on **workerd** (JS/WASM)
- 🐍 **Python Workers = Pyodide** — the same WASM CPython, now *server-side*
- 🔁 **Full circle** — what V8 did for JS, workerd does for this Python stack
- 🧰 **SDK `asgi` module** — `bridge.py`'s production-grade sibling

</v-clicks>

</div>

<!-- Cloudflare Workers are serverless functions running on Cloudflare's edge network, on a runtime called workerd — it's built on V8, it speaks JavaScript and WebAssembly. And when Cloudflare added Python support, guess how they did it. Pyodide. The exact same WebAssembly CPython from our browser story — except now it's running server-side, on the edge. I love this because it rhymes with history: V8 took browser-born JavaScript and put it on the server, and now workerd is doing the same thing to the browser-born Python stack. And here's the part that matters for us: their SDK ships an asgi module — a production-grade sibling of our bridge.py — whose job is translating JavaScript Request objects into ASGI calls. Sound familiar? -->

---

# Demo, step 3: the entire entrypoint

<div mt-2 text-lg>

The whole file — and `src/main.py` = **a symlink to step 1's app**:

</div>

<<< @/samples/runtime-agnostic-asgi-app/step3-cloudflare/src/entry.py py {*|1,6|9-13|*}{maxHeight:'320px'}

<div v-click="4" mt-3 text-center>

<a href="https://runtime-agnostic-asgi-app.whitphx.workers.dev" target="_blank">runtime-agnostic-asgi-app.whitphx.workers.dev</a> → `Python 3.13 on emscripten/wasm32` — **from the edge** 🌍

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- Step three of the demo. This is the entire Cloudflare entrypoint — I'm not hiding anything, this is the whole file. Import the SDK's asgi module. Import the app — and note, src/main.py is literally a symlink to the same main.py from steps one and two. And in the fetch handler, one line: hand the app to asgi.fetch. Their bridge does what ours did — builds the scope, wires receive and send — except production-grade. It's deployed, you can hit that URL right now. Click the button and it says: Python 3.13 on emscripten wasm32 — answered from a Cloudflare data center near you. Same app. Third runtime. Zero changes.

[DEMO SETUP] Deploy well before the talk and hit the URL once to warm it. For about a minute after a deploy, requests intermittently come back as edge errors while the new version propagates, and a cold isolate takes around three seconds against roughly one second warm. -->

---
clicks: 1
---

<h1>What’s actually running where — step <span class="step-swap"><span :class="$clicks >= 1 ? 'op0' : ''">2</span><span class="step-two" :class="$clicks >= 1 ? '' : 'op0'">3</span></span></h1>

<StackCompare mt-4 :columns="[
  { key: 'server', label: '① Server' },
  { key: 'browser', label: '② Browser' },
  { key: 'edge', label: '③ Edge', hidden: $clicks < 1 },
]">
  <template #server><ServerStackFigure aligned /></template>
  <template #browser><BrowserStackFigure aligned /></template>
  <template #edge><CloudflareStackFigure /></template>
</StackCompare>

<div class="punchline" mt-4 text-center text-xl :class="$clicks >= 1 ? 'op100' : 'op0'">

Same app on top — **only the server half changes** ☁️

</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
.step-swap {
  position: relative;
  display: inline-block;
}
.step-swap > span {
  transition: opacity 700ms ease 250ms;
}
.step-swap > .step-two {
  position: absolute;
  left: 0;
}
</style>

<!-- Here are both stacks we've seen — server on the left, browser in the middle. [click] And the edge joins them. Read across the top row: the same file, three times. Read the row below it: scope, receive, send, three times. Now read the sky-blue row, and that's the only thing that moves — Uvicorn, then our forty-five-line bridge, then Cloudflare's asgi module, which I didn't write at all. Two more things worth noticing. The edge column's runtime frame says Pyodide, same as the browser: Cloudflare runs Python the same way a browser does, just in a Python Worker on their machines instead of a tab on the visitor's. And the frontend went back outside over a real network, exactly like column one. Same app, three environments, and every difference lives below the interface. -->

---

# Three runtimes, one app

<div grid="~ cols-3" gap-3 mt-4 items-start>

<StackColumn
  v-click="1"
  title="① Server"
  env="your machine / cloud VM"
  :layers="[
    { label: 'app', note: 'ASGI application (FastAPI)', kind: 'app' },
    { label: 'Uvicorn', note: 'HTTP over TCP sockets', kind: 'caller' },
    { label: 'CPython 3.12', note: 'native process', kind: 'runtime' },
  ]"
/>

<StackColumn
  v-click="2"
  title="② Browser"
  env="each visitor's tab"
  :layers="[
    { label: 'app', note: 'ASGI application (FastAPI)', kind: 'app' },
    { label: 'bridge.py', note: 'a call from the page', kind: 'caller' },
    { label: 'Pyodide 3.14', note: 'WASM, on the page', kind: 'runtime' },
  ]"
/>

<StackColumn
  v-click="3"
  title="③ Edge"
  env="Cloudflare's network"
  :layers="[
    { label: 'app', note: 'ASGI application (FastAPI)', kind: 'app' },
    { label: 'SDK asgi module', note: 'JS Request / Response', kind: 'caller' },
    { label: 'Pyodide 3.13', note: 'WASM, on workerd', kind: 'runtime' },
  ]"
/>

</div>

<div v-click="4" mt-5 text-center text-xl op80>

**Same file** · 3 Pythons · 3 transports · **0 changes**<br>
<span v-click="5" font-bold text-sky-600>The interface holds — everything below it is swappable</span>

</div>

<!-- And here is the whole talk in one picture. Three columns, three runtimes. A server with Uvicorn on native CPython. A browser tab with our bridge on Pyodide. Cloudflare's edge with their SDK bridge, also on Pyodide. Now look at the top row: it's the same file. Literally — two of them load it and one symlinks it. It ran on Python 3.12, 3.14, and 3.13, over TCP sockets, a direct call, and JS Request objects — zero changes. Everything below the interface got swapped per environment; nothing above it moved. That's what "cut a clean interface" buys you. Not a deployment trick — a property of the architecture. -->

---
clicks: 2
---

# Stlite went to the edge, too

<StackCompare mt-2 :columns="[
  { key: 'streamlit', label: 'Standard Streamlit' },
  { key: 'stlite', label: 'Stlite — in the browser' },
  { key: 'edge', label: 'Stlite — on Cloudflare', hidden: $clicks < 1 },
]">
  <template #streamlit><StreamlitStackFigure aligned /></template>
  <template #stlite><StliteStackFigure /></template>
  <template #edge><StliteEdgeStackFigure aligned /></template>
</StackCompare>

<div v-click="2" mt-2 text-center text-xl>

**Same kernel — only the caller changed** 🔁

</div>

<div class="punchline" absolute top-14 right-6 text-sm :class="$clicks >= 1 ? 'op60' : 'op0'">
<code>@stlite/cloudflare</code> — <a href="https://github.com/whitphx/stlite/pull/2077" target="_blank">stlite#2077</a>, experimental
</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
</style>

<!-- And of course, once I saw Cloudflare running Pyodide, I had to try it with Stlite. Here are the two columns you just saw, and read the rows across them one more time: your script, the Streamlit server, scope-receive-send, the same React frontend. [click] Now the third column: at-stlite-slash-cloudflare, PR 2077, experimental. Pyodide again — but in a Python Worker at the edge instead of a Web Worker in the tab. Stlite's ASGI bridge again — but fed by edge requests instead of browser events. And the frontend goes back over a real network, like the leftmost column. So the top three rows are identical in all three, and the bottom three have now been swapped twice. [click] Nothing about the kernel changed. Only the caller did. When your server half targets an interface instead of an environment, moving to a new environment is configuration, not a rewrite. -->

---
layout: section
---

# 🧭 When to reach for this

<div mt-4 op70>
Practical uses — and honest limits
</div>

<!-- OK. So in-browser Python web apps are possible and the architecture is sound. When would you actually want this? -->

---

# Practical applications

<div mt-4 grid="~ cols-2" gap-4 text-lg>

<div v-click="1" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
📡 <b>Static-hosted demos</b><br><span op80 text-base>GitHub Pages / CDN — <b>no backend</b></span>
</div>

<div v-click="2" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
📖 <b>Runnable documentation</b><br><span op80 text-base>live, editable examples in the docs</span>
</div>

<div v-click="3" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
🎓 <b>Education</b><br><span op80 text-base><b>zero setup</b> — it's just a web page</span>
</div>

<div v-click="4" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
🔒 <b>Privacy-preserving apps</b><br><span op80 text-base>data <b>never leaves the device</b></span>
</div>

</div>

<div v-click="5" mt-5 text-center text-lg>

In production: [Streamlit Playground](https://streamlit.io/playground) · [Gradio Playground](https://www.gradio.app/playground) 🚀

</div>

<!-- Four things I keep coming back to. Static-hosted demos — ship an entire web app as files on GitHub Pages or a CDN, no backend to operate or pay for, and it scales with visitors because each visitor brings their own compute. Runnable documentation — live, editable examples sitting right in the docs. Education — teach FastAPI or Streamlit to a room of beginners with zero setup; it just runs in their tab. And privacy — everything is client-side, so the user's data never leaves their device, which is a genuine selling point for sensitive workloads. And this isn't hypothetical: the official Streamlit Playground and Gradio Playground are this exact architecture, in production, today. -->

---

# Honest limits

<div mt-4 grid="~ cols-2" gap-4 text-lg>

<div v-click="1" border="~ red/40 rounded-lg" p-4 bg-red:5>
📦 <b>Dependencies</b><br><span op80 text-base>everything downloads · <b>not every package is in the Pyodide distribution</b></span>
</div>

<div v-click="2" border="~ red/40 rounded-lg" p-4 bg-red:5>
🧵 <b>Single thread, sandboxed</b><br><span op80 text-base>no threads → <b><code>async def</code> only</b> · no raw sockets</span>
</div>

<div v-click="3" border="~ red/40 rounded-lg" p-4 bg-red:5>
🔑 <b>No safe secrets</b><br><span op80 text-base>the page is public — <b>no API keys</b></span>
</div>

<div v-click="4" border="~ red/40 rounded-lg" p-4 bg-red:5>
📥 <b>No inbound requests</b><br><span op80 text-base>no public address — <b>no webhooks</b></span>
</div>

</div>

<div v-click="5" mt-5 text-center text-xl>

**Complements** real servers — doesn't replace them 🤝

</div>

<!-- And the honest part, because this isn't magic. Dependencies: everything ships to the browser, and not everything is available. The good news is that the whole stack we've been using — FastAPI, Starlette, Pydantic, anyio — ships inside the Pyodide distribution, so it loads straight from the CDN with no PyPI round-trip. But the demo still needed one extra install: python-multipart, which FastAPI needs to parse a form. It's pure Python, no C extension in sight, and it's simply not in the distribution — so without micropip installing it, that one endpoint 500s. That's the shape of this limit: it's not "no C extensions", it's "check the distribution, then check what micropip can add." It's single-threaded and sandboxed — and here's a concrete bite: Starlette runs sync def endpoints in a thread pool, and WASM can't spawn threads, so a sync endpoint that works fine under Uvicorn dies in the browser with "can't start new thread." Every endpoint in the demo app is async def for exactly that reason. Secrets are impossible — anything in the page, the user can read. And there's no inbound networking — the tab has no public address, so no webhooks. The takeaway: this complements real servers, it doesn't replace them. Use it where the strengths line up. -->

---

# Key takeaways

<div mt-6 text-xl>

<v-clicks>

- 🧩 **ASGI = a clean interface** — your app on one side, *any caller* on the other
- ⚡ The whole contract: **`scope` · `receive` · `send`** — no sockets in it
- 🌉 **A server = anything that fulfills the contract** — Uvicorn · a tab · the edge
- 🏭 **Shipping today** — Stlite · Shinylive · marimo · the playgrounds
- 🧠 **To understand an interface, implement the other side of it**

</v-clicks>

</div>

<!-- Five things to carry out of the room. One: ASGI cuts a clean interface — your app on one side, and whoever can call it on the other. Two: the entire contract is scope, receive, and send, and it never mentions sockets, ports, or machines. Three: because of that, a server is anything that fulfills the contract — Uvicorn, forty-five lines of Python in a browser tab, or Cloudflare's edge. Four: this is shipping today — Stlite, Shinylive, marimo, and the official Streamlit and Gradio playgrounds all run on it. And five, the one to remember if you forget everything else: the best way to truly understand an interface is to implement the other side of it. -->

---

<h1>Thank you! 🙏</h1>

<div mt-6 text-2xl>
One app. Any caller. 🌐🐍
</div>

<div mt-6 grid="~ cols-[1fr_auto]" gap-8 items-center>

<div text-base flex="~ col" gap-2>

<div flex="~ gap-2" items-center>
<div i-ri-code-s-slash-line text-xl op50 />
<div><a href="https://github.com/whitphx/slides/tree/main/decks/202608-pyconkr-asgi-pyodide/samples" target="_blank">whitphx/slides</a> — this deck, with every sample you saw</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-github-line text-xl op50 />
<div><a href="https://github.com/whitphx/stlite" target="_blank">whitphx/stlite</a> — in-browser Streamlit · <a href="https://github.com/whitphx/stlite/pull/2043" target="_blank">#2043</a>, <a href="https://github.com/whitphx/stlite/pull/2044" target="_blank">#2044</a>, <a href="https://github.com/whitphx/stlite/pull/2077" target="_blank">#2077</a></div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-file-text-line text-xl op50 />
<div><a href="https://asgi.readthedocs.io/" target="_blank">asgi.readthedocs.io</a> · <a href="https://pyodide.org/" target="_blank">pyodide.org</a> · <a href="https://shiny.posit.co/py/docs/shinylive.html" target="_blank">Shinylive</a> · <a href="https://github.com/gradio-app/gradio/pull/4402" target="_blank">gradio#4402</a></div>
</div>

<div mt-4 w-min flex="~ gap-1" items-center>
  <div i-ri-user-3-line op50 ma text-xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

</div>

<div flex="~ col" items-center gap-2>
<QRCode :width="140" :height="140" type="svg" data="https://slides.whitphx.info/202608-pyconkr-asgi-pyodide/"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
<div op70 text-sm>slides.whitphx.info</div>
</div>

</div>

<!-- And that's it — one app, any caller. Thank you so much for listening. The slides are at the QR code, with all the links: the samples with all three steps, the Stlite PRs if you want to read a production bridge, the spec, everything. I'd love to hear what you'd build with this — please come find me, and I'm happy to take questions. And if anyone asks about lifespan, streaming, or WebSockets: I have appendix slides ready. Thank you! -->

---
layout: section
---

# 📎 Appendix

<div mt-4 op70>
Web Workers, lifespan, streaming & WebSockets
</div>

<!-- Appendix, for Q&A: the two sub-protocols the main talk skips, plus streaming. -->

---

# Step 2b: the same bridge, in a Web Worker

<div mt-2 text-lg>

Python on the page's main thread **blocks rendering** while it runs. Production moves it:

</div>

<div grid="~ cols-2" gap-6 mt-4 text-sm>

<div border="~ gray/40 rounded-xl" p-3 bg-gray:5>
<div text-center text-xs op60 mb-2>Step 2 — main thread</div>
<div text-center>asgiFetch → <b><code>dispatch(app, req)</code></b></div>
<div text-center text-xs op70 mt-2>one call · easiest to read</div>
</div>

<div border="~ gray/40 rounded-xl" p-3 bg-gray:5>
<div text-center text-xs op60 mb-2>Step 2b — Web Worker</div>
<div text-center>asgiFetch → message → <b><code>dispatch(app, req)</code></b></div>
<div text-center text-xs op70 mt-2>UI stays responsive · what Stlite ships</div>
</div>

</div>

<div mt-5 text-center text-xl>

Same <code>bridge.py</code>, same ASGI call — **only the thread changes** 🧵

</div>

<div mt-3 text-center text-sm op70>

`samples/runtime-agnostic-asgi-app/step2b-browser-worker/`

</div>

<!-- If someone asks why the demo ran Python on the main thread: because it makes the call visible — asgiFetch calls dispatch, one line, nothing in between. The cost is that while Python is working, the page cannot paint or respond, which for a three-endpoint demo you will never notice and for a real app you absolutely will. So production puts Pyodide in a Web Worker, and asgiFetch posts a message instead of calling dispatch directly, correlating replies by id. Everything below that — bridge.py, the scope dict, receive and send, the app — is byte-for-byte identical. The repo has both variants side by side if you want to diff them. -->

---

# The boundary tax: JS ↔ Python

<div mt-1 text-lg>

The bridge sits *on* the [Pyodide FFI](https://pyodide.org/en/stable/usage/type-conversions.html) — **the bugs live in the conversions**:

</div>

<div grid="~ cols-2" gap-4 mt-4 text-sm>

<div v-click="1" border="~ sky/40 rounded-lg" p-3 bg-sky:8>
🟦→🐍 <b>Proxies, not values</b><br>
<span op80><code>JsProxy</code>, not <code>dict</code> → <code>.to_py()</code></span>
</div>

<div v-click="2" border="~ violet/40 rounded-lg" p-3 bg-violet:8>
📦 <b>Binary bodies</b><br>
<span op80><code>Uint8Array</code> → <code>bytes()</code> — <b>every conversion copies</b></span>
</div>

<div v-click="3" border="~ emerald/40 rounded-lg" p-3 bg-emerald:8>
🐍→🟦 <b>Going back: <code>to_js()</code></b><br>
<span op80><code>dict</code> → JS <code>Map</code> by default! (<code>dict_converter</code>)</span>
</div>

<div v-click="4" border="~ amber/40 rounded-lg" p-3 bg-amber:8>
⏳ <b>Async composes</b><br>
<span op80>coroutine ⇄ <code>Promise</code> — loops interleave</span>
</div>

</div>

<div v-click="5" mt-5 text-center text-xl>

Uvicorn's network layer: sockets. **Ours: type conversion** 🔁

</div>

<!-- This is the appendix slide I promised when I greyed out the two conversion lines. The bridge sits on one layer real servers don't have: the foreign function interface between JavaScript and Python. And I can tell you from years of this — the bugs live here. Four things to know. JS objects arrive in Python as proxies, not dicts — convert explicitly. Binary bodies come as Uint8Arrays, and every conversion copies the buffer — that matters when someone uploads a fifty-megabyte file. Going the other way, to_js turns a dict into a JavaScript Map by default, not a plain object — there's a dict_converter option, and every Pyodide developer hits this exactly once. And one pleasant surprise: async composes beautifully — JS can await a Python coroutine as a Promise, and the two event loops interleave without drama. So if Uvicorn's network layer is sockets and parsers, ours is type conversion. Different plumbing, same role in the stack. -->

---

# Lifespan: the app expects a boot signal

<div mt-1 text-lg>

Not a client connection — **the app's boot/teardown protocol**. The server drives it; so must we:

</div>

```py {*|2-4|6-9|11|*}{maxHeight:'320px','data-id':'lifespan'}
async def run_lifespan(app):
    scope = {"type": "lifespan"}
    inbox = asyncio.Queue()
    inbox.put_nowait({"type": "lifespan.startup"})

    async def receive():
        return await inbox.get()
    async def send(event):
        ...

    asyncio.ensure_future(app(scope, receive, send))
```

<div v-click="3">
<div data-id="ann-lifespan" absolute top-64 right-4 w-52 bg-white dark:bg-black p-2 rounded border="~ amber/60 rounded-lg" text-sm>

not awaited — **it runs for the whole app lifetime**

</div>
<FancyArrow from="[data-id=ann-lifespan] @ left" to="[data-id=lifespan] .line:nth-child(11) @ right" arc="0.2" />
</div>

<div v-click="4" mt-2 text-base text-center>

⚠️ Skip it → `lifespan=` hooks (DB pools, models…) **silently never run**

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- One more protocol, because skipping it is the classic bridge bug: lifespan. There's no client involved — it's how the app gets told "you're starting up" and "you're shutting down." It's where FastAPI runs its lifespan handlers: opening database pools, loading models, warming caches. Uvicorn drives this when the process starts; our bridge has to drive it when the page loads. Same tools as before: a lifespan scope, a queue, receive and send. We push a startup event, wait for the app to answer startup-complete before serving any request, and keep the whole thing running as a background task until teardown. If you forget this, everything looks fine — until someone's database pool is mysteriously never initialized, and they spend an afternoon finding out why. Don't skip lifespan. -->


---

# Streaming responses: `more_body`

<div mt-1 text-lg>

`StreamingResponse` / SSE: the body arrives **in chunks over time** — buffering breaks them *(concept)*:

</div>

```py {*|2-3|4-5|6-7|*}{maxHeight:'240px','data-id':'streaming'}
async def send(event):
    if event["type"] == "http.response.start":
        js_stream.start(event["status"], event["headers"])
    elif event["type"] == "http.response.body":
        js_stream.enqueue(event.get("body", b""))
        if not event.get("more_body", False):
            js_stream.close()
```

<div v-click="3">
<div data-id="ann-more-body" absolute top-64 right-4 w-52 bg-white dark:bg-black p-2 rounded border="~ emerald/50 rounded-lg" text-sm>

**keep the stream open** while `more_body`

</div>
<FancyArrow from="[data-id=ann-more-body] @ left" to="[data-id=streaming] .line:nth-child(6) @ right" arc="0.2" />
</div>

<div v-click="4" mt-4 text-lg text-center>

Chunk → JS `ReadableStream` **as it's sent** — token streams work in-browser 📡

</div>

<!-- The dispatch from the main talk buffers the whole response and returns it at the end. That works — until the app uses StreamingResponse or server-sent events. Think progress updates, or a chatbot streaming tokens one at a time; Gradio's UI leans on this heavily. If you buffer, the user sees nothing until everything is done. The fix is to respect more_body. On response.start we immediately open a JavaScript ReadableStream. Each body event gets enqueued to JS right away, and when more_body goes false we close the stream. The JS side consumes it exactly like a real fetch — and streaming UIs just work, entirely in the page. This slide is the concept version; the production ones also deal with backpressure. -->

---

# WebSocket: an awaitable receive queue

<div mt-1 text-lg>

JS pushes *whenever* · the app `await`s — **`asyncio.Queue` bridges push → pull**:

</div>

```py {*|3|5-7|9-10|*}{maxHeight:'300px','data-id':'ws-session'}
class WebSocketSession:
    def __init__(self):
        self._inbox = asyncio.Queue()

    def on_js_message(self, data):
        self._inbox.put_nowait(
            {"type": "websocket.receive", "text": data})

    async def receive(self):
        return await self._inbox.get()
```

<div mt-8 grid="~ cols-2" gap-4 text-sm>

<div v-click="2">
<div data-id="ann-js-push" border="~ violet/40 rounded-lg" p-3 bg-white dark:bg-black>
🟦 called <b>from JavaScript</b> — <code>on_js_message</code> is <b>fire-and-forget</b>
</div>
<FancyArrow from="[data-id=ann-js-push] @ top" to="[data-id=ws-session] .line:nth-child(5) @ right" arc="0.2" />
</div>

<div v-click="3">
<div data-id="ann-app-pull" border="~ emerald/40 rounded-lg" p-3 bg-white dark:bg-black>
🐍 awaited <b>by the app</b> — <code>await receive()</code> <b>suspends until JS pushes</b>
</div>
<FancyArrow from="[data-id=ann-app-pull] @ topleft" to="[data-id=ws-session] .line:nth-child(9) @ right" arc="-0.2" />
</div>

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- WebSockets are trickier because they're long-lived and the timing is inverted. JavaScript receives messages whenever the network feels like it — push-driven, fire-and-forget. But the ASGI app is pull-driven; it awaits receive, expecting the next message handed to it. So we connect a push world to a pull world, and the classic tool is an asyncio.Queue. JS drops events in without awaiting; the app's receive awaits queue.get and suspends until something shows up. The queue absorbs the timing mismatch — this little buffer is the heart of in-browser WebSockets. -->

---

# WebSocket: the session lifecycle

<div mt-2 text-lg>

Same `receive` / `send` — **new event names**:

</div>

<div grid="~ cols-[6rem_1fr_1fr]" gap-4 mt-4 text-sm items-center>
<div></div>
<div text-center op70>📥 the app <b>receives</b></div>
<div text-center op70>📤 the app <b>sends</b></div>
</div>

<div v-click="1" grid="~ cols-[6rem_1fr_1fr]" gap-4 mt-2 text-sm items-center>
<div text-base>① <b>open</b></div>
<div border="~ violet/40 rounded-lg" p-2><code>"websocket.connect"</code><br><span op70 text-xs>we enqueue it when JS opens</span></div>
<div border="~ emerald/40 rounded-lg" p-2><code>"websocket.accept"</code><br><span op70 text-xs>we tell JS the socket is open</span></div>
</div>

<div v-click="2" grid="~ cols-[6rem_1fr_1fr]" gap-4 mt-2 text-sm items-center>
<div text-base>② <b>message</b></div>
<div border="~ violet/40 rounded-lg" p-2><code>"websocket.receive"</code><br><span op70 text-xs>one per message JS pushes</span></div>
<div border="~ emerald/40 rounded-lg" p-2><code>"websocket.send"</code><br><span op70 text-xs>we post it back out to JS</span></div>
</div>

<div v-click="3" grid="~ cols-[6rem_1fr_1fr]" gap-4 mt-2 text-sm items-center>
<div text-base>③ <b>close</b></div>
<div border="~ violet/40 rounded-lg" p-2><code>"websocket.disconnect"</code><br><span op70 text-xs>JS closed it first</span></div>
<div border="~ emerald/40 rounded-lg" p-2><code>"websocket.close"</code><br><span op70 text-xs>we close the JS socket</span></div>
</div>

<div v-click="4" mt-4 text-lg text-center>

Same shape as HTTP — **only events & lifetime differ** 🔁

</div>

<!-- And the rest of the dance, expressed through the same receive and send. On open we enqueue websocket.connect; the app answers websocket.accept and we tell the JS socket it's open. Each message: the app receives websocket.receive, replies websocket.send, we post it out. Either side can end it — the app sends close, or JS disconnects and we feed the app websocket.disconnect. The point: it's the exact same receive-slash-send loop as HTTP. Only the event names and the lifetime differ. One mental model covers both — which is exactly why it lives comfortably in an appendix. -->
