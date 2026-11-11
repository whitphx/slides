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
  - slidev-addon-review-annotations
---

<h1 text-5xl leading-16>
ASGI on Pyodide
<br>
<small text-3xl op80>Building a web server inside your browser</small>
</h1>

<div mt-12 text-xl op80>
Yuichi (@whitphx)
</div>

<div absolute bottom-8 right-10 text-sm op60>
PyCon Hong Kong 2026
</div>

<div absolute top-17 right-10 flex="~ col" items-center gap-2>
<div class="qr-box" w-36 h-36>
<QRCode :width="185" :height="185" type="svg" data="https://slides.whitphx.info/202611-pyconhk-asgi-pyodide/"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
</div>
<div op70 text-sm text-center leading-tight>These slides</div>
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
Hi everyone, thanks for coming to my talk, ASGI on Pyodide, building a web server inside your browser.
-->

---

<h1>Yuichi (@whitphx)</h1>

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div class="portfolio" w-130 mt-6 v-click="1">

- <span class="heading">Created</span>: <span class="item"><img src="/portfolio/awesome_emacs_keymap.svg">Awesome Emacs Keymap</span>, <span class="item"><img src="/portfolio/stlite.png">Stlite: In-browser Streamlit</span>, <span class="item">🎈 Streamlit-WebRTC</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio-Lite: Serverless Gradio</span>, <span class="item">🤗 Transformers.js.py</span>
- <span class="heading">Contributed to</span>: <span class="item"><img src="/portfolio/streamlit-mark-color.svg" style="height: 0.8em;">Streamlit</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio</span>
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🌏APAC, 🇪🇺Euro, 🇹🇼TW, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT, 🇰🇷KR, <span v-mark.circle.red="2">🇭🇰HK</span></span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item">🐍SciPyData2026</span>

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

<!--
I'm Yuichi, a software developer who loves OSS and its communities.

[click]
I build and maintain several OSS projects, including Stlite, and I have been contributing to Streamlit and Gradio.
This talk is built on what I learned from those projects.

I've given talks at PyCons around the world, and this time,

[click]
it's a great honor to speak at PyCon Hong Kong.

[click]
You can find me as whitphx on GitHub and social media. Please talk to me if anything in this talk interests you.
-->

---
layout: section
---

# 🧩 The boundary you use every day

<div mt-4 op70>
…without ever looking at it
</div>

<!--
This talk is about ASGI.
I will first explain what ASGI is and what it brings to us when we build a web server.
Then we will combine it with Pyodide, a Python runtime that runs inside a web browser, and see a web application server run inside a browser tab, and even beyond.

Let's start with a very basic example that you may already be familiar with.
-->

---
clicks: 3
---

# You deploy this pair every week

<div class="deploy-grid" mt-4 :class="$clicks >= 1 ? 'revealed' : ''">

<div class="deploy-cell deploy-left">

<div mb-1>Demo app — ordinary <b><span v-mark="{ at: 3, color: '#a78bfa', type: 'circle' }">FastAPI</span></b></div>

<<< @/samples/first-fastapi-sample/main.py py {*}

</div>

<div class="deploy-cell deploy-right">

<div mb-1>…and how <b><span v-mark="{ at: 3, color: '#38bdf8', type: 'circle' }">Uvicorn</span></b> runs it</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uvicorn main:app
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

<div v-click="2">

```shell
$ curl -i localhost:8000/api/runtime
HTTP/1.1 200 OK
server: uvicorn
content-type: application/json

"Python 3.12.7 on darwin"
```

</div>

</WindowMockup>

<div v-click="3" mt-2 text-lg>

App: **Your logic**<br>
Uvicorn: **HTTP handling, connected to socket**

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 24px;
  --slidev-code-line-height: 1.5;
}
/* The transcript is longer than the code beside it, and it is read as output
   rather than studied line by line, so it runs a size below. */
.deploy-right,
.deploy-right * {
  --slidev-code-font-size: 18px;
  --slidev-code-line-height: 1.45;
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

<!--
This is a very simple FastAPI application.
It defines an API endpoint that returns the Python version and the platform it's running on.

[click]
To run this application, we usually use something like Uvicorn. This command serves the application over HTTP.

[click]
And it works as an HTTP server, as we'd expect. If we call the endpoint with curl, we get a normal HTTP response back.

[click]
Now look at these two actors.
One is your application, built with FastAPI, which implements the logic.
The other is Uvicorn, which handles the HTTP communication through the socket.
-->

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
<b>ASGI servers</b><br>
<span op70><span data-id="srv-uvicorn">Uvicorn</span> · Hypercorn<br>Granian · <span data-id="srv-mangum">Mangum</span> …</span>
</div>

</div>

<div v-click="3">
<div data-id="env-host" class="env-note" absolute top-74 right-64 w-46 bg-white dark:bg-black p-2 border="~ sky/60 rounded-lg">

🖥️ a Linux box

</div>
<FancyArrow from="[data-id=env-host] @ (25%, 0)" to="[data-id=srv-uvicorn] @ left" arc="0.4" />
</div>

<div v-click="3">
<div data-id="env-lambda" class="env-note" absolute top-74 right-12 w-46 bg-white dark:bg-black p-2 border="~ amber/60 rounded-lg">

☁️ AWS Lambda

</div>
<FancyArrow from="[data-id=env-lambda] @ top" to="[data-id=srv-mangum] @ bottom" arc="0.1" color="red" />
</div>

<div v-click="5" mt-20 text-5 op90 text-center italic>Asynchronous Server Gateway Interface</div>

<div v-click="6" mt-10 text-2xl op90 text-center>

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

<!--
This decoupling is general.

[click]
One side is the application frameworks, such as FastAPI and Starlette.

[click]
The other side is the servers, such as Uvicorn and Hypercorn.

[click]
Different servers support different environments. We use Uvicorn on a usual Linux machine, and to deploy the same application to AWS Lambda, we switch to Mangum.

[click]
And the interface between the two sides is ASGI.

[click]
The Asynchronous Server Gateway Interface.
Python had the same idea before. WSGI, from 2003, was the same kind of contract, but only for synchronous code. ASGI added async, WebSockets and streaming.

[click]
Because of this interface, we can develop or switch a package on one side without caring about the other side.
We usually take this for granted. But what is this contract actually made of? Let's look under the hood.
-->

---
layout: section
---

# ⚡ ASGI 101

<!--
So, this is what ASGI actually looks like.
If you already know it, this is just a quick review.
-->

---

# An ASGI app is one async callable

<div mt-2 text-lg>

The entire interface: **one coroutine, three arguments**

</div>

<div v-click="1" mt-4 mb-4 text-center text-6>
🤝 This signature is <b>the contract</b> → <b>any ASGI server can serve your app</b>
</div>

```py {*}{'data-id':'asgi-signature'}
async def app(scope, receive, send):
    ...
```

<div mt-8 grid="~ cols-3" gap-6 text-lg>

<div v-click="2">
<div data-id="ann-scope" text-6 border="~ sky/40 rounded-lg" p-3 bg-white dark:bg-black>
📋 <b><code>scope</code></b><br><span op80>connection type<br>path · headers</span>
</div>
<FancyArrow from="[data-id=ann-scope] @ top" to="[data-id=asgi-signature] .line:nth-child(1) span:nth-child(5) @ bottom" arc="-0.2" />
</div>

<div v-click="3">
<div data-id="ann-receive" text-6 border="~ violet/40 rounded-lg" p-3 bg-white dark:bg-black>
📥 <b><code>receive()</code></b><br><span op80>async <b>inbox</b></span>
</div>
<FancyArrow from="[data-id=ann-receive] @ top" to="[data-id=asgi-signature] .line:nth-child(1) span:nth-child(7) @ bottom" arc="-0.05" />
</div>

<div v-click="4">
<div data-id="ann-send" text-6 border="~ emerald/40 rounded-lg" p-3 bg-white dark:bg-black>
📤 <b><code>send()</code></b><br><span op80>async <b>outbox</b></span>
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

<!--
This is the whole interface that ASGI defines on the application side.
One async function that takes three arguments.

[click]
And this signature is the contract.
The application promises to take these three arguments, and the caller promises to pass them in.
Any callable object with this signature is considered an ASGI application.

[click]
scope is a dictionary that describes the connection info, such as HTTP method, the path, the headers, and so on.

[click]
receive is an async callable. The application awaits it to get an incoming event, such as the request body.

[click]
And send is an async callable for the application to push an outgoing event.
-->

---
clicks: 8
---

# You don't even need a framework

<div class="framework-grid" mt-1 :class="$clicks >= 6 ? 'revealed' : ''">

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
<span>🦄 Uvicorn</span>
</div>
<FancyArrow from="[data-id=ann-send] @ bottom" to="[data-id=raw-asgi-app] .line:nth-child(3) @ right" arc="0.05" v-click="[3,4]" />
<FancyArrow from="[data-id=ann-send] @ bottom" to="[data-id=raw-asgi-app] .line:nth-child(8) @ right" arc="0.15" v-click="[4,5]" />
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

<div v-click="7">

```shell
$ curl -i localhost:8000
HTTP/1.1 200 OK
content-type: text/plain

Hello, PyCon HK!
```

</div>

</WindowMockup>

<div v-click="8" mt-1 text-center text-5 leading-tight>🐍 A callable taking <code>scope</code>·<code>receive</code>·<code>send</code><br><b>= an ASGI app</b></div>

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

<!--
To understand it better, let's write a bare ASGI application ourselves.

[click]
Again, it's an async callable with three arguments.

[click]
Here we check that the connection type in `scope` is HTTP.
Like this, `scope` contains the connection info as a dictionary.

[click]
Then we call the `send` callable with the first event. Its type is `http.response.start`, which represents the start of an HTTP response, and it carries the status and the headers.

[click]
The next `send` call pushes the response body, following the previous event.

[click]
Two calls of `send`, and the response is done.

[click]
Let's run it with Uvicorn. We pass this `app` to Uvicorn, the same way as the FastAPI application before.

[click]
And it just works. It returns the HTTP response.

[click]
Uvicorn doesn't care that there's no framework.
It just calls the `app` callable.
In this example, the application didn't call `receive`, because a GET request has no body. An application calls `receive` when it needs the request body, for example for a POST.
-->

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
        self,
        scope: Scope, receive: Receive, send: Send,
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

<!--
So if a bare ASGI application already works, what do frameworks like FastAPI give us?

[click]
This is what the `FastAPI` class looks like.
It defines `__call__` with the ASGI signature.

[click]
So an instance of the `FastAPI` class is callable,

[click]
and its parameters are scope, receive and send.
So a FastAPI application is an ASGI application, just like the one we wrote.

[click]
So, in short, a framework is a way to create an ASGI callable.
And on top of that, it adds useful features such as routing, parsing and validation, to make that easier.
-->

---

# Demo, step 1: the normal case

<div class="demo-grid" mt-1 :class="$clicks >= 5 ? 'revealed' : ''">

<div class="demo-cell demo-left">

<div mb-1><code>main.py</code> <span op70>— the demo app, shortened</span></div>

```py
app = FastAPI()
```

<<< @/samples/runtime-agnostic-asgi-app/main.py#slide-routes py {*|1-3|5-11|13-23|*}{maxHeight:'356px'}

</div>

<div class="demo-cell demo-right">

<div class="demo-stack" :class="$clicks >= 6 ? 'covered' : ''">

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

<div mt-3 v-click="7">

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
/* Slidev scrolls a highlighted range into the maxHeight window as one unit, so
   the window has to fit the tallest range: the 11-line POST block. At 22px that
   range is taller than the window and its last line stays clipped, and there is
   no room left below to grow the window into. */
.demo-left * {
  --slidev-code-font-size: 20px;
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

<!--
Next, a new demo application. It's still a simple FastAPI application.

[click]
The index route serves an HTML page, with some JavaScript that calls the API.

[click]
A GET endpoint returns the server environment.

[click]
And the POST endpoints have a little server-side logic.

[click]
That's the whole application.

[click]
And again, this `app` object is a callable, and its parameters are scope, receive and send.
So this is an ASGI application too.

[click]
We run it the usual way, with Uvicorn,

[click]
and open the page.
The page's frontend is a small HTMX application that calls the API endpoints we just defined.
So when we click the button, it calls `/api/runtime`, and shows the result: Python 3.12 on darwin arm64. That's my laptop.
-->

---
plainBackground: true
---

# What's actually running where — step 1

<div mt-6>

<ServerStackFigure :step="$clicks" />

</div>

<div v-click="5" mt-4 text-center text-xl>

The caller of the ASGI application = the ASGI server = **🦄 Uvicorn**

</div>

<!--
Let's review what ran under the hood.
This is CPython, on a server machine. Here, my laptop.

[click]
`main.py` defines the FastAPI instance, the `app` object.

[click]
The `app` is called through the ASGI interface, with `scope`, `receive` and `send`,

[click]
by Uvicorn.
Uvicorn takes the HTTP request off the TCP socket, and makes that call.

[click]
And the page in the browser talks to the application with HTTP, over the network.

[click]
So here, the server that calls the ASGI application is Uvicorn. Let's keep an eye on it.
-->

---
layout: statement
---

## The contract has no sockets in it.

<div mt-8 text-2xl op80>

<v-clicks>

Being an **ASGI server**: supply `scope` · `receive` · `send` → **call the app**

🤔 So where does that have to *run*?

</v-clicks>

</div>

<!--
Now let's look at the contract again, that is, the ASGI interface.
The ASGI application promises only one thing to the outside world: this signature.
A dict and two async callables, `scope`, `receive` and `send`.
It says nothing about sockets, ports or processes.

[click]
Calling the application with that signature properly is the job of the ASGI server, outside the application.
On a usual Linux server, that outer layer is Uvicorn. It talks to the network through sockets, and turns each request into a call with `scope`, `receive` and `send`.

[click]
So everything about the outside world lies outside the application.
Then what if we move to an environment without those ports, or even without a Linux server at all?
Can we swap only the outer layer, and keep the ASGI application running as it is?
-->

---
layout: section
---

# 🌐 The extreme case

<div mt-4 op70>
A server inside your browser
</div>

<!--
Here is an example of that actually being done: running an ASGI application right inside a web browser.
Yes, we can do it. Let's take a look at an actual example.
It's certainly an extreme case, but it's technically fascinating, and full of interesting details.
-->

---

# The enabler: Pyodide

<img src="/pyodide-logo.svg" alt="Pyodide" absolute top-10 right-12 h-16 />

<div mt-4 text-lg>

[Pyodide](https://pyodide.org/): **CPython compiled to WebAssembly** — real Python, in a browser tab

</div>

<div grid="~ cols-[2fr_1fr]" gap-8 mt-6 items-center>

<div h-full>

<v-clicks>

- **No backend** — a Python interpreter in the browser
- Python ⇄ JavaScript, direct calls

</v-clicks>

</div>

<div v-click="3" border="~ gray/40 rounded-lg" p-3 bg-gray:5 text-center>
<div text-5 op70 mb-2>Browser tab</div>
<div border="~ violet/40 rounded" p-2 bg-violet:5>🐍 Pyodide<br><span text-4 op80>CPython on WASM</span></div>
<div text-xl op50 my-1>⇅</div>
<div border="~ sky/40 rounded" p-2 bg-sky:5>🌐 JavaScript / DOM</div>
</div>

</div>

<div absolute bottom-3 right-4 text-xs op40>
Pyodide logo by the Pyodide project, CC BY 4.0
</div>

<!--
Running Python in a browser is possible thanks to Pyodide.
It is CPython compiled to WebAssembly, so it runs inside a browser tab.

[click]
There's no server-side Python process here. It's a Python interpreter, running in the browser.

[click]
And Pyodide gives us cross-language APIs.
From JavaScript, we can access Python data and call Python functions. And from Python, we can do the same with JavaScript.

[click]
So now a browser tab has two runtimes in it. JavaScript, and Python, provided by Pyodide.
-->

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

<!--
So now Python runs in the page. Can we run our server-side application inside the browser too?
Let's line up what we have.

[click]
We can load our `main.py` into Pyodide. Pyodide installs FastAPI from PyPI with its own installer, `micropip`, and we copy `main.py` into Pyodide's virtual file system.
Pyodide has a function called `pyimport`, which imports a Python module from JavaScript.
So we can take the `app` object out of the `main` module, and hold it in a JavaScript variable.

[click]
On the other side, a web page talks to an HTTP API with `fetch`, JavaScript's built-in function for it.
This is our page calling the `/api/runtime` endpoint.

[click]
So let's connect the two.
We write our own `fetch`, named `asgiFetch`. It takes the same arguments as the original, but it calls our `app` on Pyodide instead of going to the network.

[click]
But there's a hole in the middle.
Something has to turn the HTTP request from `fetch` into an ASGI call: build the `scope`, and prepare `receive` and `send`.
On a server, that's Uvicorn's job. And there's no Uvicorn in a browser tab.
-->

---
layout: statement
---

## No Uvicorn in the tab.<br>**So let's write that layer ourselves.** 🛠️

<div mt-8 text-2xl op80 v-click="1">

It's small enough to read in a talk ✍️

</div>

<!--
So let's write that layer by ourselves.

[click]
And it is small enough to read here, so let's go through the whole thing.
-->

---
layout: section
---

# 🛠️ Building the bridge

<div mt-4 op70>
Doing Uvicorn's job, one piece at a time
</div>

<!--
Everything on the next few slides is real code from the demo repository, just shortened a bit for the screen.
-->

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

Fill in the blanks and you have **an ASGI server** 🛠️

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

<!--
We write the conversion in Python, because the `scope` dict and the two callables are easier to build there. `asgiFetch` will only call it.
What we have to write is just one Python function
that takes the `app` object and a request from the JavaScript `fetch`.
And in the middle it makes the ASGI call to the `app` object,
and finally returns the response to its caller.

[click]
And we have two blanks.
The first one is to build the scope, and to prepare receive and send.
The second one is to collect what the application sent back.

[click]
So let's fill in these blanks.
-->

---
clicks: 4
---

# ① Turn the request into a `scope`

<div mt-1 text-lg>

JS request → **the dict ASGI specifies**:

</div>

<div class="scope-grid" :class="$clicks >= 4 ? 'revealed' : ''">

<div class="scope-code">

```py {*|3|7-8|10-11|*}
async def dispatch(app, request):
    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "scheme": "http",
        "method": request["method"],  # GET, POST, ...
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

<!--
The first blank is the scope.
JavaScript gives us a request in its own format, and we reshape it into the dict that ASGI defines.

[click]
The `http` type tells the application that this is an HTTP connection.

[click]
Then the method, like GET or POST, and the path,

[click]
the query string, the headers, and so on.

[click]
And we're not guessing. The spec defines every key and its type, and we follow it.
-->

---

# ② Wire up `receive` and `send`

<div mt-1 mb-8 text-lg>

`receive`: **body in** · `send`: **response out**

</div>

```py {*|1-4|6-12|*}{'data-id':'wire-up'}
    request_body = bytes(request["body"])
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
<div data-id="ann-receive" class="wire-note" absolute top-26 right-4 flex items-center border="~ violet/50 rounded-lg" px-3 py-2 gap-3 bg-white dark:bg-black>
<span>🐍 app</span>
<div>
<div text-center op60>—— calls <code>receive()</code> ——▸</div>
<div text-center text-violet-600 dark:text-violet-400 font-bold>◂—— return the body ——</div>
</div>
<span>🌉 bridge</span>
</div>
<FancyArrow from="[data-id=ann-receive] @ left" to="[data-id=wire-up] .line:nth-child(2) @ right" arc="-0.05" />
</div>

<div v-click="2">
<div data-id="ann-send" class="wire-note" absolute top-70 right-14 w-90 flex items-center border="~ emerald/50 rounded-lg" px-2 py-1 gap-4 bg-white dark:bg-black>
<span>🐍 app</span>
<div>
<div text-center text-emerald-600 dark:text-emerald-400 font-bold>— calls <code>send(event)</code> with the response —▸</div>
<div text-center op60>◂—— <code>None</code> ——</div>
</div>
<span>🌉 bridge</span>
</div>
<FancyArrow from="[data-id=ann-send] @ bottom" to="[data-id=wire-up] .line:nth-child(7) @ right" arc="0.15" />
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

<!--
The next blank is the two callables.

[click]
`receive` is the async callable that the application awaits when it wants the request body.
First we take the body that came from JavaScript, as bytes. Our `receive` returns it as an `http.request` event. `more_body` is `False`, which means "this is the whole body".

[click]
`send` is the opposite. The application calls it to send the response, in pieces.
Our `send` collects the status, the headers and the body, so that we have the full response at the end.

[click]
So both of them are just closures over a few local variables.
-->

---
clicks: 5
---

# ③ Run the app, call it from JavaScript

<div class="run-stack" mt-2 :class="$clicks >= 4 ? 'covered' : ''">

<div class="run-layer run-py">

<div text-5 mb-3><code>bridge.py</code> — <b>one call</b>, then collect what <code>send</code> gathered:</div>

```py {*|1|3-6|*}{'data-id':'run-app'}
    await app(scope, receive, send)

    response = {"status": status,
                "headers": headers,
                "body": b"".join(chunks)}
    return response
```

<div v-click="[3,4]">
<div data-id="ann-server" mt-10 w-max mx-auto text-xl text-center>

`scope` + `receive` + `send` + `await app(...)` = **an ASGI server**

</div>
<FancyArrow from="[data-id=ann-server] @ topleft" to="[data-id=run-app] .line:nth-child(1) span:nth-child(2) @ bottom" arc="0.3" color="red" />
</div>

</div>

<div class="run-layer run-js">

<div text-5 mb-3><code>main.js</code> — <b>our own <code>fetch</code></b>, answered by Pyodide instead of the network:</div>

<<< @/samples/runtime-agnostic-asgi-app/step2-browser/main.js#slide-fetch js {*}{'data-id':'dispatch-js'}

</div>

</div>

<div v-click="5" class="dispatch-layer">
<div data-id="ann-dispatch" class="js-note" absolute bg-white dark:bg-black px-3 py-2 border="~ teal/60 rounded-lg" style="top: 222px; left: 580px;">

calls **our `dispatch`** with the `app`

</div>
<FancyArrow from="[data-id=ann-dispatch] @ bottomleft" to="[data-id=dispatch-js] .line:nth-child(6) @ right" arc="0.2" color="red" />
</div>

<style>
.run-py,
.run-py * {
  --slidev-code-font-size: 20px;
  --slidev-code-line-height: 1.6;
}
.run-js,
.run-js * {
  --slidev-code-font-size: 16px;
  --slidev-code-line-height: 1.45;
}
/* The JavaScript pane arrives over the Python one in the same grid cell, so the
   slide keeps its height and the second half reads as the next step. */
.run-stack {
  display: grid;
  align-items: start;
}
.run-layer {
  grid-area: 1 / 1;
  min-width: 0;
}
.run-py {
  transition: opacity 300ms ease 400ms;
}
.run-stack.covered .run-py {
  opacity: 0;
}
.run-js {
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.run-stack.covered .run-js {
  transform: translateX(0);
  opacity: 1;
}
/* The typography preset sizes `p` directly, so the box's own size would not
   reach the markdown paragraph inside it. */
.js-note, .js-note p {
  font-size: 22px;
  line-height: 1.4;
  margin: 0;
}
/* The code pane is lifted above the Python pane it covers, so the note and its
   arrow need a layer above that again, or they land behind the code. The layer
   covers the slide exactly, so the note keeps the slide's coordinates. */
.dispatch-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
</style>

<!--
Now we have everything, so let's fill the middle.

[click]
We await the application, with our scope, our receive and our send.
Everything so far was to prepare these three arguments.

[click]
When it returns, our `send` has already filled in the response variables.
So we pack them up, and give them back to JavaScript.

[click]
So this is what an ASGI server is.
No sockets, no HTTP parsing, no port and no process. Just a function that satisfies the contract defined by ASGI.

[click]
Now let's call this `dispatch` function from JavaScript.
This is our own `fetch`, named `asgiFetch`. It takes the same arguments as the built-in `fetch`, and it returns a `Response` object, the same as the built-in one.
The `app` and `dispatch` objects were imported from Python with `pyimport` when the page loaded.
The helpers in the middle only convert data: `toPy` turns the JavaScript request into a Python dict, and `toJs` turns the Python result back into JavaScript.

[click]
And in the middle, it calls `dispatch`, with the `app` and the request from JavaScript.
-->

---
layout: statement
---

## `bridge.py`: ~45 lines.<br>The app **never noticed**.

<div mt-8 text-2xl op80 v-click>

Does it actually run? **Let's watch it.** 👀

</div>

<!--
So this is everything we wrote. About forty-five lines.
And a FastAPI application should run on top of it, without noticing anything.

[click]
So let's actually run it.
-->

---

# Demo, step 2: the same app, no server

<div class="demo2-grid" mt-4>

<div text-lg>

<v-clicks>

- 📄 Static page + Pyodide + **the same `main.py`**
- 🕵️ **Works offline**

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

<div v-click mt-4 text-center text-xl>

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

<!--
So let's see it running.

[DEMO SETUP] Serve the repo root, not step2-browser/ — the page loads ../main.py by relative fetch, and from inside the subdirectory that path falls outside the document root and Pyodide never boots. Open /step2-browser/. Also let Pyodide finish booting before killing the file server; the runtime and packages come from the CDN, but main.py and bridge.py come from that server. `pnpm dev:live` serves it on port 8080, which is the embed on this slide; `pkill -f "http.server 8080"` is the kill for the last beat.

[click]
This is a static page, served by a plain file server.
The JavaScript loads Pyodide and runs the same `main.py` from step one, through the bridge we just wrote.
The page uses htmx, and one small hook in the page sends every request it makes to `asgiFetch` instead of the network.
When I click the button, it says the platform is emscripten, and a different Python version: Pyodide's own build of Python.
The application is telling us it runs inside the browser, on WebAssembly.

[click]
Now let's watch the Network tab while I click it again. Nothing goes out.

[click]
So the response is made by Python, in Pyodide, inside the browser tab.
The forty-five lines we just read made it possible.
-->

---
clicks: 5
plainBackground: true
---

<h1>What’s actually running where — step <span class="step-swap"><span :class="$clicks >= 1 ? 'op0' : ''">1</span><span class="step-two" :class="$clicks >= 1 ? '' : 'op0'">2</span></span></h1>

<StackCompare mt-4 :columns="[
  { key: 'server', label: '① Server' },
  { key: 'browser', label: '② Browser', hidden: $clicks < 1 },
]">
  <template #server><ServerStackFigure aligned :highlight="$clicks === 2" :highlight-swapped="$clicks === 3 || $clicks === 5" /></template>
  <template #browser><BrowserStackFigure aligned :highlight="$clicks === 2" :highlight-swapped="$clicks === 3 || $clicks === 5" :worker="$clicks >= 4" :worker-highlight="$clicks === 4" /></template>
</StackCompare>

<div class="punchline" mt-4 text-center text-xl :class="$clicks >= 5 ? 'op100' : 'op0'">

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

<!--
This is the same picture as step one.

[click]
And here is the browser version, next to it.
Let's compare them from the top.

[click]
The `main.py` and its `app` object are the same, and so is the interface it's called through.

[click]
What changed is this layer.
On the server, on the left, CPython runs Uvicorn as the ASGI server.
In the browser, on the right, Pyodide runs instead of CPython, and our bridge does Uvicorn's job.

[click]
In production, we run Pyodide in a Web Worker, which is a background thread in the browser, so that Python does not block the page.

[click]
Everything above this box is untouched. The same application, called through the same interface. Only the ASGI server underneath changed.
-->

---
layout: section
---

# 🏭 The production proof

<div mt-4 op70>
Does this work for a real framework?
</div>

<!--
But our demo application has only three endpoints. Real applications and frameworks are much bigger, with many Python files and static files.
So, does this work for them too?
It does. And I can say that because I've built it, with Streamlit.
-->

---
clicks: 5
---

# Streamlit, and Stlite

<div class="st-grid" mt-1 :class="$clicks >= 3 ? 'revealed' : ''">

<div class="st-cell st-left">

<div mb-1>Build web apps with <b>only Python</b>:</div>

<div v-click="1">

<<< @/samples/streamlit-demo/app.py py {*}{maxHeight:'180px'}

</div>

<div class="swap" mt-4 :class="$clicks >= 4 ? 'covered' : ''">

<div class="swap-layer swap-old" v-click="2">

<WindowMockup title="Terminal" dark codeblock>

```shell
$ streamlit run app.py
```

</WindowMockup>

</div>

<div class="swap-layer swap-new">

<div mb-1 text-5><b>Stlite</b> — a static page, <b>the same <code>app.py</code></b>:</div>

<<< @/samples/streamlit-demo/stlite.html#slide-mount html {*}

</div>

</div>

</div>

<div class="st-cell st-right">

<div class="swap" :class="$clicks >= 4 ? 'covered' : ''">

<div class="swap-layer swap-old">

<LiveEmbed url="http://localhost:8501/?embed=true" title="localhost:8501" padding="0.4rem" height="270px" :zoom="0.6">

<img src="/streamlit-demo.png" alt="The demo app running: a Sales dashboard title, a Rows slider, and a line chart" class="dark:hidden" style="max-height: 270px; width: auto;" />
<img src="/streamlit-demo-dark.png" alt="The demo app running: a Sales dashboard title, a Rows slider, and a line chart" class="hidden dark:block" style="max-height: 270px; width: auto;" />

</LiveEmbed>

</div>

<div class="swap-layer swap-new">

<LiveEmbed url="/stlite-demo/stlite.html" title="sales-dashboard.html" light padding="0.4rem" height="270px" :zoom="0.5">

<img src="/stlite-demo.png" alt="The same Sales dashboard, running from a static HTML file in the browser" style="width: 100%; height: auto;" />

</LiveEmbed>

</div>

</div>

<div v-click="5" mt-4 text-center text-5>

No server, no install —<br>**Python & Streamlit in your browser** 🎈

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.5;
}
/* The script pane holds the whole slide, then gives up half of it as the app
   arrives on the right. */
.st-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}
.st-cell {
  min-width: 0;
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
/* Stlite arrives over Streamlit in the same cell, on both sides at once: the
   way it is launched replaces the command, and its page replaces the app's. */
.swap {
  display: grid;
  align-items: start;
}
.swap-layer {
  grid-area: 1 / 1;
  min-width: 0;
}
.swap-old {
  transition: opacity 300ms ease 400ms;
}
.swap.covered .swap-old {
  opacity: 0;
}
.swap-new {
  z-index: 1;
  transform: translateX(calc(100% + 1.25rem));
  opacity: 0;
  transition: transform 700ms ease, opacity 350ms ease 250ms;
}
.swap.covered .swap-new {
  transform: translateX(0);
  opacity: 1;
}
</style>

<!--
Streamlit is a popular Python framework for building interactive web applications with only Python.

[click]
We write just a Python script,

[click]
and run it with the `streamlit` command.

[click]
And we get a styled, interactive web application.
The `streamlit` package ships both a server, Starlette on Uvicorn, and a frontend application.
So it has the same shape as our demo application.

[click]
And this is Stlite, the in-browser version of Streamlit that I built with the same trick.
A static HTML page loads the same `app.py`, and runs it.
Everything you deploy is static files.

[click]
There is no server here, and the visitor has no Python installed. Python and Streamlit run in the browser.
-->

---
clicks: 4
plainBackground: true
---

# Standard Streamlit vs. Stlite

<StackCompare mt-1 class="cmp-fit" :columns="[
  { key: 'streamlit', label: 'Standard Streamlit' },
  { key: 'stlite', label: 'Stlite', hidden: $clicks < 1 },
]">
  <template #streamlit><StreamlitStackFigure aligned :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
  <template #stlite><StliteStackFigure :highlight="$clicks >= 2" :highlight-swapped="$clicks >= 3" /></template>
</StackCompare>

<!-- The other frameworks take the punchline's place rather than a line of their
     own: the comparison has no spare height below it. -->
<div class="punchline-stack" mt-1 text-center>

<div class="punchline" :class="$clicks >= 1 && $clicks < 4 ? 'op100' : 'op0'">

Same app, same Streamlit — **only the server half and the runtime change** 🎈

</div>

<div class="punchline" :class="$clicks >= 4 ? 'op100' : 'op0'">

Same idea: **[Shinylive](https://shiny.posit.co/py/docs/shinylive.html)** <span op70>(Shiny, by Posit)</span> · **[Gradio-Lite](https://github.com/gradio-app/gradio-lite)** <span op70>(Gradio)</span>

</div>

</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
.punchline-stack {
  display: grid;
}
.punchline-stack > * {
  grid-area: 1 / 1;
}
/* Markdown wraps each line in a paragraph, whose margin would push the pair
   below the slide. */
.punchline-stack p {
  margin: 0;
}
/* The runtime box gained a row for Starlette, which this two-column
   comparison has no spare height for, so the pair scales to the slide. */
.cmp-fit {
  zoom: 0.9;
}
</style>

<!--
Stlite is much bigger than our demo, but what happens is basically the same.
This is standard Streamlit. Uvicorn handles HTTP on the server, and Streamlit's application, built on Starlette, runs on it.
The frontend application talks to it.

[click]
And this is Stlite.

[click]
Streamlit itself is the real one here, not a reimplementation.
The Streamlit runtime, the files it serves, and its ASGI interface are the same on both sides.

[click]
And these are the blocks that changed.
Uvicorn is replaced by Stlite's own bridge, which turns requests from the page into ASGI calls to the `app` on Pyodide.
It's the same idea as the bridge we wrote, but carrying a whole framework.

[click]
And Streamlit is not the only one. Shiny for Python and Gradio are ASGI applications too.
With the same trick, Posit built Shinylive, and I worked with the Gradio team on Gradio-Lite, though it's not maintained now.
-->

---
layout: statement
---

## The app doesn't care **who calls it**.

<div mt-8 text-2xl op80 v-click="1">

Then the browser can't be the only unusual caller… 😏

</div>

<!--
So whether it's our forty-five lines or Stlite's bridge, the ASGI application doesn't care who calls it. Uvicorn, or something else.

[click]
And then the browser can't be the only unusual caller.
-->

---
layout: section
---

# ☁️ Stranger still: Pyodide on the edge

<div mt-4 op70>
The browser runtime, running someone's production traffic
</div>

<!--
So let me show you another one, which goes even further.
-->

---

# Cloudflare Workers run Python — on Pyodide

<div mt-8 text-6 leading-13>

<v-clicks>

- ☁️ **Cloudflare Workers** — serverless at the edge, on **workerd** (JS/WASM)
- 🐍 **Python Workers = Pyodide** — the same WASM CPython, now *server-side*

</v-clicks>

</div>

<!--
[click]
Cloudflare Workers are serverless functions that run on Cloudflare's edge network, which means servers in many cities, close to the users.
Their runtime runs only JavaScript and WebAssembly.

[click]
So, to support Python, they use Pyodide. This is not related to the Web Worker in the browser; the names are just similar.
It's the same WebAssembly CPython we just used in the browser, but running server-side now.
-->

---
clicks: 4
---

# Demo, step 3: the entire entrypoint

<div mt-2 text-lg>

The whole file — nothing left out:

</div>

<div class="edge-grid">

<div class="edge-cell">

<<< @/samples/runtime-agnostic-asgi-app/step3-cloudflare/src/entry.py py {*|4|2,7-8|1,9-11}{maxHeight:'320px','data-id':'entry'}

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

`src/main.py` is **the same app as step 1**

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

<!--
So this is what it takes to run our application there. The whole file, nothing left out.

[DEMO SETUP] Deploy well before the talk and open the URL once to warm it, so the embed on this slide loads the live application. For about a minute after a deploy, requests intermittently come back as edge errors while the new version propagates, and a cold isolate takes around three seconds against roughly one second warm. If it is not up, the embed shows its fallback; don't stop to debug it.

[click]
This import is our application, the same one as steps one and two.

[click]
Then the entrypoint, with a fetch handler.
That's the contract of Cloudflare Workers.

[click]
And here's the part I wanted to show you.
Cloudflare's SDK ships a module called `asgi`, and `asgi.fetch` does what we wrote by hand for the browser.
They ship it as a product feature.

[click]
And it's deployed. The same application, on Cloudflare Workers, with no changes.
-->

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
<div v-click="2"><b>Same file</b> · 3 Pythons · 3 transports · <b>0 changes</b></div>
<div v-click="3" font-bold text-sky-600>The interface holds — everything below it is swappable</div>
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

<!--
Here are the two stacks we've seen. The server, and the browser.

[click]
And the edge joins them.

[click]
And the `app` object in `main.py` is the same in all three columns, all three different deploy targets.

[click]
And these are the layers that differ.
The caller of the ASGI application.
Uvicorn, our own bridge, and Cloudflare's asgi module.
-->

---
layout: section
---

# 🧭 When to reach for this

<div mt-4 op70>
Practical uses — and honest limits
</div>

<!--
So this architecture works. But when do we actually want it?
-->

---

# Where it fits, and where it stops

<div mt-4 grid="~ cols-2" gap-6>

<div v-click="1" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
<div text-6 font-bold mb-3>✅ Good fit</div>
<div flex="~ col" gap-2 text-5>
<div>📡 <b>Static-hosted apps</b> <span op70 text-4>— no backend</span></div>
<div>📖 <b>Runnable docs</b> <span op70 text-4>— live examples</span></div>
<div>🎓 <b>Education</b> <span op70 text-4>— zero setup</span></div>
<div>🔒 <b>Privacy</b> <span op70 text-4>— data stays on the device</span></div>
</div>
</div>

<div v-click="2" border="~ red/40 rounded-lg" p-4 bg-red:5>
<div text-6 font-bold mb-3>⚠️ Limits</div>
<div flex="~ col" gap-2 text-5>
<div>🧵 <b>No threads</b> <span op70 text-4>— <code>async def</code> only</span></div>
<div>📦 <b>Packages</b> <span op70 text-4>— pure Python, or built for WASM</span></div>
<div>🔑 <b>No secrets</b> <span op70 text-4>— in the browser</span></div>
<div>📥 <b>No webhooks</b> <span op70 text-4>— in the browser</span></div>
</div>
</div>

</div>

<div v-click="3" mt-6 text-center text-5>

In production: [Streamlit Playground](https://streamlit.io/playground), powered by Stlite

</div>

<div v-click="4" mt-3 text-center text-xl>

**Works with** real servers — doesn't replace them 🤝

</div>

<!--
[click]
Where does it fit?
We can ship a whole web application as static files, on services such as GitHub Pages or Cloudflare Pages. There is no backend to run or to pay for, and it scales with the visitors, because each visitor brings their own compute.
Documentation can have live examples. In education, there is nothing to set up.
And everything runs on the device, so the data never leaves it.

[click]
And the limits.
Pyodide can't start threads, for example.
Some libraries don't work on Pyodide yet, though the coverage is growing.
In the browser, everything is sent to the client, so you can't put any secrets in the application.
And in the browser there is no public address, so no webhooks. These two are about the browser, not about Cloudflare.

[click]
And this is already in production. The Streamlit Playground runs on Stlite.

[click]
So this works together with real servers. It doesn't replace them.
-->

---

# Key takeaways

<div mt-6 text-xl>

<v-clicks>

- 🧩 **ASGI = a clean interface** — your app on one side, *any caller* on the other
- ⚡ The whole contract: **`scope` · `receive` · `send`** — no sockets in it
- 🌉 **An ASGI server = anything that fulfills it** — Uvicorn · Lambda · the edge · a tab
- 🔁 **One app, unchanged, across all of them** — that's the portability
- 🏭 **In production today** — Stlite · Streamlit Playground · Cloudflare Python Workers · `Mangum` …
- 🧠 **I learned ASGI by writing an ASGI server**

</v-clicks>

</div>

<div v-click mt-6 grid="~ cols-[1fr_auto]" gap-8 items-center>

<div text-base flex="~ col" gap-2>

<div flex="~ gap-2" items-center>
<div i-ri-code-s-slash-line text-xl op50 />
<div><a href="https://github.com/whitphx/slides/tree/main/decks/202611-pyconhk-asgi-pyodide/samples" target="_blank">whitphx/slides</a> — this deck, with every sample you saw</div>
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

<div flex="~ gap-12" items-start>

<div flex="~ col" items-center gap-2>
<div class="qr-box" w-33 h-33>
<QRCode :width="185" :height="185" type="svg" data="https://slides.whitphx.info/202611-pyconhk-asgi-pyodide/"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
</div>
<div op70 text-sm text-center leading-tight>These slides</div>
</div>

<div flex="~ col" items-center gap-2>
<div class="qr-box" w-33 h-33>
<QRCode :width="135" :height="135" type="svg" data="https://github.com/whitphx/slides/tree/main/decks/202611-pyconhk-asgi-pyodide"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
</div>
<div op70 text-sm text-center leading-tight>Sources</div>
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
So, let me wrap up.

[click]
ASGI is a clean interface that splits the application from the server.

[click]
ASGI's whole contract is scope, receive and send.

[click]
So a server is anything that satisfies it.

[click]
And the same application can run on any server that implements ASGI, without any change.

[click]
And it's already proven in production.

[click]
And this is what I got personally. I learned ASGI by writing the server side of ASGI, rather than the application side, in the Stlite project.
It's an interesting way to go.

[click]
That's all from me. Thank you very much.
The slides and the samples are behind this QR code.
And please come and talk to me.
-->

---
layout: section
---

# 📎 Appendix

<div mt-4 op70>
Slides cut for time, and the parts of ASGI the talk skipped
</div>

<!--
These are the parts I skipped in the talk, for questions.
-->

---

# Not a new idea: WSGI walked first

<div mt-2 text-lg>

Same motivation, one standard earlier — **the synchronous era**:

</div>

<div grid="~ cols-1" gap-1 mt-4>

<div v-click="1" border="~ gray/40 rounded-lg" p-4 bg-gray:5>
<div text-6>📜 <b>WSGI</b> <span op60 text-4>— <a href="https://peps.python.org/pep-0333/" target="_blank">PEP 333</a>, 2003</span></div>
<div text-6 op80 mt-1>Flask · Django ⇄ Gunicorn · uWSGI</div>
<div text-6 op80 mt-1><b>One sync call</b> request → response, done</div>
</div>

<div v-click="2" text-center text-3xl op60 leading-none>↓</div>

<div v-click="2" border="~ sky/40 rounded-lg" p-4 bg-sky:5>
<div text-6>⚡ <b>ASGI</b> <span op60 text-4>— 2016–, born from Django Channels</span></div>
<div text-6 op80 mt-1>Same decoupling, <b>async events</b></div>
<div text-6 op80 mt-1>WebSockets · streaming long-lived connections</div>
</div>

</div>

<!--
By the way, ASGI is not the first initiative to do it.

[click]
In 2003, PEP 333, Python standardized WSGI: the same kind of contract. Flask and Gunicorn are well-known examples of WSGI-compatible software.
However it was only for synchronous code and had some limitations such as lack of support for WebSocket and long-lived streams.

[click]
So when Django Channels needed those things, ASGI grew out of that work
-->

---

# Now a POST — enter `receive`

<div class="post-grid" mt-3 :class="$clicks >= 8 ? 'revealed' : ''">

<div class="post-cell post-left">

<div mb-1>Same shape — plus the <b><code>receive</code></b> loop</div>

<<< @/samples/raw-asgi/raw_asgi_post.py py {*|1,4-9|6|6|7|5,8-9|11-13|*}{'data-id':'post-app'}

</div>


<div class="post-cell post-right">

<div mb-1>…and the body comes back out the other side</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uvicorn raw_asgi_post:app
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

<div v-click="9">

```shell
$ curl -X POST localhost:8000 \
       -d 'hello, PyCon HK'
You said: hello, PyCon HK
```

</div>

</WindowMockup>

<div v-click="10" mt-3 text-center text-lg leading-tight>📋<code>scope</code> ·  📥<code>send</code> ·  📥<code>receive</code></div>

</div>

</div>

<div v-click="[3,6]">
<div class="receive-impl" data-id="ann-receive-impl" absolute top-26 right-5 w-108 bg-white dark:bg-black p-1.5 rounded border="~ violet/50 rounded-lg" shadow-lg>

<div flex items-center px-8 py-2 mx-auto gap-4 bg-white dark:bg-black text-4>
<span>🐍 app</span>
<div>
<div text-center op60>—— calls <code>receive()</code> ——▸</div>
<div text-center text-violet-600 dark:text-violet-400 font-bold>◂—— return the body ——</div>
</div>
<span>🦄 Uvicorn</span>
</div>

```py
async def receive():
    return {"type": "http.request",
            "body": b"hello, PyCon HK",
            "more_body": False}
```

</div>
<FancyArrow from="[data-id=ann-receive-impl] @ bottomleft" to="[data-id=post-app] .line:nth-child(6) span:nth-child(5) @ right" arc="0.35" />
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

<!--
Next, let's make this application accept a POST request using the `receive` function passed as the second argument to the `app` function.

[click]
This part is the difference.
The body is not passed to `app` as an argument like `scope`.
The application needs to pull it from the `receive` function.

[click]
Here, the application awaits `receive`, and gets one event.

[click]
`receive` works like this.
It returns the request body.

And it's passed from the server.

[click]
We add the returned body to a buffer.

[click]
And we repeat it until the whole request body is received, because a large body can arrive in a chunked manner.

[click]
Then we call the `send` function to return the response, the same as before.

[click]
With this `app`,

[click]
Let's launch `uvicorn` again,

[click]
And post some data via `curl`.

It works as expected, receiving the posted body and returns a response.

[click]
So, scope, receive and send. That's all of ASGI.
-->

---
plainBackground: true
hide: true
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

<!--
Let's put the three of them in order.

[click]
The server builds the scope, and calls the application once.
Look at the bracket on the right. This await is not a step at the top. It stays open until the bottom.

[click]
The application awaits receive when it wants the body.

[click]
The server returns it.

[click]
Then the application sends the status and the headers.

[click]
And the body, in one or more events.

[click]
And when the coroutine returns, the request is done.
There is no completion event. The return itself is the signal.
-->

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

<!--
This is how JavaScript calls Python. Here's a simple example.

[click]
First, we import the Pyodide runtime.

[click]
Then runPythonAsync takes Python source, as a JavaScript string.

[click]
And the result comes back to JavaScript.

[click]
Let's run it with Node.js.
The result says `emscripten`, which is what `sys.platform` reports.
Emscripten is the WebAssembly platform, so Python is telling us it's not on our operating system any more.
I'm using Node.js here just to keep it in a terminal. The same works in browser JavaScript.
-->

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

<!--
Our demo ran Python on the main thread, because it makes the call easy to see. asgiFetch calls dispatch, with nothing in between.
But while Python is working, the page can't paint or respond. With three endpoints we don't notice it. With a real application we always do.
So production runs Pyodide in a Web Worker, and asgiFetch posts a message instead, matching the replies by id.
And everything below that is identical. The same bridge, the same ASGI call, the same application.
The repository has both versions.
-->

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

<!--
This is the layer that real servers don't have. The FFI between JavaScript and Python.
From my experience, most of the bugs live here.

[click]
JavaScript objects arrive in Python as proxies, not as dicts, so we convert them explicitly.

[click]
Binary bodies come as Uint8Array, and every conversion copies the buffer. That matters for a large upload.

[click]
And going back, to_js makes a JavaScript Map by default, not a plain object. There is a dict_converter option for it.

[click]
One nice thing is that async works across the boundary. JavaScript can await a Python coroutine as a Promise.

[click]
So Uvicorn's network layer is sockets and parsers, and ours is type conversion.
-->

---
clicks: 3
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

<div v-click="2" mt-3 text-lg text-center>

**Heavyweight** apps: static assets · sessions · state · realtime

</div>

<div v-click="3" mt-2 text-xl text-center>

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

<!--
And Streamlit is not the only one.
There are similar types of frameworks in the Python ecosystem.
And Shiny for Python is on Starlette, and Gradio is on FastAPI.
So they can be made runnable inside the browser with the same trick,

[click]
and actually they are made.

Posit built Shinylive.

and I worked with the Gradio team on Gradio-Lite, though it is not maintained now.

[click]
All these are big frameworks or applications including many Python files and static assets,

[click]
but we can make them run in the browser by switching the ASGI server layer outside their core interfaced by ASGI.
-->

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

<!--
And once I saw Cloudflare running Pyodide, I had to try it with Stlite, the in-browser version of Streamlit that I am maintaining.
These are the two columns we just saw.

[click]
And this is Stlite on Cloudflare.
Pyodide again, but in a Cloudflare Python Worker on their servers, instead of a Web Worker in the browser tab.

[click]
And again, Streamlit core is identical in all three.

[click]
And the caller and the runtime are the parts that moved. Nothing above the bridge changed.
-->

---
clicks: 2
hide: true
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

<!--
And this pattern is already everywhere.
Different platforms such as AWS Lambda, Azure and Vercel have different ASGI bridge implementations, even prior to Pyodide.

[click]
And today we added the last two.

[click]
All of them do what we wrote. Build a scope, prepare receive and send, and await the application.
And one interesting fact is Mangum is maintained by the same person who maintains Uvicorn and Starlette.
-->

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

<!--
ASGI carries three kinds of connection, and the application reads scope type to see which one it has.
The call is identical for all three. The same three arguments, the same receive and send.
Only the event names inside change. websocket.receive instead of http.request, for example.
So everything in the talk applies to the other two as well.
-->

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

<!--
lifespan has no client. It's how the application is told that it's starting up, and shutting down.
It's where FastAPI opens database pools, loads models, and warms caches.
Uvicorn drives it when the process starts, and our bridge has to drive it when the page loads.

[click]
We make a lifespan scope, and put a startup event into a queue.

[click]
Then receive and send, the same as before. We wait for startup-complete before serving any request.

[click]
And we don't await this one. It runs in the background for the whole lifetime of the application.

[click]
And if we skip it, everything looks fine until someone's database pool is never initialized.
-->

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

<!--
Our dispatch collects the whole response, and returns it at the end.
That works until the application streams, like server-sent events, or a chatbot sending tokens one by one.
If we collect everything first, the user sees nothing until it's finished.

[click]
So on response start, we open a JavaScript ReadableStream.

[click]
And each body event goes to JavaScript right away.

[click]
And we keep it open while more_body is true, and close it when it's false.

[click]
Then the JavaScript side reads it like a real fetch. Production also handles backpressure.
-->

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

<!--
WebSockets are harder, because they are long-lived and the timing is reversed.
JavaScript receives messages whenever they arrive, so it pushes. But the ASGI application pulls. It awaits receive and expects the next message.

[click]
So we put a queue between them.

[click]
JavaScript adds events to it without awaiting.

[click]
And the application's receive awaits the queue.

[click]
That small buffer is the centre of in-browser WebSockets.
-->

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

<!--
And this is the rest of the flow, through the same receive and send.

[click]
When JavaScript opens the socket, we queue a connect event, and the application answers with accept.

[click]
Then one receive event per message, and the application replies with send, which we post back out.

[click]
And either side can close it.

[click]
So it's the same loop as HTTP. Only the event names and the lifetime differ.
-->

---

# `contextvars`: many apps, one Pyodide

<div mt-2 text-5>

**Several apps**, one interpreter, one thread — **one task per app**:

</div>

```py {*|1-3|5-7|9|*}{maxHeight:'300px'}
home_dir_contextvar: ContextVar[str | None] = ContextVar(
    "home_dir", default=None
)

async def run_app(app):
    home_dir_contextvar.set(app.home_dir)
    await run_script(app)

await asyncio.gather(run_app(app_a), run_app(app_b))
```

<div mt-4 grid="~ cols-2" gap-4 text-5>

<div v-click="4" border="~ emerald/40 rounded-lg" p-3 bg-emerald:5>
✅ Each task gets <b>a copy of the context</b> → a <code>set()</code> stays in <b>its own task</b>
</div>

<div v-click="5" border="~ amber/40 rounded-lg" p-3 bg-amber:5>
⚠️ <code>os.getcwd()</code> is still <b>one per process</b> → re-applied <b>each time a task resumes</b>
</div>

</div>

<div absolute top-4 right-6 text-4 op60>
Pseudocode, based on <a href="https://github.com/whitphx/stlite/blob/main/packages/kernel/py/stlite-lib/stlite_lib/server/task_context.py" target="_blank">stlite_lib/server/task_context.py</a>
</div>

<style>
* {
  --slidev-code-font-size: 17px;
  --slidev-code-line-height: 1.45;
}
</style>

<!--
Stlite can run several applications in one Pyodide. One interpreter, one thread, one event loop, and each application runs as its own task.

[click]
So we declare a context variable for the application's home directory.

[click]
When an application starts, its task sets the variable, and then runs the application's script.

[click]
And the applications run side by side, as separate tasks.

[click]
Each task gets its own copy of the context when it's created. So the value one task sets is not seen by the other task. Any code in Application A's task gets Application A's directory.

[click]
But this only tells each task which directory is right. Process-wide state, like the current working directory, is still shared. So Stlite also sets the directory again every time a task resumes.
-->
