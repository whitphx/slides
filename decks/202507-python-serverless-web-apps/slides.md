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
layout: section
---

<h1>
What do you use Python for?
</h1>

---

<div text-6xl h="100%" flex items-center justify-center>

<v-clicks>

- Data processing
- Machine Learning (AI)
- Web development
- ...

</v-clicks>

</div>

---

# You write a Python script for your business...

<div flex="~ row">

<div grow>

* Process CSV files
* Generate reports
* Process image/video/audio files
* ...or even more complex tasks

</div>

<div>

<div flex="~ col" items-center justify-center>

<img src="https://automatetheboringstuff.com/images/cover-automate3.webp" alt="Automate the Boring Stuff with Python" w="300px">

<small text-sm>https://automatetheboringstuff.com/</small>

</div>

</div>

</div>

---

# Example: processing sales data...

<div flex="~ row" gap-4>

<div :w="$clicks === 0 ? '100%' : '1/6'">

Input

<div class="i-ph:file-csv" text-6xl data-id="input-csv"></div>

<<< @/example/sales_data.csv

</div>

<div w="2/3" v-click="1">

Python script

<div flex="~ col" gap-4 m-2>

<FancyArrow
    q1="[data-id=input-csv]"
    pos1="right"
    q2="[data-id=normalize-data]"
    pos2="left"
    arc="0.3"
    v-click="2"
/>

<Modal title="Normalize the data" w="100%" data-id="normalize-data" v-click="2">

```python
df["payment_type"] = df["payment_method"].map(payment_mapping)
```

</Modal>

<FancyArrow
    q1="[data-id=normalize-data]"
    pos1="left"
    q2="[data-id=convert-data]"
    pos2="left"
    arc="-0.7"
    v-click="3"
/>

<Modal title="Extract the data" w="100%" data-id="convert-data" v-click="3">

```python
df["state"] = df["delivery_address_area"].str.extract(r"([A-Z]{2})$")
```

</Modal>

<FancyArrow
    q1="[data-id=convert-data]"
    pos1="left"
    q2="[data-id=anonymize-data]"
    pos2="left"
    arc="-0.7"
    v-click="4"
/>

<Modal title="Anonymize the data" w="100%" data-id="anonymize-data" v-click="4">

```python
df = anonymize_data(df)
```

</Modal>

</div>

</div>

<FancyArrow
    q1="[data-id=anonymize-data]"
    pos1="right"
    q2="[data-id=output-csv]"
    pos2="left"
    arc="0.3"
    v-click="5"
/>

<div w="1/6" v-click="5">

Output

<div class="i-ph:file-csv" text-6xl data-id="output-csv"></div>

<<< @/example/processed_sales_data.csv

</div>

</div>

<!-- At this point, we don't use LLM -->

---

<<< @/example/process_data.py py {*|117-118|95|97|61|69|9|10-13|15-22|24-25|27-30|69|72|97|99|101-114}{lines:true,maxHeight:'100%'}

---

```bash {1|1-6|*}
❯ python process_data.py --input sales_data.csv --output processed_sales_data.csv

=== PROCESSING SUMMARY ===
Total orders processed: 200
Revenue categories: {'Low': 129, 'High': 66, 'Medium': 5}
Top 10 states by revenue: {'CA': 1076290, 'TX': 865260, 'FL': 610090, 'IL': 533200, 'WA': 524800, 'NM': 510000, 'NV': 431200, 'OR': 409200, 'OH': 404280, 'MI': 398930}

=== SAMPLE RESULTS ===
       order_id revenue_category delivery_area_masked                                 sales_note_cleaned                               feedback_generalized
0  ORD-2024-001           Medium                   NY  First-time client requiring technical consulta...  The product exceeded our expectations and inte...
1  ORD-2024-002              Low                   CA          Repeat customer with good payment history  Delivery was delayed but customer service hand...
2  ORD-2024-003              Low                   IL                    Online purchase through website  Great product but the packaging could be improved
3  ORD-2024-004             High                   TX  Large order negotiated with [PERCENTAGE] volum...  [DEPARTMENT] was very professional and knowled...
4  ORD-2024-005           Medium                   AZ               Customer requested extended warranty  The software is intuitive but documentation ne...
```

<v-click>

<<< @/example/processed_sales_data.csv

</v-click>

---

# Problem: difficult to share

<div flex="~ col" gap-4>

<div>

With **your teammates**, **the sales team**, **your manager**, and **your clients**
- for their own use with higher cadence
- for better understanding of the data

</div>

<div>

<img src="/terminal.png" alt="Terminal-based script">

</div>

</div>

---

# Convert your script to a web app

<div flex="~ row" gap-4>

<div w="1/2" text-3xl>

- Shareable
- Interactive
- Easy to use
- Easy to understand

</div>

<div w="1/2">

<img src="/visualization.png" alt="Web-based shareable visualization app">

</div>

</div>

---

# Tools you can use

<div flex="~ row" gap-2>

<Modal title="Server-side framework & Frontend app" w="1/3" v-click="1">

- FastAPI
- Flask
- Django

... with JavaScript app

</Modal>

<Modal title="Notebook" w="1/3" v-click="2">

- Jupyter Notebook
- Marimo

</Modal>

<Modal title="Web UI frameworks" w="1/3" v-click="3">

- <span v-mark.circle.red="4">Streamlit</span>
- Gradio
- Shiny for Python
- Panel
- ...

</Modal>

</div>

---
layout: section
---

# Pure-Python Web UI frameworks

---

# Streamlit

<SlidevVideo autoplay controls>
  <!-- Anything that can go in an HTML video element. -->
  <source src="https://s3-us-west-2.amazonaws.com/assets.streamlit.io/videos/hero-video.mp4" type="video/mp4" />
</SlidevVideo>

---

# Streamlit

<div flex="~ row" gap-4 h="90%" overflow-hidden>

<div :w="$clicks === 0 ? '100%' : '1/2'" data-id="python-code">

<<< @/example/streamlit_intro_sample.py py {*}{lines:true,maxHeight:'100%'}

</div>

<FancyArrow
    q1="[data-id=python-code]"
    pos1="top"
    q2="[data-id=streamlit-app]"
    pos2="top"
    arc="0.1"
    v-click="1"
>

<code text-nowrap>streamlit run app.py</code>

</FancyArrow>

<div w="1/2" v-click="1">

<div data-id="streamlit-app">

<img src="/streamlit_intro.png" alt="Streamlit app">

</div>

</div>

</div>

---

# Streamlit UI on top of the data processing script

<div flex="~ row" gap-4>

<div w="1/2">

<<< @/example/streamlit_app_simple.py py {*}{lines:true,maxHeight:'100%'}

</div>

<div w="1/2">

<SlidevVideo autoplay controls>
  <source src="/streamlit_app_simple.mp4" type="video/mp4" />
</SlidevVideo>

</div>

</div>

---

# Data visualization
We now have a web screen to display the visual outputs!

<<< @/example/streamlit_app_visual.py py {*}{lines:true,maxHeight:'100%'}

---

<SlidevVideo autoplay controls>
  <source src="/streamlit_app_visual.mp4" type="video/mp4" />
</SlidevVideo>

---
layout: section
---

# Empower your app with AI/LLM

---

# The power of AI/LLM

---

# Transformers 🤗


---

# Example: LLM to extract more insights in data processing

<<< @/example/transformers_sentiment_analysis_sample.py py {*}{maxHeight:'100%'}

<v-click>

```bash
❯ python transformers_sentiment_analysis_sample.py
Device set to use mps:0
[{'label': 'POSITIVE', 'score': 0.9998774528503418}]
```

</v-click>

---

<<< @/example/process_data_with_llm.py py {*}{lines:true,maxHeight:'100%'}

---

```shell
❯ uv run python process_data_with_llm.py --input sales_data.csv --output processed_sales_data_with_llm.csv
Device set to use mps:0
Device set to use mps:0

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

# Streamlit-ify the LLM version as well!

<<< @/example/streamlit_app_with_llm.py py {*}{lines:true,maxHeight:'100%'}

---

<img src="/streamlit_app_with_llm.png" alt="Streamlit app with LLM">

---

# Side note: Local LLMs vs LLM APIs?

<div flex="~ row" gap-4 mt-4>

<Modal title="Local LLMs" w="1/2">

- Open, Transparent
- More control over the data, privacy, and cost
- Requires compute resources

<div max-h="60" overflow-y-scroll>

<<< @/example/transformers_sentiment_analysis_sample.py py {*}

</div>

</Modal>

<Modal title="LLM APIs" w="1/2">

- Easy to use
- Cost
- Trust on the provider

<div max-h="60" overflow-y-scroll>

<<< @/example/anthropic_sentiment_analysis_example.py py {*}

</div>

</Modal>

</div>

---

# Wrap-up: LLM-powered data processing

---
layout: section
---

<h1>
One step further:<br>
Serverless web apps
</h1>

---

# Example: share the app with your customers

- More strict privacy requirements
- Difficulty to manage the web server

---

# The concept of "serverless"

- No server-side runtime
The app runs entirely in the browser—there’s no backend code or server process involved.

- All logic runs on the client
Application logic is shipped as static files and executed in the user’s device.

- No data sent to remote servers
All processing happens locally, keeping user data private and secure.

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

# Development of serverless Streamlit app

<div max-h="80vh">

````md magic-move {lines: true, maxHeight: '100%'}

<<< @/stlite_example/simple_fragment0.html html

<<< @/stlite_example/simple_fragment1.html html {6,11}

<<< @/stlite_example/simple_fragment2.html html {10-18}

<<< @/stlite_example/simple.html html {15-18|*}

````

</div>

---
layout: section
---

# So what about LLM?

---

# Serverless version of Transformers 🤗


---

# Architecture of the serverless frameworks

<!-- アーキテクチャを理解して、サーバレスの安全性を技術的に理解するのが目的 -->


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
