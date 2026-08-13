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
Yuichi / 유이치 (@whitphx)
</div>

<div absolute bottom-8 right-10 text-sm op60>
PyCon Korea 2026 · Aug 15
</div>

<!-- Hi everyone, thanks for coming. Today I want to talk about something that sounds strange the first time you hear it: running a web server inside a browser tab. No network, no Uvicorn, just Python running in the page. But this talk is not really about the browser. It is about what a clean interface gives you, and ASGI is that interface. The browser is only the most extreme place I have taken it. Let me show you. -->

---

<h1>Yuichi / 유이치 (@whitphx)</h1>

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

<!-- Quick intro. I'm Yuichi, whitphx online. I build and maintain open source Python projects. The two that matter today are Stlite, which is Streamlit running fully in the browser, and Gradio-Lite, the same idea for Gradio. This talk comes from building those. So it is not a textbook explanation of ASGI; it is what I learned by putting Python web frameworks in unusual places. -->

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
<span op80>One FastAPI app · different runtimes · zero changes</span>

</div>

<!-- Here is the whole talk in one slide. When you write a FastAPI app, your code never touches the network. Uvicorn does that part, and between your app and Uvicorn there is an interface: ASGI. Because that interface is a real, written contract, the two sides stay separate. Frameworks change on one side, servers change on the other, and neither has to know how the other works inside. So my question today is: how far can you stretch the server side? Much further than you would expect. Into a browser tab, and past it. The message to keep: with a clean interface, your app runs anywhere something can call it. To show that, one FastAPI app will run on very different runtimes today, without changing a line. -->

---
layout: section
---

# 🧩 The boundary you use every day

<div mt-4 op70>
…without ever looking at it
</div>

<!-- Let's start with the thing you already do, probably every week. -->

---
clicks: 2
---

# You deploy this pair every week

<div class="deploy-grid" mt-4 :class="$clicks >= 1 ? 'revealed' : ''">

<div class="deploy-cell deploy-left">

<div mb-1>Demo app — ordinary <b><span v-mark="{ at: 2, color: '#a78bfa', type: 'circle' }">FastAPI</span></b></div>

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

<div mb-1>…and how <b><span v-mark="{ at: 2, color: '#38bdf8', type: 'circle' }">Uvicorn</span></b> runs it</div>

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

<!-- This is part of the demo app we use through the whole talk. It has one endpoint that answers "where am I running?" — it reports the Python version and the platform. Ordinary FastAPI; if you have written any, this is familiar. On the right, the way everyone runs it: uvicorn main colon app. Done. But look at how the work is split, because that split is the whole talk. Your app decides what to answer. Uvicorn deals with how requests arrive: sockets, HTTP parsing, all of it. Your code and Uvicorn's code never touch each other. Something sits between them. [click] Keep these two names in mind: a framework on one side, a server on the other. -->

---

# Two ecosystems, one contract

<div grid="~ cols-[1fr_auto_1fr]" gap-4 items-center mt-8 text-center>

<div v-click="1" border="~ violet/40 rounded-lg" p-4 bg-violet:5 data-id="apps">
<div text-2xl>🐍</div>
<b>App frameworks</b><br>
<span op70>FastAPI · Starlette · Django<br>Litestar · Quart …</span>
</div>

<div v-click="4" px-2 text-center data-id="asgi">
<div text-2xl op60>⇄</div>
<div text-2xl><b>ASGI</b></div>
</div>

<div v-click="2" border="~ sky/40 rounded-lg" p-4 bg-sky:5 data-id="servers">
<div text-2xl>🖥️</div>
<b>Servers</b><br>
<span op70><span data-id="srv-uvicorn">Uvicorn</span> · Hypercorn<br>Granian · <span data-id="srv-mangum">Mangum</span> …</span>
</div>

</div>

<div v-click="3">
<div data-id="env-host" class="env-note" absolute top-74 right-64 w-46 bg-white dark:bg-black px-2 py-1 border="~ sky/60 rounded-lg">

🖥️ **a Linux box**<br><span op70>a port to listen on</span>

</div>
<FancyArrow from="[data-id=env-host] @ (25%, 0)" to="[data-id=srv-uvicorn] @ left" arc="0.4" />
</div>

<div v-click="3">
<div data-id="env-lambda" class="env-note" absolute top-74 right-12 w-46 bg-white dark:bg-black px-2 py-1 border="~ amber/60 rounded-lg">

☁️ **AWS Lambda**<br><span op70>no port at all</span>

</div>
<FancyArrow from="[data-id=env-lambda] @ top" to="[data-id=srv-mangum] @ bottom" arc="0.1" color="red" />
</div>

<div v-click="5" mt-30 text-2xl op90 text-center>

Each side evolves **independently** — nobody coordinates 🤝

</div>

<style>
/* The typography preset sizes the inner `p` directly, so the box's own size
   would not reach the markdown paragraph inside it. */
.env-note, .env-note p {
  font-size: 16px;
  line-height: 1.35;
  margin: 0;
}
</style>

<!-- [click] On one side, the app frameworks: FastAPI, Starlette, Django, Litestar, Quart. [click] On the other, the servers: Uvicorn, Hypercorn, Granian, and Mangum, which is not like the others; remember it, we come back to it near the end. [click] Look at what these servers run on. Uvicorn wants a Linux machine and a port to listen on: a process sitting there, waiting. Mangum has neither. On AWS Lambda there is no port, and no process of yours between requests. These are not two versions of one environment; they are different worlds. [click] And between them sits ASGI, the standard interface between an async Python web app and whatever runs it. They talk through one small, fixed contract, and we open it up in a minute. [click] Look at what this contract gives the ecosystem: each side can change without asking the other. Granian arrived, written in Rust, and every framework already ran on it. Litestar arrived, and every server could already serve it. Nobody coordinated anything. That is what a good interface does. And this idea is much older than async Python. -->

---

# Not a new idea: WSGI walked first

<div mt-2 text-lg>

Same motivation, one standard earlier — **the synchronous era**:

</div>

<div grid="~ cols-[1fr_auto_1fr]" gap-4 items-stretch mt-5>

<div v-click="1" border="~ gray/40 rounded-lg" p-3 bg-gray:5>
<div text-4>📜 <b>WSGI</b> <span op60 text-sm>— <a href="https://peps.python.org/pep-0333/" target="_blank">PEP 333</a>, 2003</span></div>
<div text-4 mt-2><code>def app(environ, start_response)</code></div>
<div text-4 op80 mt-1>Flask · Django ⇄ Gunicorn · uWSGI</div>
<div text-4 op80 mt-1><b>One sync call</b> request → response, done</div>
</div>

<div v-click="2" self-center text-2xl op60>→</div>

<div v-click="2" border="~ sky/40 rounded-lg" p-3 bg-sky:5>
<div text-4>⚡ <b>ASGI</b> <span op60 text-sm>— 2016–, born from Django Channels</span></div>
<div text-4 mt-2><code>async def app(scope, receive, send)</code></div>
<div text-4 op80 mt-1>Same decoupling, <b>async events</b></div>
<div text-4 op80 mt-1>WebSockets · streaming long-lived connections</div>
</div>

</div>

<div v-click="3" mt-6 text-xl op90 text-center>

**One call → a conversation of events**

</div>

<!-- Because this is not a new idea. In 2003, PEP 333, Python standardized WSGI: the same kind of contract, for synchronous code. One function, environ and start_response, and that is why Flask runs on Gunicorn, on uWSGI, on anything. Twenty years of any framework on any server. But the shape of WSGI is one synchronous call per request: request in, response out, done. That shape cannot express a WebSocket, or a response that streams over time, or any long-lived connection. There is no place in the contract for "and then, later, another message". So when Django Channels needed exactly those things, ASGI grew out of that work as the async version of WSGI: the same separation, but the single call became a conversation of events. That is the contract we use today. I will not go deeper into WSGI. The point is only that this boundary has worked for twenty years. -->

---
layout: statement
---

## We take this decoupling for granted.

<div mt-8 text-2xl op80 v-click="1">

🤔 How far can the **"server" side** be stretched?

</div>

<!-- And we take this for granted. You pick a server from a list, it works, and you never think about it again. But if the contract is really solid, if the app does not know or care who calls it, then an interesting question appears: how far can you stretch the server side before something breaks? That question is the rest of this talk. -->

---
layout: section
---

# ⚡ ASGI in 90 seconds

<!-- To answer it, we need to know what the contract says. Ninety seconds, three words. If you already know ASGI, this is a quick review; if you do not, this is all you need for the rest of the talk. -->

---

# An ASGI app is one async callable

<div mt-2 text-lg>

The entire interface: **one coroutine, three arguments**

</div>

<div v-click="1" mt-4 text-center>
<div text-xl>🤝 This signature is <b>the contract</b></div>
<div mt-4 mb-4 text-lg op80>Satisfy it → <b>any ASGI server can serve your app</b></div>
</div>

```py {*}{'data-id':'asgi-signature'}
async def app(scope, receive, send):
    ...
```

<div mt-8 grid="~ cols-3" gap-6 text-lg>

<div v-click="2">
<div data-id="ann-scope" border="~ sky/40 rounded-lg" p-3 bg-white dark:bg-black>
📋 <b><code>scope</code></b><br><span op80>connection type<br>path · headers</span>
</div>
<FancyArrow from="[data-id=ann-scope] @ top" to="[data-id=asgi-signature] .line:nth-child(1) span:nth-child(5) @ bottom" arc="-0.2" />
</div>

<div v-click="3">
<div data-id="ann-receive" border="~ violet/40 rounded-lg" p-3 bg-white dark:bg-black>
📥 <b><code>receive()</code></b><br><span op80>async <b>inbox</b><br>events from the client</span>
</div>
<FancyArrow from="[data-id=ann-receive] @ top" to="[data-id=asgi-signature] .line:nth-child(1) span:nth-child(7) @ bottom" arc="-0.05" />
</div>

<div v-click="4">
<div data-id="ann-send" border="~ emerald/40 rounded-lg" p-3 bg-white dark:bg-black>
📤 <b><code>send()</code></b><br><span op80>async <b>outbox</b><br>events to the client</span>
</div>
<FancyArrow from="[data-id=ann-send] @ top" to="[data-id=asgi-signature] .line:nth-child(1) span:nth-child(9) @ bottom" arc="0.1" />
</div>

</div>

<style>
* {
  --slidev-code-font-size: 28px;
  --slidev-code-line-height: 1.5;
}
</style>

<!-- This is everything ASGI asks of your app: one async function taking three arguments. [click] And here is the word to remember for the rest of the talk: contract. This signature is an agreement between two sides. Your app promises to be a coroutine that takes these three arguments; whoever calls it promises to provide them. Neither side needs to know anything else about the other. Write a callable that matches it, and any ASGI server will serve your app. You did not pick a server, you matched a contract. That is why the rest of this talk is possible. [click] So what are the three? Scope is a dict that describes the connection: what kind it is, the path, the headers, that kind of information. [click] receive is an async callable; you await it to get the next event from the client, for example a piece of the request body. Think of it as an inbox. [click] And send is an async callable; you await it to push an event out: your response status, your headers, your body. An outbox. That is all. The whole job of a server is to build the scope and to implement receive and send. Remember that sentence. -->

---
clicks: 6
---

# You don't even need a framework

<div class="framework-grid" mt-1 :class="$clicks >= 5 ? 'revealed' : ''">

<div class="framework-cell framework-left">

<div text-5 mb-1>A complete ASGI app — <b>no framework</b></div>

<<< @/samples/raw-asgi/raw_asgi.py py {*|1|2|3-7|8-11|*}{'data-id':'raw-asgi-app'}

<div v-click="[3,5]">
<div data-id="ann-send" class="wire-note" absolute top-30 right-10 w-80 flex items-center border="~ emerald/50 rounded-lg" px-2 py-1 gap-4 bg-white dark:bg-black text-4>
<span>🐍 app</span>
<div>
<div text-center text-emerald-600 dark:text-emerald-400 font-bold>— calls <code>send(event)</code> with the response —▸</div>
<div text-center op60>◂—— <code>None</code> ——</div>
</div>
<span>🦄 server</span>
</div>
<FancyArrow from="[data-id=ann-send] @ bottom" to="[data-id=raw-asgi-app] .line:nth-child(3) @ right" arc="0.05" />
<FancyArrow from="[data-id=ann-send] @ bottom" to="[data-id=raw-asgi-app] .line:nth-child(8) @ right" arc="0.15" />
</div>

</div>

<div class="framework-cell framework-right">

<div text-5 mb-1>…and Uvicorn serves it, no questions asked</div>

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

<!-- To make this concrete, here is a complete ASGI application with no framework at all. That is a whole working web app, and it is worth reading line by line, because every line does something a server cares about. [click] The signature: one async callable, three arguments, exactly the contract we just learned. [click] It checks the connection type, because an ASGI app can be given HTTP, WebSocket, or lifespan. [click] Then the first event out: response.start, with the status and the headers. [click] And the second: response.body, with the bytes. Two sends, and the response is complete. [click] So let's run it. I point Uvicorn at it the same way I pointed it at FastAPI a few slides ago, and it starts with no problem. [click] Now curl it, and there is a real HTTP response, headers and all. Uvicorn cannot tell the difference; it never asks what framework this is, because there is no framework. It just calls the callable. One side note: Uvicorn also logs that the lifespan protocol looks unsupported, because our eleven lines ignore lifespan. Our bridge ignores it too, and there is an appendix slide if anyone asks. So Starlette and FastAPI, with all their routing and dependency injection and validation, come down to exactly this: a callable that reads scope and talks through receive and send. Now turn it around, because this is the sentence the whole talk stands on: whoever calls this function, whoever builds the scope and passes in receive and send, that thing IS the server. By the way, this file lives in the slides repo with tests, so what you are reading is working code. -->

---

# Now a POST — enter `receive`

<div class="post-grid" mt-3 :class="$clicks >= 6 ? 'revealed' : ''">

<div class="post-cell post-left">

<div mb-1>Same shape — plus the <b><code>receive</code></b> loop</div>

<<< @/samples/raw-asgi/raw_asgi_post.py py {*|4-9|6|7|8-9|11-13|*}{'data-id':'post-app'}

</div>


<div class="post-cell post-right">

<div mb-1>…and the body comes back out the other side</div>

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

<div v-click="6" mt-3 text-center text-lg leading-tight>📥 The body isn't in <code>scope</code> —<br>you <b><code>await</code></b> it, <b>in pieces</b></div>

</div>

</div>

<div v-click="[2,5]">
<div class="receive-impl" data-id="ann-receive-impl" absolute top-26 right-5 w-108 bg-white dark:bg-black p-1.5 rounded border="~ violet/50 rounded-lg" shadow-lg>

<div flex items-center px-8 py-2 mx-auto gap-4 bg-white dark:bg-black text-4>
<span>🐍 app</span>
<div>
<div text-center op60>—— calls <code>receive()</code> ——▸</div>
<div text-center text-violet-600 dark:text-violet-400 font-bold>◂—— return the body ——</div>
</div>
<span>🦄 server</span>
</div>

```py
async def receive():
    return {"type": "http.request",
            "body": b"hello, PyCon KR",
            "more_body": False}
```

</div>
<FancyArrow from="[data-id=ann-receive-impl] @ bottomleft" to="[data-id=post-app] .line:nth-child(6) span:nth-child(5) @ right" arc="0.35" />
<FancyArrow from="[data-id=ann-receive-impl] @ left" to="[data-id=post-app] .line:nth-child(0) @ right" arc="-0.2" />
</div>

<style>
* {
  --slidev-code-font-size: 18px;
  --slidev-code-line-height: 1.5;
}
/* The `*` rule above sets the variable on every descendant, so trimming the
   aside a little has to reach the descendants too. */
.receive-impl,
.receive-impl * {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.35;
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

<!-- That app never used receive, because a GET has no body to read. So here are the same eleven lines with the third argument doing its job. [click] This block is the whole difference: the request body is not a value sitting in scope, it is a stream you pull from. [click] You await receive, and you get one event. And the other side is in the box beside it: that is what the caller passes in, the server in the sense we just defined. A plain async callable, holding the request, returning one http.request event per call. Uvicorn's version is fed by its HTTP parser as bytes come off the socket; ours, later in this talk, is fed by a JavaScript value. The same four lines either way. [click] And you keep going until an event comes back with more_body false, because a large upload arrives in pieces, and the client is still sending while your handler is already running. That is why receive is an async callable and not a bytes attribute: the body may not exist yet when the app starts. [click] After that it is the send pair you already know, with the body sent back. [click] Point Uvicorn at it, same as before. [click] POST some bytes, and they come back. Everything a framework does with request.body or a parsed form starts here, in this loop. And this is the last piece of the contract: scope describes the connection, receive pulls from the client, send pushes back. That is all of ASGI. -->

---

# So what does a framework give you?

<div class="fw-grid" mt-1 :class="$clicks >= 2 ? 'revealed' : ''">

<div class="fw-cell fw-left">

<div text-5 mb-1>FastAPI — routing, validation, docs…</div>

<<< @/samples/fastapi-is-asgi/app.py py {*}

<div v-click="1" mt-3>

<div text-5 mb-1>…and inside FastAPI itself:</div>

```py
class FastAPI(Starlette):
    ...
    async def __call__(
        self, scope: Scope,
        receive: Receive, send: Send,
    ) -> None:
        ...
```

<div text-xs op60 mt-1><a href="https://github.com/fastapi/fastapi/blob/master/fastapi/applications.py#L1160" target="_blank">fastapi/applications.py</a></div>

</div>

</div>

<div class="fw-cell fw-right">

<div text-5 mb-1>…and <code>app</code> is <b>still just the callable</b></div>

```py {1-2|*} {at: 3}
>>> callable(app)
True

>>> list(
...   inspect
...   .signature(app)
...   .parameters
... )
['scope', 'receive', 'send']
```

<div v-click="4" mt-3 text-center text-lg leading-tight>

🎁 A framework is a **nicer way to write the same callable**

</div>

</div>

</div>

<style>
* {
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
  --slidev-code-font-size: 15px;
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
  --slidev-code-font-size: 22px;
}
.fw-grid.revealed .fw-right {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!-- So if eleven lines is a working app, what is FastAPI for? All the things you actually want: routing, request parsing, validation, dependency injection, generated docs. You write decorated functions instead of dictionaries. [click] And here is why, from FastAPI's own source: the class defines __call__ with the ASGI signature, and passes straight through to Starlette. [click] So what FastAPI gives you is not a special framework thing that a server has to know about. Ask inspect for its signature and you get exactly three parameters: scope, receive, send. It IS an ASGI application, in the same way our eleven lines were. And you can go further than the signature: give it a scope, a receive and a send of your own, and it runs, with no server anywhere, returning None because the response goes out through send. I kept that off the slide because it needs three variables you cannot see, but there is a test in the repo that does exactly this, if anyone wants proof. [click] So a framework is not a different kind of thing from what we just wrote. It is a much nicer way to write the same callable. Which means anything that can call our eleven lines can call FastAPI too. Remember that. -->

---
plainBackground: true
---

# One `await` is the whole request

<div grid="~ cols-[1fr_auto_1fr]" gap-2 mt-6 pr-14 text-sm items-center>

<div text-center text-5 op60 font-bold pb-4>🖥️ Server <span op70>(e.g. Uvicorn)</span></div>
<div></div>
<div text-center text-5 op60 font-bold pb-4>🐍 ASGI application</div>

<div v-click="1" border="~ sky/40 rounded-lg" p-2 bg-sky:8 text-center text-4>builds <code>scope</code><br><span text-xs op70><code>{"type": "http", …}</code></span></div>
<div v-click="1" text-center text-xl op60>→</div>
<div v-click="1" text-4 op80><code>await app(scope, receive, send)</code><br><span op70>opens here — everything below is <b>inside</b> it</span></div>

<div v-click="2" op80 text-right text-5>the app wants the body</div>
<div v-click="2" text-center text-xl op60>←</div>
<div v-click="2" border="~ emerald/40 rounded-lg" p-2 bg-emerald:8 text-center text-5><code>await receive()</code></div>

<div v-click="3" border="~ sky/40 rounded-lg" p-2 bg-sky:8 text-center text-4><code>{"type": "http.request",</code><br><code>"body": b"…", "more_body": False}</code></div>
<div v-click="3" text-center text-xl op60>→</div>
<div v-click="3" op80 text-5>body delivered</div>

<div v-click="4" op80 text-right text-5>status + headers</div>
<div v-click="4" text-center text-xl op60>←</div>
<div v-click="4" border="~ emerald/40 rounded-lg" p-2 bg-emerald:8 text-center text-4><code>send({"type": "http.response.start"…})</code></div>

<div v-click="5" op80 text-right text-5>bytes <span op70>(repeat while <code>more_body</code>)</span></div>
<div v-click="5" text-center text-xl op60>←</div>
<div v-click="5" border="~ emerald/40 rounded-lg" p-2 bg-emerald:8 text-center text-4><code>send({"type": "http.response.body"…})</code></div>

<div v-click="6" op80 text-right text-5>response complete</div>
<div v-click="6" text-center text-xl op60>←</div>
<div v-click="6" border="~ gray/40 rounded-lg" p-2 bg-gray:8 text-center text-5>the coroutine <b>returns</b><br><span text-4 op70>no "done" event — returning <i>is</i> the signal</span></div>

</div>

<div v-click="1" absolute right-12 top-32 bottom-10 flex items-stretch gap-1 op60 text-xs>
<svg width="12" overflow-visible aria-hidden="true">
  <line x1="1" y1="1" x2="10" y2="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  <line x1="10" y1="1" x2="10" y2="99%" stroke="currentColor" stroke-width="1.5" />
  <line x1="1" y1="99%" x2="10" y2="99%" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</svg>
<div self-center style="writing-mode: vertical-rl">one <code>await</code></div>
</div>

<div absolute left-4 top-30 bottom-10 flex="~ col" items-center gap-1 op50 text-xs>
<div>time</div>
<svg width="14" flex-1 overflow-visible aria-hidden="true">
  <defs>
    <marker id="time-axis-head" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="6" refY="9">
      <path d="M2,2 L6,9 L10,2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </marker>
  </defs>
  <line x1="7" y1="2" x2="7" y2="96%" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" marker-end="url(#time-axis-head)" />
</svg>
</div>

<!-- Let's put the three pieces in order, because the order is the part people get wrong. The server builds the scope and makes one call. Watch the bracket on the right, because this is the part people misread: that await is not a step at the top, it is the whole height of this slide. It opens here and does not return until the bottom, and every exchange you are about to see happens inside it. The app calls back into the server's receive and send while the caller waits at that one await. [click] Inside, the app awaits receive when it wants the body. [click] The server answers with an http.request event; more_body false means that is all of it. [click] Then the app pushes its response out through send, in pieces: first response.start with the status and headers. [click] Then one or more response.body events with the bytes. That is where streaming happens, by keeping more_body true. [click] And here is the part worth correcting if you imagined this protocol differently: there is no completion event, no "done" message. The response is finished when the last body event has more_body false, and the request is finished when the coroutine returns. That return is the only completion signal there is. Remember it, because it is what makes the second half of this talk possible: you can await the app and then read whatever it gave you. -->

---
clicks: 2
---

# Demo, step 1: the normal case

<div class="demo-grid" mt-1 :class="$clicks >= 1 ? 'revealed' : ''">

<div class="demo-cell demo-left">

<div mb-1><code>main.py</code> <span op70>— the demo app, shortened</span></div>

<<< @/samples/runtime-agnostic-asgi-app/main.py#slide-routes py {*}{maxHeight:'305px'}

</div>

<div class="demo-cell demo-right">

<div class="demo-stack" :class="$clicks >= 2 ? 'covered' : ''">

<div class="demo-layer demo-repl">

<div text-5 mb-1>…and this <code>app</code> is <b>the ASGI callable</b></div>

```py {*}
>>> callable(app)
True

>>> list(
...   inspect
...   .signature(app)
...   .parameters
... )
['scope', 'receive', 'send']
```

</div>

<div class="demo-layer demo-run">

<div text-5 mb-1>…run it, open the page, click the button</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uv run uvicorn main:app
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

</WindowMockup>

<div mt-3>

<LiveEmbed url="http://127.0.0.1:8000" light height="170px" :zoom="0.6">

<div p-3 class="mock-page">
<div text-base font-bold mb-2>Runtime</div>
<button border="~ gray/40 rounded" px-2 py-1 text-xs bg-gray:10>Where am I running?</button>
<div mt-2 font-mono text-sm>Python 3.12 on <b>darwin/arm64</b> 🖥️</div>
</div>

</LiveEmbed>

</div>

</div>

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 22px;
  --slidev-code-line-height: 1.5;
}
/* WindowMockup's `light` pins the frame to white but leaves slot content on the
   theme's text colour, so this has to be pinned too or it vanishes in dark mode.
   Pinned rather than dropped because the page being mocked really is white. */
.mock-page {
  color: #1f2937;
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
/* The two right-hand panes share one grid cell so the second slides in over
   the first instead of displacing it, and so the row is already as tall as the
   taller of them before either arrives. */
.demo-stack {
  display: grid;
  align-items: start;
}
.demo-layer {
  grid-area: 1 / 1;
}
/* Fades only once the incoming pane is most of the way across, so the overlap
   is visible while it travels. */
.demo-repl {
  transition: opacity 300ms ease 400ms;
}
.demo-stack.covered .demo-repl {
  opacity: 0;
}
.demo-run {
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.demo-stack.covered .demo-run {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!-- Here is the app itself, step one of three. It is a few FastAPI routes: one serves the page, one reports where Python is running, one increments a counter so we have some state in the process to watch. Nothing you have not written before. [click] And before we run it, the same check we ran on FastAPI a moment ago, now on the app we are about to demo: it is callable, and its parameters are scope, receive, send. This is an ASGI application. Remember that, because in twenty minutes we are going to call it without a server. [click] But first, here it is in its normal place: uvicorn main:app, open localhost:8000, and there is a small page with a button. Click it, and the app answers: Python 3.12 on darwin arm64, my laptop. A real HTTP request went over a real socket to a real server process. Nothing surprising. All of this is in the slides repo if you want it: one FastAPI app and the three ways we run it today. Keep the button in mind. Its answer is about to get strange. -->

---
plainBackground: true
---

# What's actually running where — step 1

<div mt-6>

<ServerStackFigure />

</div>

<div v-click="1" mt-4 text-center text-xl>

The server half = **Uvicorn**. Watch that box 👀

</div>

<!-- Before we change anything, let's map what just happened, from the top. At the top, your app: main.py. Below it, Uvicorn, doing the whole server half: it accepts TCP connections, parses the HTTP bytes, builds a scope, and calls the app with scope, receive and send, the interface we just learned. Both run in a CPython process on some machine. And at the bottom, the browser page, talking to it over the real network. Completely ordinary. But watch Uvicorn's box, the sky-blue one, because the rest of this talk is about what else can sit in it. -->

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

<!-- But wait. Look again at what the contract said. A dict. Two async callables. Nowhere does ASGI mention sockets, or ports, or processes, or Linux. So a "server" is anything that can build a scope and call the app. Anything. And once you say it that way, a strange question becomes reasonable: do we even need a server machine? -->

---
layout: section
---

# 🌐 The extreme case

<div mt-4 op70>
A server inside your browser
</div>

<!-- Let's find out, by taking the server side somewhere it clearly does not belong: inside the browser. -->

---

# The enabler: Pyodide

<img src="/pyodide-logo.svg" alt="Pyodide" absolute top-10 right-12 h-16 />

<div mt-4 text-lg>

[Pyodide](https://pyodide.org/): **CPython compiled to WebAssembly** — real Python, in a browser tab

</div>

<div grid="~ cols-[2fr_1fr]" gap-8 mt-6 items-center>

<div h-full>

<v-clicks>

- No backend, no install — **just a web page**
- Python ⇄ JavaScript, direct calls
- **`micropip`** installs packages, in the page

</v-clicks>

</div>

<div v-click="4" border="~ gray/40 rounded-lg" p-3 bg-gray:5 text-center>
<div text-5 op70 mb-2>Browser tab</div>
<div border="~ violet/40 rounded" p-2 bg-violet:5>🐍 Pyodide<br><span text-4 op80>CPython on WASM</span></div>
<div text-xl op50 my-1>⇅</div>
<div border="~ sky/40 rounded" p-2 bg-sky:5>🌐 JavaScript / DOM</div>
</div>

</div>

<div absolute bottom-3 right-4 text-xs op40>
Pyodide logo by the Pyodide project, CC BY 4.0
</div>

<!-- One slide on the thing that makes this possible. Pyodide is CPython, the real one, compiled to WebAssembly, so it runs inside a browser tab. No backend, no install: it is a web page. Python and JavaScript can call each other directly, in both directions, and the whole demo depends on that. And micropip installs packages from PyPI into the page at runtime. There are real limits too, no threads and no raw sockets, but that is not what this slide is for. I have a slide about the limits near the end, and I would rather you first believe that this works at all. -->

---

# Python, called from JavaScript

<div text-sm>The whole boundary in one file — Python source as a <b>string</b>, the value comes back:</div>

<<< @/samples/pyodide-hello/hello.mjs js {*|1,3|5-9|11|*}

<div v-click="4" mt-1>

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

<!-- What does calling Python from JavaScript look like? This is the whole thing. Import loadPyodide and await it: that downloads the WebAssembly build and starts an interpreter. Then runPythonAsync takes Python source as a plain JavaScript string; here I import sys and evaluate an f-string. And the value of the last expression comes back as a JavaScript string, which I can log to the console. [click] Run it with node, and there it is: Python 3.13.2 on emscripten. Emscripten is the WebAssembly platform, so this is Python telling us it is not on your operating system any more. That is the whole trick the rest of this talk builds on: JavaScript can start Python, give it code, and get values back. -->

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

<!-- So let's line up what we have. [click] Pyodide gives us the app object: one pyimport, and the FastAPI app from step one is sitting in a JavaScript variable. [click] And the page already knows how to speak HTTP: fetch is right there, and every frontend uses it. [click] So put those together. Imagine our own fetch: same signature, same Request in, same Response out. But instead of going to the network, it calls our app the way ASGI says to call it. The frontend would not know the difference. That is the whole design. And you can see the hole in the middle: scope, receive and send do not exist yet. Nobody builds them. [click] So let me name the missing piece exactly, because it is the whole problem. On a server, a request arrives from the network as HTTP bytes, and something turns those bytes into an ASGI call: it builds the scope dict, implements receive and send, and awaits the app. That something is Uvicorn. To simplify a little, that translation layer is what does not exist in Pyodide. There is no Uvicorn in a browser tab, so nobody turns a request into an ASGI call. That, and only that, is what we are missing. -->

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

<div class="blank-mark" :class="$clicks >= 1 ? 'shown' : ''" absolute text-4xl style="left: 168px; top: 183px" aria-hidden="true">❓</div>
<div class="blank-mark" :class="$clicks >= 1 ? 'shown' : ''" absolute text-4xl style="left: 168px; top: 315px" aria-hidden="true">❓</div>

<div v-click="2" absolute bottom-12 inset-x-0 text-xl text-center>

Fill in the blanks and you have **a server** 🛠️

</div>

<style>
* {
  --slidev-code-font-size: 22px;
  --slidev-code-line-height: 1.5;
}
/* v-click toggles opacity, which a CSS animation cannot key off; binding the
   class instead lets the pop run at the moment the mark appears. */
.blank-mark {
  opacity: 0;
}
.blank-mark.shown {
  animation: blank-pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes blank-pop {
  from {
    opacity: 0;
    transform: scale(0.3) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>

<!-- So here is the shape of the thing we have to write, and it is one function. It takes the app and a request, and somewhere in the middle it makes the one ASGI call we spent the whole last section on: await app with scope, receive, send. [click] Two blanks. The first is the server's job: build the scope dict, and implement receive and send. The second is collecting what the app pushed out through send, and giving it back. [click] That is all a server is, once someone else handles the sockets. So let's fill in the blanks, in that order. -->

---

# ① Turn the request into a `scope`

<div mt-1 text-lg>

JS request → **the dict ASGI specifies**:

</div>

<div class="scope-grid" :class="$clicks >= 5 ? 'revealed' : ''">

<div class="scope-code">

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

</div>

<div class="scope-spec">
<div text-xs op70 mb-1 flex justify-between items-baseline gap-2>
<span>…every key is spelled out in the spec:</span>
<a href="https://asgi.readthedocs.io/en/latest/specs/www.html#http-connection-scope" target="_blank" whitespace-nowrap>asgi.readthedocs.io ↗</a>
</div>
<LiveEmbed
  url="https://asgi.readthedocs.io/en/latest/specs/www.html#http-connection-scope"
  title="asgi.readthedocs.io"
  light
  padding="0.4rem"
  height="248px"
>

<div text-4 p-2>The spec's **HTTP connection scope** section lists every key, and its type.</div>

</LiveEmbed>
</div>

</div>

<div v-click="6" mt-2 text-lg text-center>

The app just **reads** this — producing it is the **server's** side of the contract

</div>

<style>
* {
  --slidev-code-font-size: 16px;
  --slidev-code-line-height: 1.45;
}
.scope-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}
/* Same reveal as the deck's other two-pane slides: both sides hold their final
   width the whole time, so nothing re-wraps while the spec slides in. */
.scope-code {
  min-width: 0;
  width: calc(200% + 1rem);
  transition: width 700ms ease;
}
.scope-grid.revealed .scope-code {
  width: 100%;
}
.scope-spec {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  transform: translateX(calc(100% + 1rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.scope-grid.revealed .scope-spec {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!-- Step one: build the scope. JavaScript gave us a plain object: method, path, query, headers. Our job is to reshape it into the dict the spec describes. Most of it is mechanical: the type is the string http, and the method and path come straight across. But look at the details, because this is where the spec stops being abstract. The path is a str while the query string is bytes. Headers are not a dict; they are a list of tuples of two byte strings, with the names lowercased. ASGI is strict about every one of these. [click] And none of this is guesswork. Here is the spec itself, the HTTP connection scope section, listing every key and its type. This is the document you work from when you write one of these. [click] And that strictness is the point. The app never builds any of this. It just reads it, and trusts that whoever called it got the types right. Producing it is the server's side of the contract, and this is the first piece of that side we write ourselves. You never see it from FastAPI. You see it the moment you stand on the other side. -->

---

# ② Wire up `receive` and `send`

<div mt-1 mb-8 text-lg>

`receive`: **body in** · `send`: **response out**

</div>

```py {*|1-3|7-13|*}{'data-id':'wire-up'}
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

<div v-click="1">
<div data-id="ann-receive" class="wire-note" absolute top-34 right-20 flex items-center border="~ violet/50 rounded-lg" px-8 py-2 gap-4 bg-white dark:bg-black>
<span>🐍 app</span>
<div>
<div text-center op60>—— calls <code>receive()</code> ——▸</div>
<div text-center text-violet-600 dark:text-violet-400 font-bold>◂—— return the body ——</div>
</div>
<span>🌉 server</span>
</div>
<FancyArrow from="[data-id=ann-receive] @ left" to="[data-id=wire-up] .line:nth-child(1) @ right" arc="-0.05" />
</div>

<div v-click="2">
<div data-id="ann-send" class="wire-note" absolute top-70 right-14 w-90 flex items-center border="~ emerald/50 rounded-lg" px-2 py-1 gap-4 bg-white dark:bg-black>
<span>🐍 app</span>
<div>
<div text-center text-emerald-600 dark:text-emerald-400 font-bold>— calls <code>send(event)</code> with the response —▸</div>
<div text-center op60>◂—— <code>None</code> ——</div>
</div>
<span>🌉 server</span>
</div>
<FancyArrow from="[data-id=ann-send] @ bottom" to="[data-id=wire-up] .line:nth-child(8) @ right" arc="0.15" />
</div>

<style>
* {
  --slidev-code-font-size: 19px;
  --slidev-code-line-height: 1.45;
}
/* Wide enough that no line inside a note wraps, which the code font size is
   traded down to make room for. */
.wire-note {
  font-size: 20px;
  line-height: 1.4;
}
</style>

<!-- Step two: the two callables. receive is how the app asks for the request body. We give back one http.request event with the bytes JavaScript gave us, more_body false, and if the app asks again we tell it the client is gone. Notice the direction in the box beside it: the app calls receive, and the body comes back as the return value. Data moving from the server to the app. [click] send is the reverse in every way: the app sends its response in pieces, first http.response.start with the status and headers, then http.response.body events with the bytes. We do not interpret any of it; we just listen and store. And the direction flips: the data comes in as the argument, and nothing comes back. The same caller both times, opposite directions, and which side carries the data is the whole difference. [click] Two closures over a few local variables, and that is the whole server side of the contract. -->

---

# ③ Run the app, return the response

<div mt-1 text-lg>

**One call** — then collect what `send` gathered:

</div>

```py {*|1|3-4|*}{'data-id':'run-app'}
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

<!-- And here is the line the whole section was building towards, and it is one line. [click] Await the app, with our scope, our receive, our send. That is the call. Everything on the last three slides existed to make those three arguments. [click] When the coroutine returns, the response is already in the variables send filled in: status, headers, and the body pieces joined together. So we pack them up and give them back to JavaScript. [click] And that is the whole thing. A scope, a receive, a send, and one await. No sockets, no HTTP parsing, no port, no process. Just a function that satisfies a contract. -->

---

# ④ Call it from JavaScript

<div text-5><code>main.js</code> — <code>pyimport</code> is Python's <code>import</code>, spelled in JavaScript:</div>

<<< @/samples/runtime-agnostic-asgi-app/step2-browser/main.js#slide-call js {*}

<div v-click="1">

<div text-5 mt-1>…and <b>our own <code>fetch</code></b>, which answers out of Pyodide instead of the network:</div>

<<< @/samples/runtime-agnostic-asgi-app/step2-browser/main.js#slide-fetch js {1-3,6,9-13|1,9-13|6|*}{at:2,'data-id':'dispatch-js'}

</div>

<div v-click="[2,3]">
<div data-id="ann-sig" class="js-note" absolute top-60 right-5 w-100 bg-white dark:bg-black px-2 py-1 border="~ teal/60 rounded-lg">

Mimics JavaScript's built-in **`fetch()` interface**

</div>
<FancyArrow from="[data-id=ann-sig] @ left" to="[data-id=dispatch-js] .line:nth-child(1) @ right" arc="-0.1" />
<FancyArrow from="[data-id=ann-sig] @ bottom" to="[data-id=dispatch-js] .line:nth-child(9) @ right" arc="0.4" />
</div>

<div v-click="4">
<div data-id="ann-ffi" class="js-note" absolute top-74 right-5 w-100 bg-white dark:bg-black px-2 py-1 border="~ amber/60 rounded-lg">

**Pyodide's FFI** — JS ↔ Python type conversion <span op70>(→ appendix)</span>

</div>
<FancyArrow from="[data-id=ann-ffi] @ left" to="[data-id=dispatch-js] .line:nth-child(5) @ right" arc="-0.2" color="red" />
<FancyArrow from="[data-id=ann-ffi] @ bottom" to="[data-id=dispatch-js] .line:nth-child(7) @ right" arc="0.2" color="red" />
</div>

<style>
* {
  --slidev-code-font-size: 16px;
  --slidev-code-line-height: 1.45;
}
/* The typography preset sizes `p` directly, so inheriting a smaller size on
   the box alone would not reach the markdown paragraph inside it. */
.js-note, .js-note p {
  font-size: 24px;
  line-height: 1.45;
  margin: 0;
}
</style>

<!-- Fair question at this point: we have written Python, but who calls it? This is the JavaScript side, on the page itself. pyimport is the Python import statement, written in JavaScript: it gives back the module, and destructuring pulls out the app and our dispatch function as ordinary JavaScript values. And the thing we wrap them in is asgiFetch, the function we sketched before the section started. [click] Look at its two ends, because they are the whole design. It takes input and init, exactly what fetch takes, and it returns a Response, exactly what fetch returns. Anything on the page that can call fetch can call this instead and never notice. [click] In between is the line that matters, the only one on this slide I would ask you to remember: dispatch(app, pyRequest). Calling Python is just calling a function, and because dispatch is a coroutine, JavaScript awaits it like a Promise. [click] Now the two lines I made grey. Because we are on Pyodide's foreign function interface, values do not cross for free: toPy turns the JavaScript object into a Python one on the way in, and toJs turns the response dict back on the way out. There is an appendix slide on what that costs and where it hurts; ask me in Q&A. One production note: real apps move Python to a Web Worker, and there is a step-2b version in the repo. Stlite does that, as you will see in a minute. -->

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

<div class="demo2-grid" mt-4>

<div text-lg>

<v-clicks>

- 📄 Static page + Pyodide + **the same `main.py`**
- 🕵️ Network tab: **silent**
- ✂️ Kill the file server → **still answering**

</v-clicks>

</div>

<div>

<LiveEmbed url="http://localhost:8080/step2-browser/" title="localhost:8080/step2-browser/" light height="270px" :zoom="0.55">

<div p-3 class="mock-page">
<div text-base font-bold mb-2>Runtime</div>
<button border="~ gray/40 rounded" px-2 py-1 text-xs bg-gray:10>Where am I running?</button>
<div mt-2 font-mono text-sm>Python 3.14 on <b>emscripten/wasm32</b> 🤯</div>
</div>

</LiveEmbed>

</div>

</div>

<div v-click="4" mt-4 text-center text-xl>

Responses made **inside the tab** — nothing leaves it.

</div>

<style>
.demo2-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}
/* `light` on the window pins the frame white but leaves slot content on the
   theme's text colour, so the page being mocked has to pin its own. */
.mock-page {
  color: #1f2937;
}
</style>

<!-- OK, live demo time, step two. [DEMO] I have a static page here, served by a plain file server, with no backend logic at all. It starts Pyodide on the page and loads the same main.py from step one. The same page appears. Now I click the button, and look at the answer: Python 3.14 on emscripten wasm32. That is the app telling us it runs inside the browser. Watch the Network tab while I click again: nothing. No request leaves the page. And last, I stop the file server completely, and the app keeps answering. There is no server any more. The response is produced by Python running next to the JavaScript, in the same tab, by the forty-five lines you just read. OK, back to slides.

[DEMO SETUP] Serve the repo root, not step2-browser/ — the page loads ../main.py by relative fetch, and from inside the subdirectory that path falls outside the document root and Pyodide never boots. Open /step2-browser/. Also let Pyodide finish booting before killing the file server; the runtime and packages come from the CDN, but main.py and bridge.py come from that server. `pnpm dev:live` serves it on port 8080, which is the embed on this slide; `pkill -f "http.server 8080"` is the kill for the last beat. -->

---
clicks: 4
plainBackground: true
---

<h1>What’s actually running where — step <span class="step-swap"><span :class="$clicks >= 1 ? 'op0' : ''">1</span><span class="step-two" :class="$clicks >= 1 ? '' : 'op0'">2</span></span></h1>

<StackCompare mt-4 :columns="[
  { key: 'server', label: '① Server' },
  { key: 'browser', label: '② Browser', hidden: $clicks < 1 },
]">
  <template #server><ServerStackFigure aligned :highlight="$clicks === 2" :highlight-swapped="$clicks === 3" /></template>
  <template #browser><BrowserStackFigure aligned :highlight="$clicks === 2" :highlight-swapped="$clicks === 3" :worker="$clicks >= 4" :worker-highlight="$clicks >= 4" /></template>
</StackCompare>

<div class="punchline" mt-4 text-center text-xl :class="$clicks >= 1 ? 'op100' : 'op0'">

One box swapped — **the bridge plays Uvicorn's role** 🛠️

</div>

<style>
/* The two beats share one cell, so the second costs no height. */
.punchline-stack {
  display: grid;
}
.punchline-stack > * {
  grid-area: 1 / 1;
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

<!-- Here is the step-one picture again: app on top, Uvicorn as the server half, the page at the bottom, over the network. Now watch. [click] The browser version fades in next to it. Compare them layer by layer, from the top. The app: same file, unchanged, byte for byte. scope, receive, send: same interface. The page at the bottom: same UI, still making ordinary requests. The differences: the machine became the browser tab running Pyodide, the network became a plain function call, and Uvicorn's sky-blue box now holds bridge.py, about forty-five lines of our code. That is the whole trick: one box swapped, and the bridge is doing Uvicorn's job. [click] And here is what did not move: the app, and the interface it is called through, lit in both columns. [click] Then the box that did move: Uvicorn on the left, bridge.py on the right, with the runtime under each of them. Same file, same three arguments, on both sides of the swap. [click] One correction for production: Python on the main thread blocks rendering, so a real browser app runs Pyodide in a Web Worker, and that plain function call becomes message passing. Everything above the worker stays the same: same app, same three arguments. Keep this layering in mind; we see it again with Streamlit later. -->

---
layout: statement
---

## Something in that tab is<br>**doing Uvicorn's job**.

<div mt-8 text-2xl op80 v-click="1">

But a tidy demo is not proof. 🧐<br>Does the contract survive a **real framework**?

</div>

<!-- So that is the trick: something in that tab is doing Uvicorn's job, and that something was small enough to read in a talk, which is the part I like most. But let's be honest: a demo app with three endpoints is a small, clean world. Real frameworks are messy. Static files, sessions, realtime updates, state everywhere. Does the contract survive one of those? -->

---
layout: section
---

# 🏭 The production proof

<div mt-4 op70>
Streamlit in the browser
</div>

<!-- It does — and I can say that with some confidence, because I've shipped it. Twice. -->

---

# Streamlit

<div class="st-grid" mt-1 :class="$clicks >= 1 ? 'revealed' : ''">

<div class="st-cell st-left">

<div mb-1>Build web apps with <b>only Python</b>:</div>

<<< @/samples/streamlit-demo/app.py py {*}{maxHeight:'180px'}

<div mt-4>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ streamlit run app.py
```

</WindowMockup>

</div>

</div>

<div class="st-cell st-right">

<div class="st-stack" :class="$clicks >= 2 ? 'covered' : ''">

<div class="st-layer st-app">

<LiveEmbed url="http://localhost:8501/?embed=true" title="localhost:8501" padding="0.4rem" height="300px" :zoom="0.6">

<img src="/streamlit-demo.png" alt="The demo app running: a Sales dashboard title, a Rows slider, and a line chart" class="dark:hidden" style="max-height: 300px; width: auto;" />
<img src="/streamlit-demo-dark.png" alt="The demo app running: a Sales dashboard title, a Rows slider, and a line chart" class="hidden dark:block" style="max-height: 300px; width: auto;" />

</LiveEmbed>

</div>

<div class="st-layer st-stackfig text-sm">

<div class="border border-gray-400/40 rounded-xl p-2 bg-gray-400/5">
<div class="text-center text-xs op60 mb-1">🖥️ Server machine</div>
<div class="border border-violet-400/40 rounded-lg p-2 bg-violet-400/5">
<div class="text-center text-xs op60 mb-1">🐍 CPython</div>
<div class="grid grid-cols-2 gap-1">
<div class="border border-emerald-400/40 rounded-lg p-2 bg-emerald-400/10 text-center leading-tight">
🐍 <b>Your script</b><br><span class="text-xs op80">written in Python</span>
</div>
<div class="border border-emerald-400/40 rounded-lg p-2 bg-emerald-400/10 text-center leading-tight">
📁 <b>Static assets</b><br><span class="text-xs op80">images, data files</span>
</div>
</div>
<div class="grid grid-cols-2 gap-1 text-center text-xs op60 my-0.5">
<div>⇅ runs your script</div>
<div>↓ serves</div>
</div>
<div class="border border-amber-400/40 rounded-lg p-2 bg-amber-400/10 text-center leading-tight">
🎈 <b>Streamlit runtime</b><br><span class="text-xs op80">ScriptRunner &amp; an HTTP server</span>
</div>
</div>
</div>

<div class="text-center text-xs op60 my-0.5">⇅ HTTP + WebSocket</div>

<div class="border border-gray-400/40 rounded-xl p-2 bg-gray-400/5">
<div class="text-center text-xs op60 mb-1">🌐 Browser</div>
<div class="border border-teal-400/40 rounded-lg p-2 bg-teal-400/10 text-center leading-tight">
📄 <b>Frontend app</b><br><span class="text-xs op80">served from bundled static assets</span>
</div>
</div>

<div v-click="3" mt-2 text-center text-lg>

`pip install streamlit` ships<br>**the server *and* its frontend**<br>
<span text-base op80>the same shape as our demo app 👀</span>

</div>

</div>

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.5;
}
/* The script pane holds the whole slide, then gives up half of it as the app
   arrives on the right; the architecture then replaces the app in place, so the
   two right-hand panes read as one answer developing rather than two panels. */
.st-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}
.st-left {
  width: calc(200% + 1.25rem);
  transition: width 700ms ease;
}
.st-grid.revealed .st-left {
  width: 100%;
}
.st-right {
  position: relative;
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.st-grid.revealed .st-right {
  transform: translateX(0);
  opacity: 1;
}
.st-stack {
  display: grid;
  align-items: start;
}
.st-layer {
  grid-area: 1 / 1;
}
.st-app {
  transition: opacity 300ms ease 400ms;
}
.st-stack.covered .st-app {
  opacity: 0;
}
/* Travels in from the right like the panes on the demo slides, rather than
   cross-fading in place, so the architecture reads as arriving over the app. */
.st-stackfig {
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.st-stack.covered .st-stackfig {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!-- Before I show you Stlite, thirty seconds on what Streamlit is, because the architecture is the part that matters today. You write a plain Python script, and that is all. No HTML, no JavaScript, no frontend build step. Call st.title, st.slider, st.line_chart, and run it with one command: streamlit run app.py. [click] And you get this: an interactive dashboard, and dragging that slider re-runs the script and redraws the chart. Two files, no frontend work. [click] So how does a script become a web page? That command starts the Streamlit runtime on CPython in your process: it runs your script, keeps its state, serves your static files, and answers HTTP. That server gives the browser a JavaScript single-page app, and that frontend is not something you built or downloaded from a CDN; it ships inside the pip package. The SPA then talks back to the Python server over HTTP and a WebSocket. [click] That is the part to remember: one Python package contains both halves of a web application, the server and the frontend it serves. And look at the picture: your code on top, a Python HTTP server under it, both inside CPython, and a frontend page in the browser talking over the network. That is exactly the shape we spent the first half of this talk taking apart. Which raises the obvious question: if we could move our demo app's server into the browser, could we do it to this one? -->
---

# What are these frameworks built on?

<div mt-2>

| Framework | Server stack |
| --------- | ------------ |
| Streamlit | Starlette — **ASGI** <span op70>(since 1.57)</span> |
| Shiny for Python | Starlette — **ASGI** |
| Gradio | FastAPI — **ASGI** |

</div>

<div v-click="1" mt-4 text-lg>

**Heavyweight** apps: static assets · sessions · state · realtime

</div>

<div v-click="2" mt-2 text-xl>

Underneath, every one of them is **an ASGI app + a server** 🤔

</div>

<!-- Before we go further, look at what these frameworks are built on. The right column is the interesting one. Shiny sits on Starlette, Gradio on FastAPI, and Streamlit joined them in 1.57, when it replaced Tornado with Starlette and Uvicorn. Not every Python app framework is ASGI; Panel, for example, is still on Bokeh's Tornado server. But these three are, and these three are the ones we follow into the browser in a minute. [click] And these are big systems: static assets, sessions, per-user state, realtime updates. Nothing like a three-endpoint demo. [click] But in structure? An ASGI app with a server underneath it. Exactly the shape we just took apart. So the obvious question: if the server half can be swapped for our forty-five lines, can it be swapped for these too? -->

---
clicks: 3
plainBackground: true
---

# Standard Streamlit vs. Stlite

<StackCompare mt-2 :columns="[
  { key: 'streamlit', label: 'Standard Streamlit' },
  { key: 'stlite', label: 'Stlite', hidden: $clicks < 1 },
]">
  <template #streamlit><StreamlitStackFigure aligned :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
  <template #stlite><StliteStackFigure :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
</StackCompare>

<div class="punchline" mt-2 text-center text-lg :class="$clicks >= 1 ? 'op100' : 'op0'">

Same app, same Streamlit — **only the server half and the runtime change** 🎈

</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
</style>

<!-- Same picture as the demo app, with something much bigger on top. On the left, standard Streamlit: your script, the Streamlit runtime running it, Uvicorn underneath turning HTTP into ASGI calls, all on CPython on some machine, and the React frontend in the visitor's browser over the network. [click] And here is Stlite. Read the rows across. Your script: same. The Streamlit runtime, with its ScriptRunner and all its state: same. That is the whole point: it is the real Streamlit, not a rewrite. scope, receive, send: same interface. The frontend at the bottom: the same React SPA. What changed is the two layers we have been swapping all talk: Uvicorn becomes Stlite's ASGI bridge, CPython becomes Pyodide, and the network becomes messages inside the page. And notice one difference from our demo: Stlite runs Pyodide inside a Web Worker. Ours ran on the main thread because that makes the call easy to see; production moves it off the main thread so Python cannot freeze the UI. The bridge is the same either way. [click] And there it is, lit up: your script, Streamlit itself, and the interface between them and the server half, identical on both sides. [click] And now the two rows that did move: the caller, and the Python runtime under it. That is the whole difference. The same swap as our forty-five-line demo, only carrying a whole framework. -->

---
clicks: 2
---

# Real frameworks, really in the browser

Not just Streamlit — the same swap, done across the ecosystem:

<div class="fw-table" mt-2 :class="$clicks >= 1 ? 'reveal' : ''">

| Framework | Server stack | <span>In-browser version</span> |
| --------- | ------------ | ------------------ |
| Streamlit | Starlette — **ASGI** | <span>[Stlite](https://github.com/whitphx/stlite) (me) <img src="/stlite.svg" alt="Stlite" inline h-5 /></span> |
| Shiny for Python | Starlette — **ASGI** | <span>[Shinylive](https://github.com/posit-dev/shinylive) (Posit)</span> |
| Gradio | FastAPI — **ASGI** | <span>[Gradio-Lite](https://github.com/gradio-app/gradio-lite) <span op60>(me — now unmaintained)</span></span> |

</div>

<div v-click="2" mt-4 text-xl text-center>

Each one needed a **server half** in the browser — **ASGI is the right shape** 💡

</div>

<style>
/* The in-browser column holds its space from the start so the table never
   reflows; the cells slide in on the click that makes them the point. */
.fw-table :is(th, td):nth-child(3) {
  opacity: 0;
  transition: opacity 600ms ease;
}
.fw-table :is(th, td):nth-child(3) > span {
  display: inline-block;
  transform: translateX(0.9rem);
  transition: transform 600ms ease;
}
.fw-table.reveal :is(th, td):nth-child(3) {
  opacity: 1;
}
.fw-table.reveal :is(th, td):nth-child(3) > span {
  transform: none;
}
</style>

<!-- So it worked for Streamlit, and it is not only Streamlit. Here are the same three frameworks with the ASGI stacks we just looked at. [click] And every one of them has a version that runs in the browser. Posit built Shinylive for Shiny, and I worked with the Gradio team on Gradio-Lite, though that one is not maintained now; the WASM work moved into Gradio itself. And I should be clear about the order: Shinylive did it first, and Stlite's bridge is strongly inspired by theirs. So this is not three teams having the same idea by accident; it is one good idea being picked up, which is a more useful story anyway. Three frameworks, three ports, three separate codebases, and what made each of them possible is the middle column. Because the framework already spoke ASGI, nobody had to invent a protocol; the server half was the only part anyone had to write. [click] That is the argument for the standard: aim at the interface, and the port becomes a bridge instead of a rewrite. -->

---
layout: statement
---

## The app doesn't care **who calls it**.

<div mt-8 text-2xl op80 v-click="1">

Then the browser can't be the only unusual caller… 😏

</div>

<!-- So here is where we are: the app does not care who calls it. Uvicorn, or forty-five lines of bridge, it does not matter. And once you believe that sentence, you start looking for other unusual callers. Because the browser cannot be the only one. -->

---
layout: section
---

# ☁️ Stranger still: Pyodide on the edge

<div mt-4 op70>
The browser runtime, running someone's production traffic
</div>

<!-- And here's my favorite one, because it takes the strange thing one step further. -->

---

# Cloudflare Workers run Python — on Pyodide

<div mt-8 text-6 leading-13>

<v-clicks>

- ☁️ **Cloudflare Workers** — serverless at the edge, on **workerd** (JS/WASM)
- 🐍 **Python Workers = Pyodide** — the same WASM CPython, now *server-side*
- 🔁 **Full circle** — what V8 did for JS, workerd does for this Python stack

</v-clicks>

</div>

<!-- Cloudflare Workers are serverless functions running on Cloudflare's edge network, on a runtime called workerd, which is built on V8 and speaks JavaScript and WebAssembly. And when Cloudflare added Python support, guess how they did it. Pyodide. The same WebAssembly CPython from our browser story, except now it runs server-side, on the edge. I like this because it repeats history: V8 took JavaScript, which was born in the browser, and put it on the server, and now workerd is doing the same to the Python stack that was born in the browser. That is a nice symmetry by itself. But the part I really want to show you is on the next slide, so let's look at the code. -->

---
clicks: 4
---

# Demo, step 3: the entire entrypoint

<div mt-2 text-lg>

The whole file — nothing left out:

</div>

<div class="edge-grid">

<div class="edge-cell">

<<< @/samples/runtime-agnostic-asgi-app/step3-cloudflare/src/entry.py py {*|4|2,7-11|1,9-11}{maxHeight:'320px','data-id':'entry'}

</div>

<!-- The app lands in the space the annotations were floating in, so they leave as
     it arrives rather than being covered by it. -->
<div class="edge-cell edge-app" :class="$clicks >= 4 ? 'arrived' : ''">

<LiveEmbed url="https://runtime-agnostic-asgi-app.whitphx.workers.dev" title="Cloudflare Workers" light height="240px" :zoom="0.55">

<div text-center text-4 py-6>

→ `Python 3.13 on emscripten/wasm32`<br />**from the edge** 🌍

</div>

</LiveEmbed>

</div>

</div>

<!-- The frame's title bar cannot hold the whole host, and the address is the part
     the audience writes down, so it gets its own line under both columns. -->
<div class="edge-url" mt-2 text-center :class="$clicks >= 4 ? '' : 'op0'">

<a href="https://runtime-agnostic-asgi-app.whitphx.workers.dev" target="_blank">runtime-agnostic-asgi-app.whitphx.workers.dev</a> — **live, right now** 🌍

</div>

<div class="entry-notes" :class="$clicks >= 4 ? 'op0' : ''">

<div v-click="1">
<div data-id="ann-symlink" class="entry-note" absolute top-24 right-8 bg-white dark:bg-black px-2 py-1 border="~ sky/60 rounded-lg">

`src/main.py` is **a symlink to step 1's app**

</div>
<FancyArrow from="[data-id=ann-symlink] @ (20%, 100%)" to="[data-id=entry] .line:nth-child(4) @ right" arc="0.15" />
</div>

<div v-click="3">
<div data-id="ann-asgi" class="entry-note" absolute top-60 right-8 bg-white dark:bg-black px-2 py-1 border="~ amber/60 rounded-lg">

🤯 Cloudflare **ships the bridge** <br /> `asgi` does what we just wrote by hand

</div>
<FancyArrow from="[data-id=ann-asgi] @ left" to="[data-id=entry] .line:nth-child(9) @ (38%, 0)" arc="-0.2" color="red" />
</div>

</div>

<style>
.edge-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.25rem;
  align-items: start;
}
.edge-cell {
  min-width: 0;
}
/* Slides in from the right, like the browser pane in the step-1 demo. */
.edge-app {
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.edge-app.arrived {
  transform: translateX(0);
  opacity: 1;
}
.entry-notes,
.edge-url {
  transition: opacity 200ms ease;
}
</style>

<!-- Step three of the demo. This is the whole Cloudflare entrypoint; I am not hiding anything, this is the entire file. Two imports and a fetch handler. Import the app, and note that src/main.py is a symlink to the same main.py from steps one and two. And in the handler, one line: give the app to asgi.fetch. [click] Now read that first import again, because this is the part I have been waiting to show you all talk. Cloudflare's SDK ships a module called asgi, and asgi.fetch does exactly what we spent the last section building: it takes a JavaScript Request, builds the scope, wires up receive and send, and awaits the app. We wrote that in forty-five lines to show it could be done. They wrote it as a supported product feature. If the browser demo still felt like an experiment, this is the slide where it stops being one. It is deployed; you can open that URL right now. Click the button and it says: Python 3.13 on emscripten wasm32, answered from a Cloudflare data center near you. Same app. Third runtime. No changes.

[DEMO SETUP] Deploy well before the talk and hit the URL once to warm it. For about a minute after a deploy, requests intermittently come back as edge errors while the new version propagates, and a cold isolate takes around three seconds against roughly one second warm. -->

---
clicks: 3
plainBackground: true
---

<h1>What’s actually running where — step <span class="step-swap"><span :class="$clicks >= 1 ? 'op0' : ''">2</span><span class="step-two" :class="$clicks >= 1 ? '' : 'op0'">3</span></span></h1>

<StackCompare mt-4 :columns="[
  { key: 'server', label: '① Server' },
  { key: 'browser', label: '② Browser' },
  { key: 'edge', label: '③ Edge', hidden: $clicks < 1 },
]">
  <template #server><ServerStackFigure aligned :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
  <template #browser><BrowserStackFigure aligned worker :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
  <template #edge><CloudflareStackFigure :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
</StackCompare>

<div class="punchline-stack" mt-4 text-center text-xl>
<div v-click="1"><b>Same file</b> · 3 Pythons · 3 transports · <b>0 changes</b></div>
<div v-click="2" font-bold text-sky-600>The interface holds — everything below it is swappable</div>
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

<!-- Here are both stacks we have seen: server on the left, browser in the middle. [click] And the edge joins them. Read across the top row: the same file, three times. Read the row below it: scope, receive, send, three times. Now read the sky-blue row, and that is the only thing that moves: Uvicorn, then our forty-five-line bridge, then Cloudflare's asgi module, which I did not write at all. Two more things worth noticing. The edge column's runtime frame says Pyodide, same as the browser: Cloudflare runs Python the same way a browser does, in a Python Worker on their machines instead of a tab on the visitor's. And the frontend went back outside over a real network, exactly like column one. It ran on Python 3.12, 3.14 and 3.13, over TCP sockets, a direct call, and JavaScript Request objects, and the file on top never changed; two of these load it and the third symlinks it. [click] And watch what lights up: the app, and the interface it is called through, in all three columns at once. That band is the constant. It is the same file and the same three arguments whether the caller is Uvicorn on a server, forty-five lines in a tab, or Cloudflare's SDK at the edge. You port the app by swapping the box underneath it and changing nothing inside it. [click] And there is the swap itself: the caller and the runtime, the only two boxes that differ between these columns. Not a deployment trick, but a property of the architecture. -->

---
clicks: 3
---

# Adding to the family

<div class="faas-table" mt-2 text-5 :class="$clicks >= 1 ? 'reveal' : ''">

| Platform | What calls your app |
| -------- | ------------------- |
| λ **AWS Lambda** | `Mangum(app)` <span op60>— the community's</span> |
| 🔷 **Azure Functions** | `func.AsgiFunctionApp(app)` <span op60>— in the SDK</span> |
| ▲ **Vercel** | <span op60>nothing — it finds your `app`</span> |
| ☁️ **Cloudflare Workers** | `asgi.fetch(app, …)` <span op60>— in the SDK</span> |
| 🌐 **Your browser tab** | `bridge.py` <span op60>— our 45-line example</span> |

</div>

<div v-click="2" mt-4 text-center text-6>

Every one: build a `scope` · wire `receive` / `send` · **`await app(...)`**

</div>

<div v-click="3" mt-2 text-center text-5 op80>

Older than ASGI — WSGI had Zappa (2016) · `apig-wsgi` · `serverless-wsgi`

</div>

<style>
/* The two runtimes this talk added join a list the audience already knows, so
   they arrive together, after it. */
.faas-table tbody tr:nth-last-child(-n + 2) {
  opacity: 0;
  transition: opacity 500ms ease;
}
.faas-table.reveal tbody tr:nth-last-child(-n + 2) {
  opacity: 1;
}
</style>

<!-- None of this is new, and that is the point. If you have ever deployed a FastAPI app to AWS Lambda, you have almost certainly used Mangum: one import, wrap your app, done. Azure ships the same thing inside their own SDK. Vercel does not even ask you to name it; it finds an object called app and calls it. And remember the servers list from the beginning of the talk, Uvicorn, Hypercorn, Granian, and one name that did not belong? That was Mangum. [click] So here is what we did today: we added two more members. Cloudflare's edge, and a browser tab with forty-five lines in it. They are not strange relatives of this list; they are the same thing. [click] Because every one of these is the code we wrote together: build a scope, wire up receive and send, await the app. I read Mangum's source while preparing this talk, and it is strikingly similar. Its receive is a get from a queue that was filled with the request body, its send takes response.start for the status and headers and collects the body pieces, then it awaits the app and reshapes the result for Lambda. It even collects instead of streaming, exactly the shortcut we took. My favourite detail: Mangum is maintained by Marcelo Trylesinski, who also maintains Uvicorn and Starlette. The same person maintains the thing that calls your app from a TCP socket and the thing that calls it from a Lambda event. That is what an interface is for. [click] And this is older than ASGI. Zappa was doing it for WSGI in 2016, and apig-wsgi and serverless-wsgi still do it. So the browser was the unusual one, but the technique is completely normal; most of you have already shipped it without thinking about what that import was doing. Now, one last look at what it gave me. -->

---
clicks: 3
plainBackground: true
---

# Stlite went to the edge, too

<StackCompare mt-2 :columns="[
  { key: 'streamlit', label: 'Standard Streamlit' },
  { key: 'stlite', label: 'Stlite — in the browser' },
  { key: 'edge', label: 'Stlite — on Cloudflare', hidden: $clicks < 1 },
]">
  <template #streamlit><StreamlitStackFigure aligned :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
  <template #stlite><StliteStackFigure :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
  <template #edge><StliteEdgeStackFigure aligned :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
</StackCompare>

<div v-click="2" mt-2 text-center text-xl>

**Same app, same bridge — only the caller changed** 🔁

</div>

<div class="punchline" absolute top-14 right-6 text-sm :class="$clicks >= 1 ? 'op60' : 'op0'">
<code>@stlite/cloudflare</code> — <a href="https://github.com/whitphx/stlite/pull/2077" target="_blank">stlite#2077</a>, experimental
</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
</style>

<!-- And of course, once I saw Cloudflare running Pyodide, I had to try it with Stlite. Here are the two columns you just saw. Read the rows across them one more time: your script, the Streamlit runtime, scope-receive-send, the same React frontend. [click] Now the third column: at-stlite-slash-cloudflare, PR 2077, experimental. Pyodide again, but in a Python Worker at the edge instead of a Web Worker in the tab. Stlite's ASGI bridge again, but fed by edge requests instead of browser events. And the frontend goes back over a real network, like the first column. So the top three rows are identical in all three, and the bottom three have now been swapped twice. [click] And there it is, lit up across all three: your script, Streamlit itself, and the interface between them and the server half, identical in every column. [click] And now the rows that did move, in all three: the caller and the runtime under it, swapped twice. Nothing above the bridge changed. Only the caller did. When your server half aims at an interface instead of an environment, moving to a new environment is configuration, not a rewrite. -->

---
layout: section
---

# 🧭 When to reach for this

<div mt-4 op70>
Practical uses — and honest limits
</div>

<!-- OK. So in-browser Python web apps are possible, and the architecture works. When would you actually want this? -->

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

In production: [Streamlit Playground](https://streamlit.io/playground) powered by Stlite

</div>

<!-- Four things I keep coming back to. Static hosting: ship a whole web app as files on GitHub Pages or a CDN, with no backend to run or pay for, and it scales with visitors because each visitor brings their own compute. Runnable documentation: live, editable examples inside the docs. Education: teach FastAPI or Streamlit to a room of beginners with no setup; it just runs in their tab. And privacy: everything is client-side, so the user's data never leaves their device, which is a real advantage for sensitive data. And this is not theoretical: the official Streamlit Playground and Gradio Playground use this exact architecture, in production, today. -->

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

<!-- And the honest part, because this is not magic. Dependencies: everything ships to the browser, and not everything is available. The good news is that the whole stack we have been using, FastAPI, Starlette, Pydantic, anyio, ships inside the Pyodide distribution, so it loads from the CDN with no trip to PyPI. But the demo still needed one extra install: python-multipart, which FastAPI needs to parse a form. It is pure Python, no C extension at all, and it is simply not in the distribution, so without micropip installing it that one endpoint returns a 500. That is the shape of this limit: it is not "no C extensions", it is "check the distribution, then check what micropip can add". It is single-threaded and sandboxed, and here is a concrete example: Starlette runs sync def endpoints in a thread pool, and WASM cannot start threads, so a sync endpoint that works fine under Uvicorn fails in the browser with "can't start new thread". Every endpoint in the demo app is async def for that reason. Secrets are impossible: anything in the page, the user can read. And there is no inbound networking; the tab has no public address, so no webhooks. So this works together with real servers, it does not replace them. Use it where its strengths fit. -->

---

# Key takeaways

<div mt-6 text-xl>

<v-clicks>

- 🧩 **ASGI = a clean interface** — your app on one side, *any caller* on the other
- ⚡ The whole contract: **`scope` · `receive` · `send`** — no sockets in it
- 🌉 **A server = anything that fulfills it** — Uvicorn · Lambda · the edge · a tab
- 🔁 **One app, unchanged, across all of them** — that's the portability
- 🏭 **In production today** — `Mangum`, the vendors' SDKs, Stlite, the playgrounds
- 🧠 **I learned ASGI by writing the other side of it**

</v-clicks>

</div>

<!-- Six things to take away. One: ASGI cuts a clean interface, your app on one side and whoever can call it on the other. Two: the whole contract is scope, receive and send, and it never mentions sockets, ports or machines. Three: because of that, a server is anything that satisfies it: Uvicorn, a Lambda adapter, Cloudflare's edge, or forty-five lines of Python in a browser tab. Four, and this is the one the whole talk was built for: the same app ran on every one of them without changing a line. That is what a clean interface gives you. Five: all of this runs in production right now: Mangum, the SDKs Azure and Cloudflare ship, Stlite, the official Streamlit and Gradio playgrounds. And if you have deployed FastAPI to Lambda, you were already in this family before you walked in here. And six, the one I took away from building this: I learned ASGI by writing the other side of it. Reading the spec had never made it clear. -->

<div v-click mt-10 grid="~ cols-[1fr_auto]" gap-8 items-center>

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
Web Workers, the FFI, and the parts of ASGI the talk skipped
</div>

<!-- Appendix, for Q&A: the boundary tax I promised, and the two connection types the main talk skips, plus streaming. -->

---

# Step 2b: the same bridge, in a Web Worker

<div mt-2 text-lg>

Python on the page's main thread **blocks rendering** while it runs. Production moves it:

</div>

<div grid="~ cols-2" gap-6 mt-4>

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

<div grid="~ cols-2" gap-4 mt-4>

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

<!-- This is the appendix slide I promised when I made those two conversion lines grey. The bridge sits on one layer real servers do not have: the foreign function interface between JavaScript and Python. And from years of this, I can tell you the bugs live here. Four things to know. JS objects arrive in Python as proxies, not dicts, so convert them explicitly. Binary bodies come as Uint8Arrays, and every conversion copies the buffer, which matters when someone uploads a fifty-megabyte file. In the other direction, to_js turns a dict into a JavaScript Map by default, not a plain object; there is a dict_converter option, and every Pyodide developer hits this once. And one nice surprise: async works well across the boundary. JS can await a Python coroutine as a Promise, and the two event loops run together without problems. So if Uvicorn's network layer is sockets and parsers, ours is type conversion. Different mechanics, same role in the stack. -->

---

# `scope["type"]`: the three connection types

<div mt-4 text-lg>

`scope["type"]` says which one — **the call never changes**

</div>

<div grid="~ cols-3" gap-4 mt-6>

<div border="~ sky/40 rounded-lg" p-4 bg-sky:5>
<div text-xl mb-1>🌐 <b><code>"http"</code></b></div>
<span op80>request → response<br>
<span op60>(the whole talk)</span></span>
</div>

<div border="~ violet/40 rounded-lg" p-4 bg-violet:5>
<div text-xl mb-1>🔌 <b><code>"websocket"</code></b></div>
<span op80>long-lived, two-way<br>
<span op60>(ahead)</span></span>
</div>

<div border="~ amber/40 rounded-lg" p-4 bg-amber:5>
<div text-xl mb-1>♻️ <b><code>"lifespan"</code></b></div>
<span op80>startup / shutdown<br>
<span op60>(ahead)</span></span>
</div>

</div>

<div mt-8 text-center text-xl>

Only the **event names** differ — learn one, you can read all three ✅

</div>

<!-- The index for the rest of this appendix, if the question is "what about the other two?". ASGI carries three kinds of connection and the app reads scope type to find out which it has. The important part is that the call is identical for all three: same three arguments, same awaiting of receive, same calling of send. What changes is only the strings inside the events — websocket.receive instead of http.request, and so on. So everything in the main talk transfers; the next slides are just the event names. -->

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
<div data-id="ann-lifespan" absolute top-64 right-4 w-52 bg-white dark:bg-black p-2 rounded border="~ amber/60 rounded-lg">

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

<!-- One more protocol, because skipping it is the classic bridge bug: lifespan. There is no client involved; it is how the app is told "you are starting up" and "you are shutting down". It is where FastAPI runs its lifespan handlers: opening database pools, loading models, warming caches. Uvicorn drives this when the process starts; our bridge has to drive it when the page loads. The same tools as before: a lifespan scope, a queue, receive and send. We push a startup event, wait for the app to answer startup-complete before serving any request, and keep the whole thing running as a background task until shutdown. If you forget this, everything looks fine, until someone's database pool is never initialized and they spend an afternoon finding out why. Do not skip lifespan. -->


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
<div data-id="ann-more-body" absolute top-64 right-4 w-52 bg-white dark:bg-black p-2 rounded border="~ emerald/50 rounded-lg">

**keep the stream open** while `more_body`

</div>
<FancyArrow from="[data-id=ann-more-body] @ left" to="[data-id=streaming] .line:nth-child(6) @ right" arc="0.2" />
</div>

<div v-click="4" mt-4 text-lg text-center>

Chunk → JS `ReadableStream` **as it's sent** — token streams work in-browser 📡

</div>

<!-- The dispatch from the main talk collects the whole response and returns it at the end. That works, until the app uses StreamingResponse or server-sent events. Think of progress updates, or a chatbot sending tokens one at a time; Gradio's UI depends on this a lot. If you collect everything first, the user sees nothing until it is all done. The fix is to respect more_body. On response.start we open a JavaScript ReadableStream immediately. Each body event goes to JS right away, and when more_body becomes false we close the stream. The JS side reads it exactly like a real fetch, and streaming UIs just work, fully in the page. This slide is the simple version; the production ones also handle backpressure. -->

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

<div grid="~ cols-2" gap-4>

<div v-click="2">
<div data-id="ann-js-push" border="~ violet/40 rounded-lg" px-2 py-1.5 bg-white dark:bg-black>
🟦 called <b>from JavaScript</b> — <code>on_js_message</code> is <b>fire-and-forget</b>
</div>
<FancyArrow from="[data-id=ann-js-push] @ top" to="[data-id=ws-session] .line:nth-child(5) @ right" arc="0.2" />
</div>

<div v-click="3">
<div data-id="ann-app-pull" border="~ emerald/40 rounded-lg" px-2 py-1.5 bg-white dark:bg-black>
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

<!-- WebSockets are harder because they are long-lived and the timing is reversed. JavaScript receives messages whenever they arrive: it is push-driven. But the ASGI app is pull-driven; it awaits receive and expects the next message to be given to it. So we connect a push world to a pull world, and the standard tool is an asyncio.Queue. JS adds events without awaiting; the app's receive awaits queue.get and waits until something arrives. The queue absorbs the timing difference, and this small buffer is the centre of in-browser WebSockets. -->

---

# WebSocket: the session lifecycle

<div mt-2 text-lg>

Same `receive` / `send` — **new event names**:

</div>

<div grid="~ cols-[6rem_1fr_1fr]" gap-4 mt-4 items-center>
<div></div>
<div text-center op70>📥 the app <b>receives</b></div>
<div text-center op70>📤 the app <b>sends</b></div>
</div>

<div v-click="1" grid="~ cols-[6rem_1fr_1fr]" gap-4 mt-2 items-center>
<div text-base>① <b>open</b></div>
<div border="~ violet/40 rounded-lg" p-2><code>"websocket.connect"</code><br><span op70 text-xs>we enqueue it when JS opens</span></div>
<div border="~ emerald/40 rounded-lg" p-2><code>"websocket.accept"</code><br><span op70 text-xs>we tell JS the socket is open</span></div>
</div>

<div v-click="2" grid="~ cols-[6rem_1fr_1fr]" gap-4 mt-2 items-center>
<div text-base>② <b>message</b></div>
<div border="~ violet/40 rounded-lg" p-2><code>"websocket.receive"</code><br><span op70 text-xs>one per message JS pushes</span></div>
<div border="~ emerald/40 rounded-lg" p-2><code>"websocket.send"</code><br><span op70 text-xs>we post it back out to JS</span></div>
</div>

<div v-click="3" grid="~ cols-[6rem_1fr_1fr]" gap-4 mt-2 items-center>
<div text-base>③ <b>close</b></div>
<div border="~ violet/40 rounded-lg" p-2><code>"websocket.disconnect"</code><br><span op70 text-xs>JS closed it first</span></div>
<div border="~ emerald/40 rounded-lg" p-2><code>"websocket.close"</code><br><span op70 text-xs>we close the JS socket</span></div>
</div>

<div v-click="4" mt-4 text-lg text-center>

Same shape as HTTP — **only events & lifetime differ** 🔁

</div>

<!-- And the rest of the flow, through the same receive and send. On open we put websocket.connect in the queue; the app answers websocket.accept and we tell the JS socket it is open. For each message: the app receives websocket.receive, replies with websocket.send, and we post it out. Either side can end it: the app sends close, or JS disconnects and we give the app websocket.disconnect. The point is that this is the same receive and send loop as HTTP. Only the event names and the lifetime are different. One model covers both, which is why it fits in an appendix. -->
