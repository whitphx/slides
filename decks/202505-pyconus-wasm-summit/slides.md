---
theme: ../../themes/alpha
title: ""
drawings:
  persist: false
mdc: true
defaults:
  transition: slide-left
transition: fade-out
addons:
  - anipres
  - fancy-arrow
---

<h1 text="6xl/20">
My activities and thoughts<br />
about Pyodide applications
</h1>

PyCon US 2025 Wasm Summit

---

<div class="slide">

<h1 text-4xl>Yuichiro Tachibana</h1>

@whitphx

<div mt-8 v-click>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div mt-4>

<v-clicks>

- ML Developer Advocate at <span v-mark.underline.yellow="2">Hugging Face</span> 🤗
- <span v-mark.underline.red="3">Streamlit</span> Creator

</v-clicks>

</div>

<div my-10 w-min flex="~ gap-1" items-center justify-center v-click>
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

</div>

<style>
.slide {
  font-size: 1.8em;
}
</style>

---

# In-browser Python web UI frameworks

| Framework | Wasm ver. |
| --------- | --------- |
| [Streamlit](https://streamlit.io/) | <span data-id="stlite" pr-2>[Stlite](https://github.com/whitphx/stlite)</span> |
| [Gradio](https://www.gradio.app/) | <span data-id="gradio-lite" pr-2>[Gradio Lite](https://www.gradio.app/guides/gradio-lite)</span> |
| [Shiny for Python](https://shiny.posit.co/py/) | [Shinylive](https://posit-dev.github.io/r-shinylive/) |
| [Panel](https://panel.holoviz.org/) | [Panel](https://panel.holoviz.org/how_to/wasm/index.html) |

<v-click>

  <FancyArrow arc="-0.5" q1="[data-id=authored]" pos1="top" q2="[data-id=stlite]" pos2="right" color="orange" />
  <FancyArrow arc="-0.5" q1="[data-id=authored]" pos1="top" q2="[data-id=gradio-lite]" pos2="right" color="orange" />

  <span data-id="authored" absolute right-10 bottom-30 v-mark.orange="1">I authored</span>

</v-click>


---

# Combinations with AI frameworks, e.g. Transformers

One typical use case of such frameworks is to build serverless AI apps.

- TODO: Link to Gradio-Lite + Transformers presentation.

- Transformers is one of the most common ML framework, but it doesn't work on Pyodide due to its backend frameworks.
- I created `transformers.js.py` that is a Pyodide wrapper of `transformers.js` that is a JavaScript port of Transformers.
  - There are still some incompatibility with the original Python ver.
    - Sync vs Async: WebGL/WebGPU APIs which Transformers.js relies on are async while the original Transformers' API are synchronous.

---

# Support Synchronous API on Pyodide

[WgPy: GPU-accelerated NumPy-like array library for web browsers](https://arxiv.org/abs/2503.00279)

- WebGL/WebGPU accelerated matrix calculations with **NumPy-compatible API** that are synchronous.
- Atomics API
  - Blocks the worker thread where the Pyodide code is running to make the Python API synchronous from the main thread where WebGL/WebGPU APIs are called asynchronously.

---

# Potential demands/growth

- More interoperability with Python
  - Support more synchronous code
- AI library support
- WebML collaboration
