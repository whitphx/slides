---
theme: ../../themes/triangle
title: "How OSS becomes a give-and-take activity"
drawings:
  persist: false
mdc: true
themeConfig:
  primary: '#36709E'
defaults:
  transition: slide-left
transition: fade-out
addons:
  - slidev-addon-anipres
---

<h1>
How OSS becomes<br />
a give-and-take activity
</h1>

---

<h1>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div class="portfolio" w-130 mt-6 v-click="1">

- <span class="heading">Created</span>: <span class="item"><img src="/portfolio/awesome_emacs_keymap.svg">Awesome Emacs Keymap</span>, <span class="item"><img src="/portfolio/stlite.png">Stlite: In-browser Streamlit</span>, <span class="item">🎈 Streamlit-WebRTC</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio-Lite: Serverless Gradio</span>, <span class="item">🤗 Transformers.js.py</span>
- <span class="heading">Contributed to</span>: <span class="item"><img src="/portfolio/streamlit-mark-color.svg" style="height: 0.8em;">Streamlit</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio</span>
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🇪🇺Euro, 🌏APAC, 🇹🇼TW, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT, 🗾miniShizuoka</span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item">🐍Tokyo Python Meetup</span>, <span class="item">▶️Streamlit Live</span>, <span class="item">🐍SciPyData2026</span>

<div absolute top-48 right-0>
<a href="https://github.com/whitphx" target="_blank" rel="noopener noreferrer">
<img src="/github_whitphx.png" alt="GitHub @whitphx" w="400px">
</a>
</div>

</div>

<div absolute left-12 bottom-10 w-min flex="~ gap-1" items-center justify-center v-click="2">
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

<style>
  .portfolio {
    font-size: 1.0rem;
  }
  .heading {

  }
  .item {
    height: 1.8rem;
    line-height: 1.0rem;
    font-weight: 300;
    display: inline-flex;
    align-items: center;

    img {
      height: 1.0em;
      margin-right: 0.25em;
    }
  }
</style>

---

# SciPyData 2026

https://scipydata.connpass.com/event/364718/

<div grid="~ cols-2" gap-4>

<img src="https://media.connpass.com/thumbs/56/bd/56bda31cf3806b420ced41f7f924f610.png" alt="SciPyData 2026 logo" mt-8>

<Tweet id="2014941918049009799" />

</div>

---

# Stlite: In-browser Streamlit

https://stlite.net/

<img src="/stlite.svg" alt="Stlite logo" h-50 mx-auto my-8>

---

# Used in production by many companies

- [Streamlit Playground](https://streamlit.io/playground)
- <span v-mark.highlight.orange>[Cognite](https://www.cognite.com/en)</span>
    - https://docs.cognite.com/cdf/streamlit

---

# Cognite contributed back to Stlite

<v-clicks>

- [Cognite](https://www.cognite.com/en) uses [`whitphx/stlite`](https://github.com/whitphx/stlite) on their platform.
- They customized Stlite to fit their needs.
- They contributed back to Stlite.

</v-clicks>

<div grid="~ cols-2" gap-4 v-click>

[<img src="/github_discussion_stlite_cognite.png" w-full>](https://github.com/whitphx/stlite/discussions/1328)

[<img src="/github_stlite_cognite_pr.png" w-full>](https://github.com/whitphx/stlite/pull/1338)

</div>

---

# OSS incubates collaboration


1. <v-click>You share something as OSS.</v-click>
2. <v-click>Someone uses it for their purpose.</v-click>
3. <v-click>They may contribute back.</v-click>

<v-clicks at="10">

* Using OSS is **beneficial for users**.
* Contributing back is **beneficial for users**.
  * Able to solve their problems faster.
  * Maintaining the fork is costly.
* Using **mature** OSS is **more beneficial for users**.
* Your OSS grows.

</v-clicks>

<div absolute right-0 top-20 w-100 h-80>

<SlidevAnipres id="oss-benefit-cycle" v-click="1" at="2" />

</div>

---

# Sharing is (often) better

<v-clicks>

- OSS developed, maintained, tested, and used by many people \
  **is better than** code only owned by you.
- General procedures don't have to be the core of your business... in many cases.
- If you don't make it open, someone will make something similar open in the near future.

</v-clicks>

<div text-6xl mt-8 v-click>
Share your code!
</div>

---

# Programming is over?

<div mt-10>

[<img src="/ryan_dahl_tweet.png" w="80%" mx-auto>](https://x.com/rough__sea/status/2013280952370573666)

</div>

---
layout: statement
---

## If AI can generate code/docs/tests, no need to share them?

---

# OSS libraries, frameworks, tools, apps, etc are still valuable.

<v-clicks>

* 🛠️ Support from maintainers and community
* 🤝 Trusted by community
* 🌐 Ecosystem and integrations quality
* 🧪 "Battle-tested" by many users; bugs, edge-cases, ...

</v-clicks>

<div mt-8 v-click>
However, the way to contribute may change.
</div>
