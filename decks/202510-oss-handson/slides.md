---
theme: ../../themes/triangle
title: "You share, you gain: OSS, community, and reward"
drawings:
  persist: false
mdc: true
themeConfig:
  primary: '#36709E'
defaults:
  transition: slide-left
transition: fade-out
addons:
  - anipres
---

<h1>
Open Source 101<br>
<small>
Practice your first<br>OSS contributions
</small>
</h1>

---

<h1>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div class="portfolio" w-130 mt-6 v-click>

- <span class="heading">Created</span>: <span class="item"><img src="/portfolio/awesome_emacs_keymap.svg">Awesome Emacs Keymap</span>, <span class="item"><img src="/portfolio/stlite.png">Stlite: In-browser Streamlit</span>, <span class="item">🎈 Streamlit-WebRTC</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio-Lite: Serverless Gradio</span>, <span class="item">🤗 Transformers.js.py</span>
- <span class="heading">Contributed to</span>: <span class="item"><img src="/portfolio/streamlit-mark-color.svg" style="height: 0.8em;">Streamlit</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio</span>
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🇪🇺Euro, 🌏APAC, 🇹🇼TW, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT, 🗾miniShizuoka</span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item">🐍Tokyo Python Meetup</span>, <span class="item">▶️Streamlit Live</span>
- <span class="heading">Job</span>: <span class="item">ML Developer Advocate at Hugging Face 🤗</span>

<div absolute top-48 right-0>
<a href="https://github.com/whitphx" target="_blank" rel="noopener noreferrer">
<img src="/github_whitphx.png" alt="GitHub @whitphx" w="400px">
</a>
</div>

</div>

<div mt-10 w-min flex="~ gap-1" items-center justify-center v-click>
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
layout: section
---

# Announcement

---

# Set up for hands-on

- The target repository: TODO

## If you have local development environment
Python setup is preferred.

- Clone the repository
- Install `uv` (https://docs.astral.sh/uv/getting-started/installation/)

## If you don't have local development environment
- Go to the repository
- Launch Codespaces

---
layout: section
---

# What's OSS?


---
layout: section
---

# Why OSS?

👉 [You share, you gain: OSS, community, and reward](https://slides.whitphx.info/202510-oss-community-reward/)

---

# Even if your main job is not OSS?

- Your project may be using OSS libraries
- And you may encounter bugs/missing features/incorrect documentation
- Then you fix them
- It's better to merge **your** fixes back to the original project!

---

# Why?

If you keep the fixes only in your place,
- You have to maintain the fixes forever by yourself
  - Huge burden when you update the library!
- You lose chances to get feedback/improvements from others, e.g. the original developers
  - e.g. better implementations, alternative solutions
- Someone else may have the same issues
  - Good programmers don't like making duplicates 😎

---
layout: section
---

# Practical scenarios

---
layout: section
---

# What differs from closed source projects?

Disclaimer: We will only talk about GitHub-hosted projects in this session since I believe that you will use it in almost all cases, especially in the beginning, while there are many OSS projects that are managed in different ways.

---

# Closed source projects

<SlidevAnipres id="closed-source-project" />

---

# Open source projects

<SlidevAnipres id="open-source-project" />

---
layout: section
---

# Hands-on

---

# Hands-on: create an issue

---

# Hands-on: create a pull request

`close` keywords:
https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword

---

- Semantic Commit Messages
    - Tools
- AI support

---
