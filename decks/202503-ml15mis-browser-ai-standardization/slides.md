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

# In-browser AI

<div>

<span text-4xl>Execute AI models in the browser</span>

</div>

---

# Benefits of In-Browser AI

<v-clicks>

- **Low latency**: no server round-trips
- **Privacy-preserving**: keep data on device
- **Offline-capable**: no internet? no problem
- **Scalable**: reduce backend costs

</v-clicks>

---

# In-Browser AI tools

## Runtime

- [**TensorFlow.js**](https://www.tensorflow.org/js): General-purpose, supports training and inference
- [**ONNX Runtime Web**](https://onnxruntime.ai/docs/tutorials/web/): Runs ONNX models via WebAssembly/WebGPU

## Frameworks/Libraries

- [**Transformers.js**](https://huggingface.co/docs/transformers.js/en/index): Hugging Face model inference in JavaScript
- [**MLC LLM**](https://llm.mlc.ai/): Runs LLMs in various platforms including browser


<aside absolute bottom-10>
We don't talk about model optimizations such as quantization, pruning, knowledge distillation in this talk.
</aside>

---

# ONNX Runtime Web

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

<div>

👉 https://webmachinelearning.github.io/community/

👉 https://www.w3.org/community/webmachinelearning/

👉 https://www.w3.org/groups/wg/webmachinelearning/

</div>

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

# Incubated Task-based API vs Transformers.js vs Gemini Nano

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

# Gemini Nano in Chrome

<div>

#### Gemini Nano in Chrome

```js
const translator = await self.ai.translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'fr',
});
await translator.translate('Where is the next bus stop, please?');
```

[They are working on standardizing the API](https://developer.chrome.com/docs/ai/translator-api#standardization)

</div>
