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

## Benefits of In-Browser AI

<v-clicks>

- **Low latency**: no server round-trips
- **Privacy-preserving**: keep data on device
- **Offline-capable**: no internet? no problem
- **Scalable**: reduce backend costs

</v-clicks>

---

## Today’s Tools for In-Browser AI

### Frameworks/Libraries

- **TensorFlow.js**: General-purpose, supports training and inference
- **ONNX Runtime Web**: Runs ONNX models via WebAssembly/WebGPU
- **Transformers.js**: Hugging Face model inference in JavaScript

### Model optimization
- Quantization, Pruning, Knowledge Distillation

### Model types
- MobileNet, DistilBERT, TinyGPT, etc.

---

## Example: Transformers.js

- Designed for browser-based Hugging Face models
- No ONNX or Python required
- Backends: WebAssembly, WebGPU
- NLP (DistilBERT, TinyBERT), Vision (CLIP, MobileViT)
- Fully client-side — works even offline

---

## Challenges

- Performance: browsers not optimized for ML
- Limited access to GPU/NPU
- Fragmented low-level implementations across libraries

---

# Web Machine Learning Community/WG at W3C

<div>

👉 https://webmachinelearning.github.io/community/

👉 https://www.w3.org/community/webmachinelearning/

👉 https://www.w3.org/groups/wg/webmachinelearning/

</div>

---

## Enter Web Neural Network API (WebNN)
- A new W3C standard in development
- **Unified low-level API** for ML inference in browsers
- Abstracts native ML backends:
  - Android NNAPI
  - iOS Core ML
  - Windows DirectML
  - Linux OpenVINO

---

## WebNN Architecture (Simplified)
```
[JS Framework (e.g. ONNX Runtime)]
        ↓
  WebNN API
        ↓
[Native Backend: NNAPI / CoreML / DirectML]
```
- JS frameworks call WebNN for optimized execution

---

## What WebNN Enables
- Hardware acceleration
- Better performance than WASM/WebGL
- Shared backend across frameworks
- Ecosystem unification

---

# Incubated Task-based API

👉 https://webmachinelearning.github.io/incubations/

---

<SlidevAnipres id="tech-layers" />

---

# Incubated Task-based API

👉 https://webmachinelearning.github.io/incubations/

---

<SlidevAnipres id="tech-layers" />

---

# Incubated Task-based API vs Transformers.js

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
