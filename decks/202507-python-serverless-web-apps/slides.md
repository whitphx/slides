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
  <source src="https://s3-us-west-2.amazonaws.com/assets.streamlit.io/videos/hero-video.mp4" type="video/mp4" />
</SlidevVideo>

---

# Streamlit

<img absolute top-5 right-10 src="/streamlit-mark-color.svg" alt="Streamlit logo" h="15">

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

# Extra: Data visualization
We now have a web screen to display the visual outputs!

<div h="100">

<<< @/example/streamlit_app_visual.py py {*}{lines:true,maxHeight:'100%'}

</div>

---

<div flex="~ col" h="100%">

<SlidevVideo autoplay controls max-h="100%">
  <source src="/streamlit_app_visual.mp4" type="video/mp4" />
</SlidevVideo>

<div>
<a href="https://uwftsvlkjdv58mgvxfrku6.streamlit.app/" text-xs target="_blank" rel="noopener noreferrer">
https://uwftsvlkjdv58mgvxfrku6.streamlit.app/
</a>
</div>

</div>

---
layout: section
---

# Empower your app with AI/LLM

---

# The power of AI/LLM

<v-clicks>

- More intelligent data processing
- More modalities, unstructured data

</v-clicks>

<div grid="~ cols-2" gap-4 mt-4 v-click>

<div border="~ slate/50 rounded-lg" from-slate:10 to-indigo:10 bg-gradient-to-br>
<div flex gap-2 items-center bg-slate:10 p2 rounded text-xl>
    <mdi:text-box-outline />
    Text
</div>
<div text-sm p-2>
    Question Answering, Summarization, Text Classification, Text Generation, Text-to-text Generation, Token Classification, Translation, Zero-Shot Classification, Feature Extraction, etc...
</div>
</div>


<div border="~ teal/50 rounded-lg" from-teal:10 to-indigo:10 bg-gradient-to-br>
<div flex gap-2 items-center bg-teal:10 p2 rounded text-xl>
    <mdi:image-outline />
    Image/Video
</div>
<div text-sm p-2>
    Depth Estimation, Image Classification, Image SegmentationImage-to-Image, Mask Generation, Object Detection, Video Classification, Unconditional Image Generation, Image Feature Extraction
</div>
</div>

<div border="~ lime/50 rounded-lg" from-lime:10 to-indigo:10 bg-gradient-to-br>
<div flex gap-2 items-center bg-lime:10 p2 rounded text-xl>
    <vscode-icons:file-type-audio />
    Audio
</div>
<div text-sm p-2>
    Audio Classification, Audio-to-Audio, Automatic Speech Recognition, Text-to-Speech
</div>
</div>


<div border="~ amber/50 rounded-lg" from-amber:10 to-indigo:10 bg-gradient-to-br>
<div flex gap-2 items-center bg-amber:10 p2 rounded text-xl>
    <icon-park-outline:multi-ring />
    Multimodal
</div>
<div text-sm p-2>
    Document Question Answering, Image-to-Text, Text-to-Image, Visual Question Answering, Zero-Shot Audio Classification, Zero-Shot Image Classification, Zero-Shot Object Detection
</div>
</div>

</div>

---

# Transformers 🤗
https://github.com/huggingface/transformers

Python library to run various AI/ML models in a unified way.

<div mt-4 text-4xl>
```shell
pip install "transformers[torch]"
```
</div>


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

<div flex="~ col" h="100%">

<img src="/streamlit_app_with_llm.png" alt="Streamlit app with LLM" max-h="100%" object-cover>

<div>
<a href="https://c2amowmwbb5niziwazeduq.streamlit.app/" text-xs target="_blank" rel="noopener noreferrer">
https://c2amowmwbb5niziwazeduq.streamlit.app/
</a>
</div>

</div>

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
layout: section
---

<h1>
One step further:<br>
Serverless web apps
</h1>

---

# Example: share the app with your customers

<div text-4xl>

- More strict privacy requirements
- Difficulty to manage the web server

</div>

---

# The concept of "serverless"
a.k.a. "client-side" or "in-browser"

<div flex="~ col" gap-4 mt-8>

<Modal title="No server-side runtime" v-click>
The app runs entirely in the browser — there’s no backend code or server process involved.
</Modal>

<Modal title="All logic runs on the client" v-click>
Source files are loaded to the user’s device and executed there.
</Modal>

<Modal title="No data sent to remote servers" v-click>
All processing happens locally, keeping user data private and secure.
</Modal>

</div>

---

# What "serverless" provides

<v-clicks text-4xl>

* Privacy
* Low latency
* Offline capability​
* Scalability without servers​
* Low cost

</v-clicks>

---

# Serverless versions of these frameworks

| Python Framework | Wasm ver. |
| --------- | --------- |
| <span v-mark.circle.red="1">[Streamlit](https://streamlit.io/)</span> | <span v-mark.circle.red="1">[Stlite](https://github.com/whitphx/stlite)</span> → [Streamlit Playground](https://streamlit.io/playground) |
| [Gradio](https://www.gradio.app/) | [Gradio Lite](https://www.gradio.app/guides/gradio-lite) → [Gradio Playground](https://www.gradio.app/playground) |
| [Shiny for Python](https://shiny.posit.co/py/) | [Shinylive](https://github.com/posit-dev/shinylive) → [Shiny Examples](https://shinylive.io/py/examples/) |
| [Panel](https://panel.holoviz.org/) | [Panel](https://panel.holoviz.org/how_to/wasm/index.html) |

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

# Easier way: Stlite Sharing

<a href="https://edit.share.stlite.net/" target="_blank" rel="noopener noreferrer">
<img src="/stlite_sharing.png" alt="Stlite Sharing" max-h="100%" object-cover m-auto>
</a>

---
layout: section
---

# So, what about LLM?

---

# Serverless version of Transformers 🤗

<div flex="~ col" gap-4>

<Modal title="Transformers" v-click="1">

- Python library to run AI/ML models.

</Modal>

<Modal title="Transformers.js" v-click="2">

- JS version of Transformers.
- Run pretrained AI/ML models **in the browser**.

</Modal>

<Modal title="Transformers.js.py" v-click="3">

- Use Transformers.js from in-browser Python.

</Modal>

</div>

---

# Transformers.js.py

<div flex="~ row" gap-4>

<Modal title="Transformers" w="1/2">

<<< @/example/transformers_sentiment_analysis_sample.py py {*}

</Modal>

<Modal title="Transformers.js.py" w="1/2">

```python
from transformers_js_py import pipeline

sentiment_analyzer = await pipeline(
    "sentiment-analysis",
    "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
)

text = "I love LLMs!"

result = await sentiment_analyzer(text)

print(result)
```

- All methods are async; you need to `await` them.

</Modal>

</div>

---

# Put them together into a serverless AI app

<div h="80%" max-h="80%">

<<< @/stlite_example/app_llm.html html {*}{maxHeight: '100%'}

</div>

<div mt-8>
<a href="https://edit.share.stlite.net/#!ChBzdHJlYW1saXRfYXBwLnB5EoU6ChBzdHJlYW1saXRfYXBwLnB5EvA5Cu05aW1wb3J0IHN0cmVhbWxpdCBhcyBzdAppbXBvcnQgcGFuZGFzIGFzIHBkCmltcG9ydCBhbHRhaXIgYXMgYWx0Cgpmcm9tIG1haW4gaW1wb3J0IHByb2Nlc3Nfc2FsZXNfZGF0YQoKCnN0LnRpdGxlKCJTYWxlcyBEYXRhIFByb2Nlc3NvciIpCgpzdC53cml0ZSgiVXBsb2FkIGEgQ1NWIGZpbGUgdG8gcHJvY2VzczoiKQp1cGxvYWRlZF9maWxlID0gc3QuZmlsZV91cGxvYWRlcigiQ2hvb3NlIGEgQ1NWIGZpbGUiLCB0eXBlPSJjc3YiKQoKaWYgdXBsb2FkZWRfZmlsZSBpcyBOb25lOgogICAgc3Quc3RvcCgpCgpkZiA9IHBkLnJlYWRfY3N2KHVwbG9hZGVkX2ZpbGUpCgpkZiA9IGF3YWl0IHByb2Nlc3Nfc2FsZXNfZGF0YShkZikKCnN0LndyaXRlKGRmKQpzdC5kb3dubG9hZF9idXR0b24oCiAgICBsYWJlbD0iRG93bmxvYWQgcHJvY2Vzc2VkIGRhdGEiLAogICAgZGF0YT1kZi50b19jc3YoaW5kZXg9RmFsc2UpLAogICAgZmlsZV9uYW1lPSJwcm9jZXNzZWRfc2FsZXNfZGF0YS5jc3YiLAogICAgbWltZT0idGV4dC9jc3YiLAopCgojIyMgTWV0cmljcwpjb2wxLCBjb2wyLCBjb2wzLCBjb2w0ID0gc3QuY29sdW1ucyg0KQp3aXRoIGNvbDE6CiAgICBzdC5tZXRyaWMobGFiZWw9IlRvdGFsIG9yZGVycyIsIHZhbHVlPWxlbihkZikpCndpdGggY29sMjoKICAgIHRvdGFsX3JldmVudWUgPSBkZlsicHVyY2hhc2VfYW1vdW50Il0uc3VtKCkKICAgIGlmIHRvdGFsX3JldmVudWUgPj0gMV8wMDBfMDAwOgogICAgICAgIHJldmVudWVfZGlzcGxheSA9IGYiJHt0b3RhbF9yZXZlbnVlIC8gMV8wMDBfMDAwOi4xZn1NIgogICAgZWxpZiB0b3RhbF9yZXZlbnVlID49IDFfMDAwOgogICAgICAgIHJldmVudWVfZGlzcGxheSA9IGYiJHt0b3RhbF9yZXZlbnVlIC8gMV8wMDA6LjBmfUsiCiAgICBlbHNlOgogICAgICAgIHJldmVudWVfZGlzcGxheSA9IGYiJHt0b3RhbF9yZXZlbnVlOiwuMGZ9IgogICAgc3QubWV0cmljKGxhYmVsPSJUb3RhbCByZXZlbnVlIiwgdmFsdWU9cmV2ZW51ZV9kaXNwbGF5KQp3aXRoIGNvbDM6CiAgICBhdmdfb3JkZXJfdmFsdWUgPSBkZlsicHVyY2hhc2VfYW1vdW50Il0ubWVhbigpCiAgICBzdC5tZXRyaWMobGFiZWw9IkF2ZXJhZ2Ugb3JkZXIgdmFsdWUiLCB2YWx1ZT1mIiR7YXZnX29yZGVyX3ZhbHVlOiwuMGZ9IikKd2l0aCBjb2w0OgogICAgcG9zaXRpdmVfc2VudGltZW50ID0gbGVuKGRmW2RmWyJzZW50aW1lbnQiXSA9PSAiUE9TSVRJVkUiXSkKICAgIHNlbnRpbWVudF9yYXRlID0gcG9zaXRpdmVfc2VudGltZW50IC8gbGVuKGRmKSAqIDEwMAogICAgc3QubWV0cmljKGxhYmVsPSJQb3NpdGl2ZSBzZW50aW1lbnQiLCB2YWx1ZT1mIntzZW50aW1lbnRfcmF0ZTouMWZ9JSIpCgojIyMgQ2hhcnRzCmNvbDEsIGNvbDIgPSBzdC5jb2x1bW5zKDIpCgp3aXRoIGNvbDE6CiAgICBzdC5zdWJoZWFkZXIoIlJldmVudWUgYnkgQ3VzdG9tZXIgU2VnbWVudCIpCiAgICBzZWdtZW50X3JldmVudWUgPSAoCiAgICAgICAgZGYuZ3JvdXBieSgiY3VzdG9tZXJfc2VnbWVudCIpWyJwdXJjaGFzZV9hbW91bnQiXS5zdW0oKS5yZXNldF9pbmRleCgpCiAgICApCiAgICBzdC5iYXJfY2hhcnQoc2VnbWVudF9yZXZlbnVlLnNldF9pbmRleCgiY3VzdG9tZXJfc2VnbWVudCIpWyJwdXJjaGFzZV9hbW91bnQiXSkKCgp3aXRoIGNvbDI6CiAgICBzdC5zdWJoZWFkZXIoIlRvcCAxMCBTdGF0ZXMgYnkgUmV2ZW51ZSIpCiAgICBzdGF0ZV9yZXZlbnVlID0gKAogICAgICAgIGRmLmdyb3VwYnkoInN0YXRlIilbInB1cmNoYXNlX2Ftb3VudCJdCiAgICAgICAgLnN1bSgpCiAgICAgICAgLnNvcnRfdmFsdWVzKGFzY2VuZGluZz1GYWxzZSkKICAgICAgICAuaGVhZCgxMCkKICAgICkKICAgIHN0LmFsdGFpcl9jaGFydCgKICAgICAgICBhbHQuQ2hhcnQoc3RhdGVfcmV2ZW51ZS5yZXNldF9pbmRleCgpKQogICAgICAgIC5tYXJrX2JhcigpCiAgICAgICAgLmVuY29kZSh4PWFsdC5YKCJzdGF0ZSIsIHNvcnQ9Tm9uZSksIHk9YWx0LlkoInB1cmNoYXNlX2Ftb3VudCIpKSwKICAgICAgICB1c2VfY29udGFpbmVyX3dpZHRoPVRydWUsCiAgICApCgpjb2wxLCBjb2wyID0gc3QuY29sdW1ucygyKQoKd2l0aCBjb2wxOgogICAgc3Quc3ViaGVhZGVyKCJQYXltZW50IE1ldGhvZCBEaXN0cmlidXRpb24iKQogICAgcGF5bWVudF9jb3VudHMgPSBkZlsicGF5bWVudF9tZXRob2QiXS52YWx1ZV9jb3VudHMoKQogICAgc3QuYWx0YWlyX2NoYXJ0KAogICAgICAgIGFsdC5DaGFydChwYXltZW50X2NvdW50cy5yZXNldF9pbmRleCgpKQogICAgICAgIC5tYXJrX2JhcigpCiAgICAgICAgLmVuY29kZSh4PWFsdC5YKCJwYXltZW50X21ldGhvZCIsIHNvcnQ9Tm9uZSksIHk9YWx0LlkoImNvdW50IikpLAogICAgICAgIHVzZV9jb250YWluZXJfd2lkdGg9VHJ1ZSwKICAgICkKCndpdGggY29sMjoKICAgIHN0LnN1YmhlYWRlcigiU2VudGltZW50IERpc3RyaWJ1dGlvbiIpCiAgICBzZW50aW1lbnRfY291bnRzID0gZGZbInNlbnRpbWVudCJdLnZhbHVlX2NvdW50cygpCiAgICBzdC5hbHRhaXJfY2hhcnQoCiAgICAgICAgYWx0LkNoYXJ0KHNlbnRpbWVudF9jb3VudHMucmVzZXRfaW5kZXgoKSkKICAgICAgICAubWFya19iYXIoKQogICAgICAgIC5lbmNvZGUoeD1hbHQuWCgic2VudGltZW50Iiwgc29ydD1Ob25lKSwgeT1hbHQuWSgiY291bnQiKSksCiAgICAgICAgdXNlX2NvbnRhaW5lcl93aWR0aD1UcnVlLAogICAgKQoKY29sMSwgY29sMiA9IHN0LmNvbHVtbnMoMikKCndpdGggY29sMToKICAgIHN0LnN1YmhlYWRlcigiTm90ZSBDYXRlZ29yeSBEaXN0cmlidXRpb24iKQogICAgbm90ZV9jYXRlZ29yeV9jb3VudHMgPSBkZlsibm90ZV9jYXRlZ29yeSJdLnZhbHVlX2NvdW50cygpCiAgICBzdC5hbHRhaXJfY2hhcnQoCiAgICAgICAgYWx0LkNoYXJ0KG5vdGVfY2F0ZWdvcnlfY291bnRzLnJlc2V0X2luZGV4KCkpCiAgICAgICAgLm1hcmtfYmFyKCkKICAgICAgICAuZW5jb2RlKHg9YWx0LlgoIm5vdGVfY2F0ZWdvcnkiLCBzb3J0PU5vbmUpLCB5PWFsdC5ZKCJjb3VudCIpKSwKICAgICAgICB1c2VfY29udGFpbmVyX3dpZHRoPVRydWUsCiAgICApCgp3aXRoIGNvbDI6CiAgICBzdC5zdWJoZWFkZXIoIklkZW50aWZpZWQgSXNzdWVzIikKICAgIGlzc3Vlc19jb3VudHMgPSBkZlsiaWRlbnRpZmllZF9pc3N1ZXMiXS52YWx1ZV9jb3VudHMoKQogICAgc3QuYWx0YWlyX2NoYXJ0KAogICAgICAgIGFsdC5DaGFydChpc3N1ZXNfY291bnRzLnJlc2V0X2luZGV4KCkpCiAgICAgICAgLm1hcmtfYmFyKCkKICAgICAgICAuZW5jb2RlKHg9YWx0LlgoImlkZW50aWZpZWRfaXNzdWVzIiwgc29ydD1Ob25lKSwgeT1hbHQuWSgiY291bnQiKSksCiAgICAgICAgdXNlX2NvbnRhaW5lcl93aWR0aD1UcnVlLAogICAgKQoKc3Quc3ViaGVhZGVyKCJTYWxlcyBOb3RlIEFuYWx5c2lzIikKc3Qud3JpdGUoIlNhbXBsZSBzYWxlcyBub3RlczoiKQojIFNob3cgYSBzYW1wbGUgb2Ygc2FsZXMgbm90ZXMgaW4gYW4gZXhwYW5kYWJsZSBzZWN0aW9uCndpdGggc3QuZXhwYW5kZXIoIlZpZXcgc2FsZXMgbm90ZXMgc2FtcGxlcyIpOgogICAgc2FtcGxlX25vdGVzID0gZGZbWyJvcmRlcl9pZCIsICJjdXN0b21lcl9zZWdtZW50IiwgInNhbGVzX25vdGUiXV0uaGVhZCgxMCkKICAgIHN0LmRhdGFmcmFtZShzYW1wbGVfbm90ZXMsIHVzZV9jb250YWluZXJfd2lkdGg9VHJ1ZSkKCnN0LnN1YmhlYWRlcigiQnJvd3NlIERhdGEgd2l0aCBGaWx0ZXJzIikKCiMgQ3JlYXRlIGZpbHRlciBjb2x1bW5zCmZpbHRlcl9jb2wxLCBmaWx0ZXJfY29sMiwgZmlsdGVyX2NvbDMgPSBzdC5jb2x1bW5zKDMpCgp3aXRoIGZpbHRlcl9jb2wxOgogICAgIyBDdXN0b21lciBzZWdtZW50IGZpbHRlcgogICAgc2VnbWVudHMgPSBbIkFsbCJdICsgc29ydGVkKGRmWyJjdXN0b21lcl9zZWdtZW50Il0udW5pcXVlKCkudG9saXN0KCkpCiAgICBzZWxlY3RlZF9zZWdtZW50ID0gc3Quc2VsZWN0Ym94KCJDdXN0b21lciBTZWdtZW50Iiwgc2VnbWVudHMpCgogICAgIyBSZXZlbnVlIGNhdGVnb3J5IGZpbHRlcgogICAgcmV2ZW51ZV9jYXRlZ29yaWVzID0gWyJBbGwiXSArIHNvcnRlZChkZlsicmV2ZW51ZV9jYXRlZ29yeSJdLnVuaXF1ZSgpLnRvbGlzdCgpKQogICAgc2VsZWN0ZWRfcmV2ZW51ZV9jYXQgPSBzdC5zZWxlY3Rib3goIlJldmVudWUgQ2F0ZWdvcnkiLCByZXZlbnVlX2NhdGVnb3JpZXMpCgp3aXRoIGZpbHRlcl9jb2wyOgogICAgIyBQYXltZW50IG1ldGhvZCBmaWx0ZXIKICAgIHBheW1lbnRfbWV0aG9kcyA9IFsiQWxsIl0gKyBzb3J0ZWQoZGZbInBheW1lbnRfbWV0aG9kIl0udW5pcXVlKCkudG9saXN0KCkpCiAgICBzZWxlY3RlZF9wYXltZW50ID0gc3Quc2VsZWN0Ym94KCJQYXltZW50IE1ldGhvZCIsIHBheW1lbnRfbWV0aG9kcykKCiAgICAjIFNlbnRpbWVudCBmaWx0ZXIKICAgIHNlbnRpbWVudHMgPSBbIkFsbCJdICsgc29ydGVkKGRmWyJzZW50aW1lbnQiXS51bmlxdWUoKS50b2xpc3QoKSkKICAgIHNlbGVjdGVkX3NlbnRpbWVudCA9IHN0LnNlbGVjdGJveCgiU2VudGltZW50Iiwgc2VudGltZW50cykKCndpdGggZmlsdGVyX2NvbDM6CiAgICAjIFN0YXRlIGZpbHRlcgogICAgc3RhdGVzID0gWyJBbGwiXSArIHNvcnRlZChkZlsic3RhdGUiXS51bmlxdWUoKS50b2xpc3QoKSkKICAgIHNlbGVjdGVkX3N0YXRlID0gc3Quc2VsZWN0Ym94KCJTdGF0ZSIsIHN0YXRlcykKCiAgICAjIE5vdGUgY2F0ZWdvcnkgZmlsdGVyCiAgICBub3RlX2NhdGVnb3JpZXMgPSBbIkFsbCJdICsgc29ydGVkKGRmWyJub3RlX2NhdGVnb3J5Il0udW5pcXVlKCkudG9saXN0KCkpCiAgICBzZWxlY3RlZF9ub3RlX2NhdCA9IHN0LnNlbGVjdGJveCgiTm90ZSBDYXRlZ29yeSIsIG5vdGVfY2F0ZWdvcmllcykKCiMgUHVyY2hhc2UgYW1vdW50IHJhbmdlIGZpbHRlcgpzdC53cml0ZSgiUHVyY2hhc2UgQW1vdW50IFJhbmdlOiIpCm1pbl9hbW91bnQgPSBmbG9hdChkZlsicHVyY2hhc2VfYW1vdW50Il0ubWluKCkpCm1heF9hbW91bnQgPSBmbG9hdChkZlsicHVyY2hhc2VfYW1vdW50Il0ubWF4KCkpCmFtb3VudF9yYW5nZSA9IHN0LnNsaWRlcigKICAgICJTZWxlY3QgcmFuZ2UiLAogICAgbWluX3ZhbHVlPW1pbl9hbW91bnQsCiAgICBtYXhfdmFsdWU9bWF4X2Ftb3VudCwKICAgIHZhbHVlPShtaW5fYW1vdW50LCBtYXhfYW1vdW50KSwKICAgIGZvcm1hdD0iJCUuMGYiLAopCgojIEFwcGx5IGZpbHRlcnMKZmlsdGVyZWRfZGYgPSBkZi5jb3B5KCkKCmlmIHNlbGVjdGVkX3NlZ21lbnQgIT0gIkFsbCI6CiAgICBmaWx0ZXJlZF9kZiA9IGZpbHRlcmVkX2RmW2ZpbHRlcmVkX2RmWyJjdXN0b21lcl9zZWdtZW50Il0gPT0gc2VsZWN0ZWRfc2VnbWVudF0KaWYgc2VsZWN0ZWRfcmV2ZW51ZV9jYXQgIT0gIkFsbCI6CiAgICBmaWx0ZXJlZF9kZiA9IGZpbHRlcmVkX2RmW2ZpbHRlcmVkX2RmWyJyZXZlbnVlX2NhdGVnb3J5Il0gPT0gc2VsZWN0ZWRfcmV2ZW51ZV9jYXRdCmlmIHNlbGVjdGVkX3BheW1lbnQgIT0gIkFsbCI6CiAgICBmaWx0ZXJlZF9kZiA9IGZpbHRlcmVkX2RmW2ZpbHRlcmVkX2RmWyJwYXltZW50X21ldGhvZCJdID09IHNlbGVjdGVkX3BheW1lbnRdCmlmIHNlbGVjdGVkX3NlbnRpbWVudCAhPSAiQWxsIjoKICAgIGZpbHRlcmVkX2RmID0gZmlsdGVyZWRfZGZbZmlsdGVyZWRfZGZbInNlbnRpbWVudCJdID09IHNlbGVjdGVkX3NlbnRpbWVudF0KaWYgc2VsZWN0ZWRfc3RhdGUgIT0gIkFsbCI6CiAgICBmaWx0ZXJlZF9kZiA9IGZpbHRlcmVkX2RmW2ZpbHRlcmVkX2RmWyJzdGF0ZSJdID09IHNlbGVjdGVkX3N0YXRlXQppZiBzZWxlY3RlZF9ub3RlX2NhdCAhPSAiQWxsIjoKICAgIGZpbHRlcmVkX2RmID0gZmlsdGVyZWRfZGZbZmlsdGVyZWRfZGZbIm5vdGVfY2F0ZWdvcnkiXSA9PSBzZWxlY3RlZF9ub3RlX2NhdF0KCiMgQXBwbHkgYW1vdW50IHJhbmdlIGZpbHRlcgpmaWx0ZXJlZF9kZiA9IGZpbHRlcmVkX2RmWwogICAgKGZpbHRlcmVkX2RmWyJwdXJjaGFzZV9hbW91bnQiXSA-PSBhbW91bnRfcmFuZ2VbMF0pCiAgICAmIChmaWx0ZXJlZF9kZlsicHVyY2hhc2VfYW1vdW50Il0gPD0gYW1vdW50X3JhbmdlWzFdKQpdCgojIFNob3cgZmlsdGVyZWQgcmVzdWx0cwpzdC53cml0ZShmIlNob3dpbmcge2xlbihmaWx0ZXJlZF9kZil9IG91dCBvZiB7bGVuKGRmKX0gcmVjb3JkcyIpCgojIERpc3BsYXkgZmlsdGVyZWQgZGF0YQpzdC5kYXRhZnJhbWUoZmlsdGVyZWRfZGYsIHVzZV9jb250YWluZXJfd2lkdGg9VHJ1ZSkKCiMgU2hvdyBzdW1tYXJ5IG1ldHJpY3MgZm9yIGZpbHRlcmVkIGRhdGEKaWYgbGVuKGZpbHRlcmVkX2RmKSA+IDA6CiAgICBzdC5zdWJoZWFkZXIoIkZpbHRlcmVkIERhdGEgU3VtbWFyeSIpCiAgICBzdW1tYXJ5X2NvbDEsIHN1bW1hcnlfY29sMiwgc3VtbWFyeV9jb2wzLCBzdW1tYXJ5X2NvbDQgPSBzdC5jb2x1bW5zKDQpCgogICAgd2l0aCBzdW1tYXJ5X2NvbDE6CiAgICAgICAgc3QubWV0cmljKCJGaWx0ZXJlZCBSZWNvcmRzIiwgbGVuKGZpbHRlcmVkX2RmKSkKICAgIHdpdGggc3VtbWFyeV9jb2wyOgogICAgICAgIGZpbHRlcmVkX3JldmVudWUgPSBmaWx0ZXJlZF9kZlsicHVyY2hhc2VfYW1vdW50Il0uc3VtKCkKICAgICAgICBpZiBmaWx0ZXJlZF9yZXZlbnVlID49IDFfMDAwXzAwMDoKICAgICAgICAgICAgcmV2ZW51ZV9kaXNwbGF5ID0gZiIke2ZpbHRlcmVkX3JldmVudWUgLyAxXzAwMF8wMDA6LjFmfU0iCiAgICAgICAgZWxpZiBmaWx0ZXJlZF9yZXZlbnVlID49IDFfMDAwOgogICAgICAgICAgICByZXZlbnVlX2Rpc3BsYXkgPSBmIiR7ZmlsdGVyZWRfcmV2ZW51ZSAvIDFfMDAwOi4wZn1LIgogICAgICAgIGVsc2U6CiAgICAgICAgICAgIHJldmVudWVfZGlzcGxheSA9IGYiJHtmaWx0ZXJlZF9yZXZlbnVlOiwuMGZ9IgogICAgICAgIHN0Lm1ldHJpYygiVG90YWwgUmV2ZW51ZSIsIHJldmVudWVfZGlzcGxheSkKICAgIHdpdGggc3VtbWFyeV9jb2wzOgogICAgICAgIGF2Z19hbW91bnQgPSBmaWx0ZXJlZF9kZlsicHVyY2hhc2VfYW1vdW50Il0ubWVhbigpCiAgICAgICAgc3QubWV0cmljKCJBdmVyYWdlIEFtb3VudCIsIGYiJHthdmdfYW1vdW50OiwuMGZ9IikKICAgIHdpdGggc3VtbWFyeV9jb2w0OgogICAgICAgIGlmIGxlbihmaWx0ZXJlZF9kZikgPiAwOgogICAgICAgICAgICBwb3NpdGl2ZV9jb3VudCA9IGxlbihmaWx0ZXJlZF9kZltmaWx0ZXJlZF9kZlsic2VudGltZW50Il0gPT0gIlBPU0lUSVZFIl0pCiAgICAgICAgICAgIHBvc2l0aXZlX3JhdGUgPSBwb3NpdGl2ZV9jb3VudCAvIGxlbihmaWx0ZXJlZF9kZikgKiAxMDAKICAgICAgICAgICAgc3QubWV0cmljKCJQb3NpdGl2ZSBTZW50aW1lbnQiLCBmIntwb3NpdGl2ZV9yYXRlOi4xZn0lIikKICAgICAgICBlbHNlOgogICAgICAgICAgICBzdC5tZXRyaWMoIlBvc2l0aXZlIFNlbnRpbWVudCIsICIwJSIpChLJKAoHbWFpbi5weRK9KAq6KGltcG9ydCBhcmdwYXJzZQppbXBvcnQgbG9nZ2luZwppbXBvcnQgcGFuZGFzIGFzIHBkCmZyb20gdHJhbnNmb3JtZXJzX2pzX3B5IGltcG9ydCBwaXBlbGluZQppbXBvcnQgcmUKCmxvZ2dlciA9IGxvZ2dpbmcuZ2V0TG9nZ2VyKF9fbmFtZV9fKQoKCmRlZiBwcm9jZXNzX2RhdGEoZGYpOgogICAgIyAxLiBDYWxjdWxhdGUgc2FsZXMgbWV0cmljcwogICAgZGZbInJldmVudWVfY2F0ZWdvcnkiXSA9IGRmWyJwdXJjaGFzZV9hbW91bnQiXS5hcHBseSgKICAgICAgICBsYW1iZGEgeDogIkhpZ2giIGlmIHggPiA1MDAwMCBlbHNlICJNZWRpdW0iIGlmIHggPiAxMDAwMCBlbHNlICJMb3ciCiAgICApCgogICAgIyAyLiBTdGFuZGFyZGl6ZSBwYXltZW50IG1ldGhvZHMKICAgIHBheW1lbnRfbWFwcGluZyA9IHsKICAgICAgICAiQ3JlZGl0IENhcmQiOiAiQ2FyZCIsCiAgICAgICAgIkJhbmsgVHJhbnNmZXIiOiAiVHJhbnNmZXIiLAogICAgICAgICJXaXJlIFRyYW5zZmVyIjogIlRyYW5zZmVyIiwKICAgICAgICAiUGF5UGFsIjogIkRpZ2l0YWwiLAogICAgfQogICAgZGZbInBheW1lbnRfdHlwZSJdID0gZGZbInBheW1lbnRfbWV0aG9kIl0ubWFwKHBheW1lbnRfbWFwcGluZykKCiAgICAjIDMuIEV4dHJhY3Qgc3RhdGUgZnJvbSBhZGRyZXNzCiAgICBkZlsic3RhdGUiXSA9IGRmWyJkZWxpdmVyeV9hZGRyZXNzX2FyZWEiXS5zdHIuZXh0cmFjdChyIihbQS1aXXsyfSkkIikKCiAgICAjIDQuIENhdGVnb3JpemUgY3VzdG9tZXIgc2VnbWVudHMKICAgIGRmWyJzZWdtZW50X3ByaW9yaXR5Il0gPSBkZlsiY3VzdG9tZXJfc2VnbWVudCJdLm1hcCgKICAgICAgICB7IkVudGVycHJpc2UiOiAxLCAiU01CIjogMiwgIkluZGl2aWR1YWwiOiAzfQogICAgKQoKICAgIHJldHVybiBkZgoKCmFzeW5jIGRlZiBwcm9jZXNzX3Vuc3RydWN0dXJlZF9kYXRhX3dpdGhfbGxtKGRmKToKICAgICIiIlByb2Nlc3MgdGV4dCBkYXRhIHVzaW5nIEFJL0xMTSIiIgoKICAgICMgSW5pdGlhbGl6ZSBzZW50aW1lbnQgYW5hbHlzaXMgcGlwZWxpbmUKICAgIHNlbnRpbWVudF9hbmFseXplciA9IGF3YWl0IHBpcGVsaW5lKAogICAgICAgICJzZW50aW1lbnQtYW5hbHlzaXMiLAogICAgICAgICMgIlhlbm92YS9kaXN0aWxiZXJ0LWJhc2UtdW5jYXNlZC1maW5ldHVuZWQtc3N0LTItZW5nbGlzaCIsCiAgICApCgogICAgIyBJbml0aWFsaXplIHRleHQgY2xhc3NpZmljYXRpb24gcGlwZWxpbmUKICAgIGNsYXNzaWZpZXIgPSBhd2FpdCBwaXBlbGluZSgKICAgICAgICAiemVyby1zaG90LWNsYXNzaWZpY2F0aW9uIiwKICAgICAgICAjICJYZW5vdmEvYmFydC1sYXJnZS1tbmxpIgogICAgKQoKICAgICMgMS4gU2VudGltZW50IGFuYWx5c2lzIG9uIGN1c3RvbWVyIGZlZWRiYWNrCiAgICBkZlsic2VudGltZW50Il0gPSBwZC5TZXJpZXMoZHR5cGU9InN0cmluZyIpCiAgICBkZlsic2VudGltZW50X3Njb3JlIl0gPSBwZC5TZXJpZXMoZHR5cGU9ImZsb2F0IikKICAgIGZvciBpZHgsIHJvdyBpbiBkZi5pdGVycm93cygpOgogICAgICAgIHRleHQgPSByb3dbImN1c3RvbWVyX2ZlZWRiYWNrIl0KICAgICAgICByZXN1bHQgPSAoYXdhaXQgc2VudGltZW50X2FuYWx5emVyKHRleHQpKVswXQogICAgICAgIGRmLmxvY1tpZHgsICJzZW50aW1lbnQiXSA9IHJlc3VsdFsibGFiZWwiXQogICAgICAgIGRmLmxvY1tpZHgsICJzZW50aW1lbnRfc2NvcmUiXSA9IHJlc3VsdFsic2NvcmUiXQoKICAgICMgMi4gQ2xhc3NpZnkgc2FsZXMgbm90ZXMgaW50byBjYXRlZ29yaWVzCiAgICBub3RlX2NhdGVnb3JpZXMgPSBbCiAgICAgICAgInRlY2huaWNhbF9pc3N1ZSIsCiAgICAgICAgInByaWNpbmdfbmVnb3RpYXRpb24iLAogICAgICAgICJjdXN0b21lcl9yZWxhdGlvbnNoaXAiLAogICAgICAgICJwcm9kdWN0X2ZlZWRiYWNrIiwKICAgIF0KCiAgICBkZlsibm90ZV9jYXRlZ29yeSJdID0gcGQuU2VyaWVzKGR0eXBlPSJzdHJpbmciKQogICAgZGZbIm5vdGVfY29uZmlkZW5jZSJdID0gcGQuU2VyaWVzKGR0eXBlPSJmbG9hdCIpCiAgICBmb3IgaWR4LCByb3cgaW4gZGYuaXRlcnJvd3MoKToKICAgICAgICB0ZXh0ID0gcm93WyJzYWxlc19ub3RlIl0KICAgICAgICByZXN1bHQgPSBhd2FpdCBjbGFzc2lmaWVyKHRleHQsIG5vdGVfY2F0ZWdvcmllcykKICAgICAgICBkZi5sb2NbaWR4LCAibm90ZV9jYXRlZ29yeSJdID0gcmVzdWx0WyJsYWJlbHMiXVswXQogICAgICAgIGRmLmxvY1tpZHgsICJub3RlX2NvbmZpZGVuY2UiXSA9IHJlc3VsdFsic2NvcmVzIl1bMF0KCiAgICAjIDMuIEV4dHJhY3Qga2V5IGlzc3VlcyBmcm9tIGZlZWRiYWNrCiAgICBkZWYgZXh0cmFjdF9pc3N1ZXModGV4dCk6CiAgICAgICAgaXNzdWVfa2V5d29yZHMgPSBbCiAgICAgICAgICAgICJkZWxheSIsCiAgICAgICAgICAgICJwcm9ibGVtIiwKICAgICAgICAgICAgImRpZmZpY3VsdCIsCiAgICAgICAgICAgICJpbXByb3ZlIiwKICAgICAgICAgICAgImlzc3VlIiwKICAgICAgICAgICAgInNsb3ciLAogICAgICAgICAgICAiY29tcGxpY2F0ZWQiLAogICAgICAgIF0KICAgICAgICBpc3N1ZXMgPSBbd29yZCBmb3Igd29yZCBpbiBpc3N1ZV9rZXl3b3JkcyBpZiB3b3JkIGluIHRleHQubG93ZXIoKV0KICAgICAgICByZXR1cm4gIiwgIi5qb2luKGlzc3VlcykgaWYgaXNzdWVzIGVsc2UgIm5vbmUiCgogICAgZGZbImlkZW50aWZpZWRfaXNzdWVzIl0gPSBkZlsiY3VzdG9tZXJfZmVlZGJhY2siXS5hcHBseShleHRyYWN0X2lzc3VlcykKCiAgICByZXR1cm4gZGYKCgpkZWYgYW5vbnltaXplX2RhdGEoZGYpOgogICAgIiIiQXBwbHkgcHJpdmFjeSBwcm90ZWN0aW9uIG1lYXN1cmVzIiIiCgogICAgIyAxLiBNYXNrIHNwZWNpZmljIGxvY2F0aW9ucyAoa2VlcCBvbmx5IHN0YXRlKQogICAgZGZbImRlbGl2ZXJ5X2FyZWFfbWFza2VkIl0gPSBkZlsiZGVsaXZlcnlfYWRkcmVzc19hcmVhIl0uc3RyLmV4dHJhY3QociIoW0EtWl17Mn0pJCIpCgogICAgIyAyLiBSZW1vdmUgc2Vuc2l0aXZlIGluZm9ybWF0aW9uIGZyb20gbm90ZXMKICAgIGRlZiBjbGVhbl9zZW5zaXRpdmVfaW5mbyh0ZXh0KToKICAgICAgICAjIFJlbW92ZSBzcGVjaWZpYyBjb21wYW55IG5hbWVzLCBudW1iZXJzLCBhbmQgcGVyc29uYWwgZGV0YWlscwogICAgICAgIHRleHQgPSByZS5zdWIociJcYltBLVpdW2Etel0rIFxkK1xiIiwgIltDT01QQU5ZX0lEXSIsIHRleHQpCiAgICAgICAgdGV4dCA9IHJlLnN1YihyIlwkXGQrIiwgIltBTU9VTlRdIiwgdGV4dCkKICAgICAgICB0ZXh0ID0gcmUuc3ViKHIiXGR7Mix9JSIsICJbUEVSQ0VOVEFHRV0iLCB0ZXh0KQogICAgICAgIHJldHVybiB0ZXh0CgogICAgZGZbInNhbGVzX25vdGVfY2xlYW5lZCJdID0gZGZbInNhbGVzX25vdGUiXS5hcHBseShjbGVhbl9zZW5zaXRpdmVfaW5mbykKCiAgICAjIDMuIEdlbmVyYWxpemUgY3VzdG9tZXIgZmVlZGJhY2sKICAgIGRlZiBnZW5lcmFsaXplX2ZlZWRiYWNrKHRleHQpOgogICAgICAgICMgUmVtb3ZlIHNwZWNpZmljIHByb2R1Y3QgbmFtZXMgYW5kIHJlcGxhY2Ugd2l0aCBnZW5lcmljIHRlcm1zCiAgICAgICAgdGV4dCA9IHJlLnN1YihyIlxiW0EtWl1bYS16XStccysodGVhbXxzZXJ2aWNlfHN1cHBvcnQpXGIiLCAiW0RFUEFSVE1FTlRdIiwgdGV4dCkKICAgICAgICByZXR1cm4gdGV4dAoKICAgIGRmWyJmZWVkYmFja19nZW5lcmFsaXplZCJdID0gZGZbImN1c3RvbWVyX2ZlZWRiYWNrIl0uYXBwbHkoZ2VuZXJhbGl6ZV9mZWVkYmFjaykKCiAgICByZXR1cm4gZGYKCgphc3luYyBkZWYgcHJvY2Vzc19zYWxlc19kYXRhKGRmKToKICAgIGxvZ2dlci5pbmZvKCJQcm9jZXNzaW5nIHdpdGggdHJhZGl0aW9uYWwgbWV0aG9kcy4uLiIpCiAgICBkZiA9IHByb2Nlc3NfZGF0YShkZikKCiAgICBsb2dnZXIuaW5mbygiUHJvY2Vzc2luZyB3aXRoIEFJL0xMTS4uLiIpCiAgICBkZiA9IGF3YWl0IHByb2Nlc3NfdW5zdHJ1Y3R1cmVkX2RhdGFfd2l0aF9sbG0oZGYpCgogICAgbG9nZ2VyLmluZm8oIkFwcGx5aW5nIHByaXZhY3kgcHJvdGVjdGlvbi4uLiIpCiAgICBkZiA9IGFub255bWl6ZV9kYXRhKGRmKQoKICAgIHJldHVybiBkZgoKCmRlZiBjbGkoKToKICAgIHBhcnNlciA9IGFyZ3BhcnNlLkFyZ3VtZW50UGFyc2VyKGRlc2NyaXB0aW9uPSJQcm9jZXNzIHNhbGVzIGRhdGEiKQogICAgcGFyc2VyLmFkZF9hcmd1bWVudCgKICAgICAgICAiLS1pbnB1dCIsIHR5cGU9c3RyLCBkZWZhdWx0PSJzYWxlc19kYXRhLmNzdiIsIGhlbHA9IklucHV0IENTViBmaWxlIgogICAgKQogICAgcGFyc2VyLmFkZF9hcmd1bWVudCgKICAgICAgICAiLS1vdXRwdXQiLCB0eXBlPXN0ciwgZGVmYXVsdD0icHJvY2Vzc2VkX3NhbGVzX2RhdGEuY3N2IiwgaGVscD0iT3V0cHV0IENTViBmaWxlIgogICAgKQogICAgYXJncyA9IHBhcnNlci5wYXJzZV9hcmdzKCkKCiAgICBsb2dnZXIuaW5mbyhmIkxvYWRpbmcgc2FsZXMgZGF0YSBmcm9tIHthcmdzLmlucHV0fSIpCiAgICBkZiA9IHBkLnJlYWRfY3N2KGFyZ3MuaW5wdXQpCgogICAgZGYgPSBwcm9jZXNzX3NhbGVzX2RhdGEoZGYpCgogICAgZGYudG9fY3N2KCJwcm9jZXNzZWRfc2FsZXNfZGF0YS5jc3YiLCBpbmRleD1GYWxzZSkKCiAgICBwcmludCgiXG49PT0gUFJPQ0VTU0lORyBTVU1NQVJZID09PSIpCiAgICBwcmludChmIlRvdGFsIG9yZGVycyBwcm9jZXNzZWQ6IHtsZW4oZGYpfSIpCiAgICBwcmludChmIlJldmVudWUgY2F0ZWdvcmllczoge2RmWydyZXZlbnVlX2NhdGVnb3J5J10udmFsdWVfY291bnRzKCkudG9fZGljdCgpfSIpCiAgICBwcmludChmIlNlbnRpbWVudCBkaXN0cmlidXRpb246IHtkZlsnc2VudGltZW50J10udmFsdWVfY291bnRzKCkudG9fZGljdCgpfSIpCiAgICBwcmludChmIk5vdGUgY2F0ZWdvcmllczoge2RmWydub3RlX2NhdGVnb3J5J10udmFsdWVfY291bnRzKCkudG9fZGljdCgpfSIpCgogICAgcHJpbnQoIlxuPT09IFNBTVBMRSBSRVNVTFRTID09PSIpCiAgICBzYW1wbGVfY29scyA9IFsKICAgICAgICAib3JkZXJfaWQiLAogICAgICAgICJyZXZlbnVlX2NhdGVnb3J5IiwKICAgICAgICAic2VudGltZW50IiwKICAgICAgICAibm90ZV9jYXRlZ29yeSIsCiAgICAgICAgImlkZW50aWZpZWRfaXNzdWVzIiwKICAgIF0KICAgIHByaW50KGRmW3NhbXBsZV9jb2xzXS5oZWFkKCkpCgoKaWYgX19uYW1lX18gPT0gIl9fbWFpbl9fIjoKICAgIGNsaSgpChoSdHJhbnNmb3JtZXJzLWpzLXB5" target="_blank" ref="noreferrer noopener">

<div flex items-center text-base>
<div class="i-majesticons:open"></div>
Open in Stlite Sharing
</div>

</a>
</div>

---

<SlidevVideo autoplay controls>
  <source src="/stlite_llm_static.mp4" type="video/mp4" />
</SlidevVideo>

---

# Typical use cases for Python serverless web apps

<div text-3xl>

<v-clicks>

* Data processing
* Data analysis
* Visualization
* Machine learning

</v-clicks>

<v-clicks>

...where

* Python has a strong ecosystem
* Data privacy/transparency/control/cost is important

</v-clicks>

</div>

---

# Wrap-up

<div flex="~ col" gap-3>

<Modal v-click="1">
  <template #title>
    Python script <span text-xl>that solves your problem</span>
  </template>

- Launched from the terminal

</Modal>

<Modal v-click="2">
  <template #title>
    Web app <span text-xl>that shares your solution</span>
  </template>

- Pure-Python Web UI frameworks, e.g. Streamlit
- Easy to share, use, and understand

</Modal>

<Modal v-click="3">
  <template #title>
    Serverless web app <span text-xl>that runs in the browser</span>
  </template>

- Serverless versions of the frameworks, e.g. Stlite
- Data privacy / Easy server management / Cost control / ...

</Modal>

</div>

---

<h1 text-4xl>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div absolute top-40 right-40>
<img src="https://avatars.githubusercontent.com/u/3135397?v=4" alt="whitphx" w="130px">
</div>

<div my-10 w-min flex="~ gap-1" items-center justify-center>
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

- [Stlite: `whitphx/stlite`](https://github.com/whitphx/stlite)
- [Transformers.js.py: `whitphx/transformers.js.py`](https://github.com/huggingface/transformers.js.py)
