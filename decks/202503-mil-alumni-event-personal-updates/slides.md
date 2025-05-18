---
theme: ../../themes/alpha
title: "Personal updates 2024-2025"
class: text-center
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
Personal updates
</h1>

<h2>
2024-2025
</h2>

MIL Alumni Event, 2025-03-09

---

# Yuichiro Tachibana

@whitphx

<div mt-8 v-click>
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

---

# OSS activities

<div h-full w-full flex items-center justify-center>
  <img src="/github-profile.png" h-full w-full object-cover object-top />
</div>

---

# My GitHub Star History

<div h-full w-full flex items-center justify-center>
  <img src="/star-history-202528.png" max-h-full max-w-full />
</div>

---

# Awesome Emacs Keymap

機械Bの呪い

<a href="https://marketplace.visualstudio.com/items?itemName=tuttieee.emacs-mcx" target="_blank" rel="noopener noreferrer">
  <img src="/awesome-emacs-keymap-page.png" h-full w-full object-cover object-top />
</a>

---

# Streamlit WebRTC

Create real-time video/audio web apps only with Python

<div grid="~ cols-2 gap-4">

<div>

```python
import streamlit as st
from streamlit_webrtc import webrtc_streamer
import av
import cv2

st.title("My first Streamlit app")
st.write("Hello, world")


def callback(frame):
    img = frame.to_ndarray(format="bgr24")

    img = cv2.cvtColor(cv2.Canny(img, 100, 200), cv2.COLOR_GRAY2BGR)

    return av.VideoFrame.from_ndarray(img, format="bgr24")


webrtc_streamer(key="example", video_frame_callback=callback)
```
</div>

<div>

<SlidevVideo autoplay muted controls loop>
  <source src="/streamlit-webrtc-tutorial-edge-9312.mov" />
</SlidevVideo>

</div>

</div>

---

# Stlite, in-browser Streamlit


<div grid="~ cols-2 gap-4">

<div>

```html
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
      href="https://cdn.jsdelivr.net/npm/@stlite/browser@0.76.0/build/style.css"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import { mount } from "https://cdn.jsdelivr.net/npm/@stlite/browser@0.76.0/build/stlite.js";
      mount(
        `
import streamlit as st

name = st.text_input('Your name')
st.write("Hello,", name or "world")
`,
        document.getElementById("root"),
      );
    </script>
  </body>
</html>
```

</div>

<div>

<img src="/stlite-screenshot.png" object-contain max-h-full />

</div>

</div>

---

# Gradio-Lite

<iframe src="https://www.gradio.app/guides/gradio-lite" frameborder="0" w-full h-full></iframe>

---

# Transformers.js.py

<div flex justify-center>

<img src="/transformers-js-py-repo.png" object-contain max-h-full />

</div>

---

<SlidevAnipres id="timeline" excalidraw-like-font />

---

# Duolingoはじめました

<div grid="~ cols-2 gap-4" max-h-full>

<img src="/Screenshot_20250309-135018.png" object-contain max-h-full />

<img src="/Screenshot_20250309-143133.png" object-contain max-h-full />

</div>
