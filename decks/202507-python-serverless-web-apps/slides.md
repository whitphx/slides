---
theme: ../../themes/alpha
title: "Democratize serverless web apps for Python devs (with AI)"
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

<h1 text="5xl/20">
Democratize serverless web apps for Python devs (with AI)
</h1>

EuroPython 2025

---

<h1 text-4xl>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div absolute top-40 right-40>
<img src="https://avatars.githubusercontent.com/u/3135397?v=4" alt="whitphx" w="130px">
</div>

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div mt-4>

<v-clicks>

- ML Developer Advocate at <span v-mark.underline.yellow="1">Hugging Face</span> 🤗
- <span v-mark.underline.red="2">Streamlit</span> Creator

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

<div flex="~ row" gap-4>

<div w="1/3">
Write a Python script that solves your problem
</div>

<div w="1/3">
Share it with others as a web app
</div>

<div w="1/3">
<small>Bonus</small>
Make it serverless
</div>

</div>

---
layout: section
---

# Pure-Python Web UI frameworks

---

# You write a Python script for your business...

<img src="https://automatetheboringstuff.com/images/cover-automate3.webp" alt="Automate the Boring Stuff with Python" w="300px">

<small>https://automatetheboringstuff.com/</small>

---

# Example: data processing

<div flex="~ row" gap-4>

<div w="1/6">

Input

<div class="i-ph:file-csv" text-6xl data-id="input-csv"></div>

</div>

<div w="2/3">

Python script

<div flex="~ col" gap-4 m-2>

<FancyArrow
    q1="[data-id=input-csv]"
    pos1="right"
    q2="[data-id=normalize-data]"
    pos2="left"
    arc="0.3"
/>

<Modal title="Normalize the data" w="100%" data-id="normalize-data">

```python
...
```

</Modal>

<FancyArrow
    q1="[data-id=normalize-data]"
    pos1="left"
    q2="[data-id=convert-data]"
    pos2="left"
    arc="-0.7"
/>

<Modal title="Convert the data" w="100%" data-id="convert-data">

```python
...
```

</Modal>

<FancyArrow
    q1="[data-id=convert-data]"
    pos1="left"
    q2="[data-id=llm]"
    pos2="left"
    arc="-0.7"
/>

<Modal title="LLM" w="100%" data-id="llm">

```python
...
```

</Modal>

</div>

</div>

<FancyArrow
    q1="[data-id=llm]"
    pos1="right"
    q2="[data-id=output-csv]"
    pos2="left"
    arc="0.3"
/>

<div w="1/6">

Output

<div class="i-ph:file-csv" text-6xl data-id="output-csv"></div>

</div>

</div>

<!-- At this point, we use remote LLM API -->

---

# Problem: difficult to share

- Share it with **your teammates** for their own use
- Share it with **the sales team** for them to use it with higher cadence
- Share the visualizations with **your manager** to show the results

---

# Create a web app

---

- Jupyter Notebook
- Streamlit
- Gradio
- Shiny for Python
- Panel
- ...

---
layout: section
---

# AI/LLM choice for privacy/transparency

---

# Problems with proprietary LLM API

- Cost
- Privacy
- Transparency
- Control

---

# Run open LLMs in your local machine

---

# Example: replace the API calls with local LLM

---

# Wrap-up: local and open LLMs for privacy

---
layout: section
---

# One step further: serverless web apps

---

# Example: share the app with your customers

More strict privacy requirements

---

# Typical problems serverless web apps solve

* Privacy
* Low latency
* Offline capability​
* Scalability without servers​
* Low cost

---

# Serverless versions of these frameworks

- Stlite
- Gradio-Lite
- Shinylive
- Panel
- ...

---

# Serverless version of Transformers

---

# Architecture of the serverless frameworks

<!-- アーキテクチャを理解して、サーバレスの安全性を技術的に理解するのが目的 -->

---

# Walkthrough: development of pure-Python serverless web apps

---

# Data privacy with app servicer and LLM provider

<div grid="~ cols-2 rows-2">

<div>

Server-side app + LLM API

</div>

<div>

Server-side app + Local LLM

</div>

<div>

Client-side (serverless) app + LLM API

</div>

<div>

Client-side (serverless) app + Local (**in-browser**) LLM

</div>

</div>

---

# Typical situations where Python serverless web apps are useful

* Data processing
* Data analysis
* Data visualization
* Data engineering
* Machine learning

...where
* Python has a strong ecosystem
* data privacy/transparency/control/cost is important

---

# Wrap-up: serverless web apps with Python
