---
theme: ../../themes/alpha
title: "In-browser Python Web UI frameworks, and my random thoughts about Pyodide applications"
drawings:
  persist: false
mdc: true
defaults:
  transition: slide-left
transition: fade-out
addons:
  - fancy-arrow
---

<h1 text="5xl/20">
Intro of in-browser Python Web UI frameworks,<br />and my random thoughts about<br />Pyodide applications
</h1>

PyCon US 2025 Wasm Summit

---

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

---

# In-browser Python web UI frameworks

| Framework | Wasm ver. |
| --------- | --------- |
| [Streamlit](https://streamlit.io/) | <span data-id="stlite" pr-2>[Stlite](https://github.com/whitphx/stlite)</span> → [Streamlit Playground](https://streamlit.io/playground) |
| [Gradio](https://www.gradio.app/) | <span data-id="gradio-lite" pr-2>[Gradio Lite](https://www.gradio.app/guides/gradio-lite)</span> → [Gradio Playground](https://www.gradio.app/playground) |
| [Shiny for Python](https://shiny.posit.co/py/) | [Shinylive](https://github.com/posit-dev/shinylive) → [Shiny Examples](https://shinylive.io/py/examples/) |
| [Panel](https://panel.holoviz.org/) | [Panel](https://panel.holoviz.org/how_to/wasm/index.html) |

<v-click>

  <FancyArrow arc="-0.5" q1="[data-id=authored]" pos1="top" q2="[data-id=stlite]" pos2="right" color="orange" />
  <FancyArrow arc="-0.5" q1="[data-id=authored]" pos1="top" q2="[data-id=gradio-lite]" pos2="right" color="orange" />

  <span data-id="authored" absolute right-10 bottom-30 v-mark.orange="1">I authored</span>

</v-click>

---

<div flex="~ row">

<div w="1/2" h-110>

```html {*|19-41}{lines:true,maxHeight:'100%'}
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <title>Stlite App</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@stlite/browser@0.81.6/build/style.css"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import { mount } from "https://cdn.jsdelivr.net/npm/@stlite/browser@0.81.6/build/stlite.js";
      mount(
        `
import streamlit as st
import pandas as pd
import numpy as np

st.write("Streamlit supports a wide range of data visualizations, including [Plotly, Altair, and Bokeh charts](https://docs.streamlit.io/develop/api-reference/charts). 📊 And with over 20 input widgets, you can easily make your data interactive!")

all_users = ["Alice", "Bob", "Charly"]
with st.container(border=True):
    users = st.multiselect("Users", all_users, default=all_users)
    rolling_average = st.toggle("Rolling average")

np.random.seed(42)
data = pd.DataFrame(np.random.randn(20, len(users)), columns=users)
if rolling_average:
    data = data.rolling(7).mean().dropna()

tab1, tab2 = st.tabs(["Chart", "Dataframe"])
tab1.line_chart(data, height=250)
tab2.dataframe(data, height=250, use_container_width=True)

`,
        document.getElementById("root"),
      );
    </script>
  </body>
</html>
```

</div>

<div w="1/2">
<img src="/assets/stlite-sample.png">
</div>

</div>

<div>

https://github.com/whitphx/stlite, https://edit.share.stlite.net/

</div>

---

# Combinations with AI frameworks, e.g. Transformers

One typical use case of such frameworks is to build serverless AI apps.

- [Example: Gradio-Lite + Transformers.js.py](https://slides.com/whitphx/feday2024-gradio-lite-transformers-js-py#/55)

- **Transformers** is one of the most popular ML framework, but it doesn't work on Pyodide due to its backend frameworks.
- I created `transformers.js.py` that is a Pyodide wrapper of `transformers.js` that is a JavaScript port of Transformers.
  - There are still some incompatibility with the original Python ver.
    - Sync vs Async: WebGL/WebGPU APIs which Transformers.js relies on are async while the original Transformers' APIs are synchronous.

---

# Support Synchronous API on Pyodide?

[WgPy: GPU-accelerated NumPy-like array library for web browsers](https://arxiv.org/abs/2503.00279)

- WebGL/WebGPU accelerated matrix calculations with **NumPy-compatible API** that are synchronous.
- Uses **Atomics API** for synchronous code on Pyodide
  - Blocks the worker thread where the Pyodide code is running to make the Python API synchronous from the main thread where WebGL/WebGPU APIs are called asynchronously.

<div h-70 flex gap-4>
<img src="/assets/wgpy-fig1.png"/>
<img src="/assets/wgpy-fig3.png"/>
</div>

---

# Potentials?

<div text-2xl>

<v-clicks>

* More interoperability with Python
  * Support more synchronous code
* AI/ML library integrations
* WebML field
  * e.g. Web Machine Learning Community/WG at W3C: Standardizing the JavaScript API for in-browser ML
    * Web Neural Network API (WebNN)
    * WebML Task-based API

</v-clicks>

</div>
