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
  - "@katzumi/slidev-addon-qrcode"
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

# Preparation for hands-on

Set up https://github.com/whitphx-dev/meowcli-20251029

<div absolute top-4 right-4 z-10 bg-white shadow-lg rounded-lg>
<QRCode
  value="https://github.com/whitphx-dev/meowcli-20251029"
  :width="180"
  :height="180"
  color="36709E"
/>
</div>

<div grid="~ cols-2" gap-4>

<Modal>
  <template #title>

## Local

  </template>

### Prerequisites

- **Git**
- **Your favorite editor**

### Steps

1. Install `uv` ([docs](https://docs.astral.sh/uv/getting-started/installation/))
2. Clone the repository: `git clone https://github.com/whitphx-dev/meowcli-20251029.git`
3. Set up: `uv sync`
4. Test it works: `uv run python -m meow`

</Modal>

<Modal>
  <template #title>

## Cloud

  </template>

1. Go to [the repo page](https://github.com/whitphx-dev/meowcli-20251029)
2. Launch Codespaces
  <img src="/codespaces_button.png" alt="GitHub Codespaces button" w="300px">
3. Test it works: `uv run python -m meow`

</Modal>

</div>

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

# Issues

---

# GitHub Issues

- Bug report
- Feature request
- Documentation improvement
- Question / Discussion
- Others...

---

# nit: discussions?

---

# Write a good issue

## General advice
- Be gentle
- Imagine you are writing for a friend

⛔ Don't:
- "This is broken!"
- "Please fix this ASAP!"

## Guidelines

Writing a good issue requires (a bit of) skills.

---

# Hands-on: create an issue

---

# Advanced: create an issue to an actual OSS project if you have something to report

---
layout: section
---

# Code contributions

---

# What differs from closed source projects?

<small>
Disclaimer: We will only talk about GitHub-hosted projects in this session since I believe that you will use it in almost all cases, especially in the beginning, while there are many OSS projects that are managed in different ways.
</small>

---

# Closed source projects

<SlidevAnipres id="closed-source-project" />

---

# Open source projects

<SlidevAnipres id="open-source-project" />

---

# You have to **fork** the repository first

<v-clicks>

- Forking creates your own copy of the repository under your GitHub account
- You can make changes freely in your forked repository
- You create a **pull request** to propose your changes to the original repository

</v-clicks>

---

# `git remote`?

<div grid="~ cols-2" gap-4>

```bash {1|1|1|2|3-5|3-5|3-5|3-5|3-5|6|6|7-11}
$ git clone https://github.com/whitphx-dev/meowcli-20251029.git
$ cd meowcli-20251029/
$ git remote -v
origin  https://github.com/whitphx-dev/meowcli-20251029.git (fetch)
origin  https://github.com/whitphx-dev/meowcli-20251029.git (push)
$ git remote add my-fork https://github.com/whitphx/meowcli-20251029.git
$ git remote -v
my-fork https://github.com/whitphx/meowcli-20251029.git (fetch)
my-fork https://github.com/whitphx/meowcli-20251029.git (push)
origin  https://github.com/whitphx-dev/meowcli-20251029.git (fetch)
origin  https://github.com/whitphx-dev/meowcli-20251029.git (push)
```


<SlidevAnipres id="git-remote" at="0" />

</div>

---

# Hands-on: create a pull request

Assuming that you already have cloned the repo.

1. On GitHub: Fork the repository
2. On local: Configure `git remote` to point to your fork
3. Create a new branch
4. Make changes
5. Commit and push
6. On GitHub: Create a pull request

---

# Tips:

Some OSS projects have their own contribution guidelines/conventions that may include:

- [Linking issues with keywords such as `close`](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword)
- Work-in-progress PRs: [draft state](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request) / prefixing title with `WIP:`
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) / [Semantic Commit Messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)

---

# When the upstream is updated?

You need to fetch the latest changes from the original repository and merge/rebase them into your local repository/forked repository.

---
