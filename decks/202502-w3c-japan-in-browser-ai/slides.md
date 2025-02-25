---
theme: seriph
title: ""
class: text-center
drawings:
  persist: false
mdc: true
defaults:
  transition: slide-left
addons:
  - anipres
transition: fade-out
---

<h1>
In-browser AI and<br />
its standardization
</h1>

---

<div class="slide">

# Yuichiro Tachibana

@whitphx

<img src="/public/profile.jpg" w-30 rounded-full absolute top-10 right-60 />

<div mt-20 v-click>
Software Developer / Indie Dev / <span v-mark.underline.green="1">OSS Enthusiast</span>
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

# Self-introduction: story behind today's talk

<v-clicks>

* I am a developer of <span v-mark.underline.yellow="1">Gradio-Lite</span> and a bridging layer of <span v-mark.underline.red="1">Transformers.js</span> for Gradio-Lite at Hugging Face.
* I had a presentation at [FEDay 2024](https://fequan.com/2024/) about Gradio-Lite and Transformers.js.
  * [使用 Gradio 和 Transformers 构建 Web AI 应用 - Yuichiro](https://www.bilibili.com/video/BV1tUcBemE2r/)
* I met some W3C members at the conference and they introduced me to the <span v-mark.underline.green="3">Web Machine Learning WG</span> at W3C.

</v-clicks>

---

# Gradio-Lite and Transformers.js

👉 https://slides.com/whitphx/feday2024-gradio-lite-transformers-js-py

<iframe src="https://slides.com/whitphx/feday2024-gradio-lite-transformers-js-py/embed?style=hidden" width="576" height="420" title="In-browser AI apps with Gradio and Transformers" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen m-auto></iframe>

---

# In-browser AI

<span text-4xl>Execute AI models in the browser</span>

---

# Web Machine Learning Community/WG at W3C

<div>

👉 https://webmachinelearning.github.io/community/

👉 https://www.w3.org/community/webmachinelearning/

👉 https://www.w3.org/groups/wg/webmachinelearning/

</div>

---

# Incubated Task-based API

👉 https://webmachinelearning.github.io/incubations/

---

<SlidevAnipres id="tech-layers" />
