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

<<< @/example/sales_data.csv

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

<<< @/example/processed_sales_data.csv

</div>

</div>

<!-- At this point, we use remote LLM API -->

---

```shell
❯ uv run python main.py --input sales_data.csv
INFO:__main__:Loading sales data from sales_data.csv
INFO:__main__:Processing structured data...
INFO:__main__:Processing unstructured data with local LLM...
Device set to use mps:0
Device set to use mps:0
INFO:__main__:Processing sentiment analysis with local LLM...
INFO:__main__:Processing note classification with local LLM...
INFO:__main__:Applying privacy protection...

=== PROCESSING SUMMARY ===
Total orders processed: 200
Revenue categories: {'Low': 129, 'High': 66, 'Medium': 5}
Sentiment distribution: {'POSITIVE': 173, 'NEGATIVE': 27}
Note categories: {'product_feedback': 126, 'customer_relationship': 37, 'technical_issue': 35, 'pricing_negotiation': 2}

=== SAMPLE RESULTS ===
       order_id revenue_category sentiment          note_category identified_issues
0  ORD-2024-001           Medium  POSITIVE        technical_issue              none
1  ORD-2024-002              Low  POSITIVE  customer_relationship             delay
2  ORD-2024-003              Low  POSITIVE  customer_relationship           improve
3  ORD-2024-004             High  POSITIVE    pricing_negotiation              none
4  ORD-2024-005           Medium  NEGATIVE  customer_relationship           improve
```

---

# Problem: difficult to share

- Share it with **your teammates** for their own use
- Share it with **the sales team** for them to use it with higher cadence
- Share the visualizations with **your manager** to show the results

---

# Convert your script to a web app

- Shareable
- Interactive
- Easy to use

---

# Tools you can use

### Notebook
- Jupyter Notebook
- Marimo

### Web UI frameworks
- Streamlit
- Gradio
- Shiny for Python
- Panel
- ...

---

# Streamlit

<SlidevVideo autoplay controls>
  <!-- Anything that can go in an HTML video element. -->
  <source src="https://s3-us-west-2.amazonaws.com/assets.streamlit.io/videos/hero-video.mp4" type="video/mp4" />
</SlidevVideo>

---

# Streamlit

<div flex="~ row" gap-4>

<div w="1/2" data-id="python-code">

```python
...
```

</div>

<FancyArrow
    q1="[data-id=python-code]"
    pos1="top"
    q2="[data-id=streamlit-app]"
    pos2="top"
    arc="0.3"
/>

<div w="1/2">

<div data-id="streamlit-app">

IMG

</div>

</div>

</div>

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
Transformers library 🤗

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
