---
theme: ../../themes/alpha
title: In-browser AI and its standardization
drawings:
  persist: false
mdc: true
defaults:
  transition: slide-left
transition: fade-out
addons:
  - anipres
---

<h1>
In-browser AI and<br />
its standardization
</h1>

99th Machine Learning 15minutes! Hybrid, 2025-03-29

---

<div class="slide">

# Yuichiro Tachibana

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
  <div i-ri-user-3-line op50 ma text-xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

</div>

<style>
.slide {
  font-size: 1.8em;
}
</style>

---

# In-browser AI

<div flex="~ row" max-h-120>

<div w="50%">

<div p-2>

<img src="https://lh3.googleusercontent.com/8lXXHoS-ibHI8hXPnU8mbqnckhXY2Gj8aHv4mE9HOxQWZzKQsGETiSao2BGsgvEBgVAFWfzYcalKA2ZHE8WS14Sw1JjwJw" />

<sub>
https://www.tensorflow.org/js/demos
</sub>

</div>

<div p-2>

<SlidevVideo src="https://media.slid.es/videos/2387029/S1X1nuCK/cleanshot_2024-12-03_at_20.mp4" autoplay controls />

</div>

</div>

<div w="50%">

<div p-2>
<SlidevVideo src="https://cdn-uploads.huggingface.co/production/uploads/61b253b7ac5ecaae3d1efe0c/LhlrHN9bLO2zV_MTgBA_5.mp4" autoplay controls />

<sub>
https://huggingface.co/blog/Xenova/run-gemini-nano-in-your-browser
</sub>
</div>

</div>

<!-- <iframe src="https://microsoft.github.io/onnxruntime-web-demo/#/yolo" w="100%" /> -->

</div>

---

# Benefits of In-Browser AI

<Transform scale="1.8">

<v-clicks>

- **Low latency**: no server round-trips
- **Privacy-preserving**: keep data on device
- **Offline-capable**: no internet? no problem
- **Scalable**: reduce backend costs

</v-clicks>

</Transform>

---

# In-Browser AI tools

<Transform scale="1.2">

## Runtime

- [**TensorFlow.js**](https://www.tensorflow.org/js)
- [**ONNX Runtime Web**](https://onnxruntime.ai/docs/tutorials/web/)
- [WebDNN](https://mil-tokyo.github.io/webdnn/ja/)

## Frameworks/Libraries

- [**Transformers.js**](https://huggingface.co/docs/transformers.js/en/index)
- [**MLC LLM**](https://llm.mlc.ai/)

</Transform>

<aside absolute bottom-10>
We don't talk about model optimizations such as quantization, pruning, knowledge distillation in this talk.
</aside>

---

# ONNX Runtime Web

> ONNX (Open Neural Network Exchange) is an open standard for computer vision and machine learning models.
> The ONNX standard provides a common format enabling the transfer of models between popular machine learning frameworks. It promotes interoperability between different deep learning frameworks for simple model sharing and deployment.
>
> <sub>https://viso.ai/computer-vision/onnx-explained/</sub>

---

# Transformers.js

https://huggingface.co/docs/transformers.js/en/index

- 🤗
- [Supported tasks/models](https://huggingface.co/docs/transformers.js/en/index#supported-tasksmodels)
  - 30+ tasks
  - 100+ models
- Backend: ONNX Runtime Web, WebGPU (under development)
- Examples: https://github.com/huggingface/transformers.js-examples

### Example: Text-to-Speech

<sub>
https://huggingface.co/spaces/Xenova/text-to-speech-client
</sub>

```js
const synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', { quantized: false });
const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';
const out = await synthesizer('Hello, my dog is cute', { speaker_embeddings });
```

---

# Example: Transformers.js.py + Gradio-Lite
For Python devs

```html
<html>
    <head>
        <script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css" />
    </head>
    <body>
<gradio-lite>

<gradio-requirements>
transformers_js_py
</gradio-requirements>

<gradio-file name="app.py" entrypoint>
from transformers_js_py import import_transformers_js
import gradio as gr
import numpy as np

transformers_js = await import_transformers_js("3.0.2")
pipeline = transformers_js.pipeline

synthesizer = await pipeline(
    'text-to-speech',
    'Xenova/speecht5_tts',
    { "quantized": False }
)
speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';


async def synthesize(text):
    out = await synthesizer(text, { "speaker_embeddings": speaker_embeddings });
    audio_data_memory_view = out["audio"]
    sampling_rate = out["sampling_rate"]

    audio_data = np.frombuffer(audio_data_memory_view, dtype=np.float32)
    audio_data_16bit = (audio_data * 32767).astype(np.int16)

    return sampling_rate, audio_data_16bit


demo = gr.Interface(synthesize, "textbox", "audio")
demo.launch()
</gradio-file>

</gradio-lite>

    </body>
</html>
```

---

<SlidevVideo src="https://s3.amazonaws.com/media-p.slid.es/videos/2387029/whwjCa59/cleanshot_2024-12-07_at_00.mp4" autoplay controls />

---

# Gemini Nano in Chrome

https://developer.chrome.com/docs/ai

```js
const canCreate = await window.ai.canCreateTextSession();

if (canCreate !== "no") {
  const session = await window.ai.createTextSession();

  const stream = session.promptStreaming("Write me an extra-long poem");
  for await (const chunk of stream) {
    console.log(chunk);
  }
}
```

---

# Example: Gemini Nano + Gradio-Lite

https://huggingface.co/blog/whitphx/in-browser-llm-gemini-nano-gradio-lite

<SlidevVideo src="https://cdn-uploads.huggingface.co/production/uploads/63da49043b8591bd11f52dca/7i_S75sgql42Cc45pnvy5.mp4" autoplay controls />

---

# Web Machine Learning Community/WG at W3C

Initiatives to standardize the in-browser AI APIs.

<div>

👉 https://webmachinelearning.github.io/community/

👉 https://www.w3.org/community/webmachinelearning/

👉 https://www.w3.org/groups/wg/webmachinelearning/

</div>

---

# Web Neural Network API (WebNN)

---

# What WebNN standardizes

<iframe src="https://webmachinelearning.github.io/webnn-status/" w="100%" h-120 />

---

# Incubated Task-based API

https://webmachinelearning.github.io/incubations/

### Example: Translator API

```js
const translator = await Translator.create({
  sourceLanguage: "en",
  targetLanguage: "ja"
});

const text = await translator.translate("Hello, world!");
const readableStreamOfText = await translator.translateStreaming(`
  Four score and seven years ago our fathers brought forth, upon this...
`);
```

---

<SlidevAnipres id="tech-layers" />

---

# WebML Task-based API vs Transformers.js

<div>

### Example: Translation

<div grid="~ cols-2 gap-4">

<div>

#### WebML Task-based API

```js {1-6|*}{lines:true}
const translator = await ai.translator.create({
  sourceLanguage: "en",
  targetLanguage: "ja"
});

const text = await translator.translate("Hello, world!");
const readableStreamOfText = await translator.translateStreaming(`
  Four score and seven years ago our fathers brought forth, upon this...
`);
```

</div>

<div>

#### Transformers.js

```js {*}{lines:true}
const translator = await pipeline('translation', 'Xenova/nllb-200-distilled-600M');
const text = await translator('Hello, world!', {
  src_lang: 'en',
  tgt_lang: 'ja',
});
```

</div>

</div>

</div>

<div v-click mt-4>

### Supported models/tasks

<div grid="~ cols-2 gap-4">

<div>

#### WebML Task-based API

- Translator and Language Detector APIs
- Writing Assistance APIs
- Prompt API

</div>

<div>

#### Transformers.js

👉 [Supported tasks/models](https://huggingface.co/docs/transformers.js/en/index#supported-tasksmodels)

* 30+ tasks
* 100+ models

</div>

</div>

</div>

---

# Existing frameworks/libraries adapting to WebNN

## ONNX Runtime Web

https://onnxruntime.ai/docs/tutorials/web/ep-webnn.html

## Gemini Nano in Chrome

```js
const translator = await self.ai.translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'fr',
});
await translator.translate('Where is the next bus stop, please?');
```

[They are working on standardizing the API](https://developer.chrome.com/docs/ai/translator-api#standardization)

---

# Summary

- There are several frameworks/libraries to develop in-browser AI applications.
- Standardization is ongoing in W3C WebML WG.
  - Join the WG if interested in the standardization process!
    - https://www.w3.org/community/webmachinelearning/2018/10/03/call-for-participation-in-machine-learning-for-the-web-community-group/
    - https://www.w3.org/groups/wg/webmachinelearning/instructions/
