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
---

<h1>
You share, you gain:<br>
<small>
OSS, community, and reward
</small>
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
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🇪🇺Euro, 🌏APAC, 🇹🇼TW, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT, 🗾miniShizuoka</span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item" v-mark.highlight.orange="2">🐍Tokyo Python Meetup</span>, <span class="item">▶️Streamlit Live</span>
- <span class="heading">Job</span>: <span class="item">ML Developer Advocate at Hugging Face 🤗</span>

<div absolute top-48 right-0>
<a href="https://github.com/whitphx" target="_blank" rel="noopener noreferrer">
<img src="/github_whitphx.png" alt="GitHub @whitphx" w="400px">
</a>
</div>

</div>

<div mt-10 w-min flex="~ gap-1" items-center justify-center v-click="3">
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

<h1>
<span inline-block transition duration-500 :class="$clicks === 0 ? 'translate-x-80 translate-y-40' : $clicks === 1 ? 'translate-y-40' : ''">OSS</span>
<span v-click inline-block transition duration-500 :class="$clicks <= 1 ? 'translate-y-40' : ''">: Open Source Software</span>
</h1>

<blockquote v-click transition duration-500>

<div text-md p-2>

Open source software is software with source code<br>
that anyone can inspect, modify, and enhance.

<small>
<i>https://opensource.com/resources/what-open-source</i>
</small>

</div>
</blockquote>

<div relative w-full h-50>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-137 translate-y-6'" v-click >license</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-135 translate-y-22'" v-after >copyleft</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-44 translate-y-12'" v-after >standards</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-154 translate-y-34'" v-after >transparency</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-67 translate-y-18'" v-after v-mark.orange="5">collaboration</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-112 translate-y-8'" v-after >sharing</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-18 translate-y-24'" v-after >freedom</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-97 translate-y-39'" v-after >innovation</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-30 translate-y-3'" v-after v-mark.orange="5">learning</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-29 translate-y-33'" v-after v-mark.orange="4">community</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-165 translate-y-15'" v-after v-mark.orange="5">career</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-96 translate-y-27'" v-after v-mark.orange="4">contributions</span>
<span inline-block absolute left-0 top-0 transition duration-500 :class="$clicks<=2 ? 'opacity-0' : 'translate-x-62 translate-y-31'" v-after >democratic</span>
</div>

---

<div grid="~ cols-2" gap-6 h-120>
<div max-h-full min-h-full>
<img src="/the_world_is_built_on_oss.png" >
</div>

<div max-h-full min-h-full v-click>
<img src="https://www.explainxkcd.com/wiki/images/d/d7/dependency.png" block h="100%" mx-auto>
</div>

</div>

---

# OSS is not only for superheroes!

You are ready to contribute to OSS

<div v-click mt-4>

In your <span v-mark.box.orange="+0">daily</span> work, business, and development, if...

</div>

<v-clicks>

- you encounter a <span v-mark.orange="+0">bug</span> in a library you use
- you need a <span v-mark.orange="+0">new feature</span> in a library you use
- you find a <span v-mark.orange="+0">typo</span> in the documentation
- you discover a <span v-mark.orange="+0">better way</span> to do something
- you create a <span v-mark.orange="+0">useful function</span>
- ...any small <span v-mark.orange="+0">discovery or creation</span>

</v-clicks>

<div v-click mt-8 text-4xl>
Share it!
</div>

---

# Different types and levels of OSS contributions

<v-clicks>

- 🖥️ Writing code
- 📝 Writing docs
  - 🌐 Translation
- 🐛 Reporting issues (bugs, feature requests, etc.)
- 🤝 Helping others (answering questions, mentoring, etc.)
- 📚 Writing articles or tutorials
- 💰 Financial support (donations, sponsorships, etc.)
- 📢 Sharing on social media

</v-clicks>

---
layout: section
---

## My OSS contributions as example...

---

# [`whitphx/fuel-kana`](https://github.com/whitphx/fuel-kana), 2015

<v-clicks>

- Very tiny PHP library wrapping a single regex.
- Used in my personal project.

</v-clicks>

<div v-click mt-4 relative>
<a href="https://github.com/whitphx/fuel-kana/blob/master/classes/kana.php" target="_blank" rel="noopener noreferrer">
<img src="/github_fuel-kana.png" alt="Screenshot of GitHub repository fuel-kana" w="95%" mx-auto>
</a>
</div>

---

# [`whitphx/lear-gist-python`](https://github.com/whitphx/lear-gist-python), 2015

<v-clicks>

- Python wrapper to use C-implemented GIST feature extractor.
- To prototype a Raspberry Pi camera app to impress my grant interviewer.

</v-clicks>

<div v-click mt-4 relative>
<a href="https://github.com/whitphx/lear-gist-python/tree/master" target="_blank" rel="noopener noreferrer">
<img src="/github_lear-gist-python.png" alt="Screenshot of GitHub repository lear-gist-python" w="95%" mx-auto>
</a>
</div>

---
layout: statement
---

<h1>
Share what you built<br>
no matter how small it is 👍
</h1>

---

# Small fixes in [`mdn/translated-content`](https://github.com/mdn/translated-content/pulls?q=is:pr+author:whitphx)

<div>

Fix translation (en: "origin", ja: "元" -> "オリジン")

[![](/github_mdn_translated-content_0.png)](https://github.com/mdn/translated-content/pull/16463)

</div>

---

# Small fixes in [`mdn/translated-content`](github.com/mdn/translated-content/pulls?q=is:pr+author:whitphx)

<div>

Fix invalid syntax.

[![](/github_mdn_translated-content_1.png)](https://github.com/mdn/translated-content/pull/15801)

</div>

---

# Fix a typo in [`keras-team/keras-docs-ja`](https://github.com/keras-team/keras-docs-ja/pulls?q=is:pr+author:whitphx)

<div>

`+2` → `+1`

[![](/github_keras-team_keras-docs-ja.png)](https://github.com/keras-team/keras-docs-ja/pull/79/files)

</div>

---

# Fix a typo in [`facelessuser/pymdown-extensions`](https://github.com/facelessuser/pymdown-extensions)

<div>

Removed `to`.

[![](/github_facelessuser_pymdown-extensions.png)](https://github.com/facelessuser/pymdown-extensions/pull/2762/files)

</div>

<v-click>

I found it in Shinkansen heading to PyCon JP 2025 when I was developing a docs page in another project, and quickly submitted the patch 🚅

</v-click>

---

# Bug report and fix in [`docker/compose`](https://github.com/docker/compose)

<div relative>

<div absolute top-o left-0 v-click.hide="1">

https://github.com/docker/compose/issues/6508

![My bug report to `docker/compose`](/docker_compose_issue_6508.png)

</div>

<div absolute top-o left-0 v-click="1">

https://github.com/docker/compose/pull/6509

![My fix PR to `docker/compose`](/github_docker_compose_pr_6509.png)

</div>

</div>

---

# Bug fixes and enhancements in OSS projects I use

- [`DefinitelyTyped/DefinitelyTyped`](https://github.com/DefinitelyTyped/DefinitelyTyped/pulls?q=is:pr+author:whitphx+)
- [`auth0/ruby-auto0`](https://github.com/auth0/ruby-auth0/pull/326)
- [`sheetalgiri/nepali-calendar-js`](https://github.com/sheetalgiri/nepali-calendar-js/pull/1)

---

# When you encounter situations like...

<v-clicks>

- 🤔 The doc looks wrong.
- 🤔 Autocomplete doesn't work as expected.
- 🤔 The method/tool doesn't behave as documented.

</v-clicks>

<div mt-4>

<v-click>
Contribute to the OSS you use,
</v-click>
<v-click>
before tweeting complaining about it!
</v-click>

</div>

---

# Tools for my team

<div>

Streamlit-WebRTC: `whitphx/streamlit-webrtc`

- 🤔 We want an easy tool to create shareable real-time computer vision demos.

</div>

<SlidevVideo autoplay muted controls loop w-120 mx-auto>
  <source src="/streamlit-webrtc-tutorial-edge-9312.mov" />
</SlidevVideo>

---

# When you find bugs or feature requests

<div>

`streamlit/streamlit`

<div grid="~ cols-2" gap-4>

<a href="https://github.com/streamlit/streamlit/issues?q=is:issue%20author:whitphx">
<img src="/streamlit_issues.png" alt="">
</a>

<a href="https://github.com/streamlit/streamlit/pulls?q=is:pr+author:whitphx+">
<img src="/streamlit_prs.png" alt="">
</a>

</div>

</div>

---

# OSS contribution is not special

It's just an extension of your daily work.

- You write code and docs to solve your problems.
- You share it on GitHub for collaboration with others.

<div v-click>

...but there are some unique technical and social aspects 😉

<a href="https://luma.com/4n9wk979" target="_blank" rel="noopener noreferrer" block mt-8  w="70%" mx-auto>
<img src="/oss101.png" alt="">
</a>

</div>

---

# Start with my own needs

<div>

Awesome Emacs Keymap: [`whitphx/vscode-emacs-mcx`](https://github.com/whitphx/vscode-emacs-mcx)

- 🤔 I need Emacs keybinding even on VSCode.

</div>

<div v-click>

[![](/awesome-emacs-keymap.png)](https://marketplace.visualstudio.com/items?itemName=tuttieee.emacs-mcx)

</div>

---

<img src="/sebastian_solve_a_problem.png" w="85%" mx-auto>

[Keynote: Behind the scenes of FastAPI and friends for developers and builders — Sebastián Ramírez, EuroPython 2025](https://www.youtube.com/watch?v=mwvmfl8nN_U)

---

# Driven by curiosity

<div>

Stlite: [`whitphx/stlite`](https://github.com/whitphx/stlite)

- 🤔 Can Streamlit run in a web browser with Pyodide?

</div>

<img src="/stlite.svg" alt="Stlite logo" h-50 mx-auto my-8>

---

# Contribution itself can be the purpose

<div>

[`python/cpython`](https://github.com/python/cpython)

in PyCon US and EuroPython sprints.

</div>

<div flex="~ row" items-center justify-center gap-4 mt-4>

<div>
<a href="https://github.com/python/cpython/pull/134275">
<img src="/github_cpython_sprint.png" alt="CPython sprint" w-200>
</a>
</div>

<div shrink-1>
<img src="https://gihyo.jp/assets/images/article/2025/06/pycon-us-2025-03/018.png" alt="Sprint table" w-40>

<small text-xs opacity-80 block mt-2>
From <a href="https://gihyo.jp/article/2025/06/pycon-us-2025-03#gh3Cv4MSFz" target="_blank" rel="noopener noreferrer">PyCon US 2025参加レポート (gihyo.jp)</a>
</small>
</div>

</div>

---

# Through such OSS contributions, you can gain...

<v-clicks>

- Conversations with maintainers and other contributors
- Invitations to discussion groups
- Feedback on your code and ideas
- Recognition
- Friends
- Fans

</v-clicks>

<div v-click text-4xl mt-8>
→ Community 👬
</div>

---

# Community?

I can't provide a strict definition, but...

<div v-click>

If you have done something for an OSS project, you are part of the OSS community.
- Comms in issues and PRs
- Slack/Discord/forums
- Social media

</div>

<v-click>

Events are visible expression of a community.
- PyCon
- Tokyo Python Meetup!

</v-click>

---

# My case

<div grid="~ cols-2" gap-4>

- Python community
- Streamlit Creators channel
- Snowflake community
- Hugging Face community
- and more...

<div grid="~ cols-2 rows-2" absolute right-0 top-0 w="50%">
<img src="/community/pycontw_talk.jpg" >
<img src="/community/pycontw_photobooth.jpg" >
<img src="/community/europython_speaker_dinner.jpg" >
<img src="/community/europython_sprint.jpg" >
<img src="/community/feday.jpeg" >
<img src="/community/snowflake_streamlit.jpeg" >
<img src="/community/snowflake_party.jpg" >
<img src="/community/pyconjp_sebastian.jpg" >
</div>

</div>

---
layout: section
---

<h1>
Reward:<br>
<small>
problem-solving, knowledge, and opportunities (and maybe money)
</small>
</h1>

---

# Your contributions reward someone, and you too.

<v-clicks>

- Your and/or their problems are solved.
- You and they learn something.

</v-clicks>

<div v-click mt-8 text-4xl>
OSS is sharing and gaining.
</div>

---
layout: statement
---

# And more.

---

# Rewards

<v-clicks depth="2">

- 🛠️ Problem solving
- 📈 Technical improvements
- 💪 Learning opportunities
  - Development
  - Communication and collaboration
    - Language, Documentation, Promotion, Negotiation
  - Business
- 🫂 Community/Networking
- 👛 Sponsorship
- 💼 Job opportunities

</v-clicks>

---

# Example: Awesome Emacs Keymap

<v-clicks>

- 🖋️ My everyday tool for productivity
- ❤️ Positive feedback and stars from users
- 👛 [Tips from users](https://buymeacoffee.com/whitphx)
- ⚒️ Contribution opportunities to VS Code

</v-clicks>

---

# Example: Streamlit-WebRTC

<v-clicks depth="2">

- 💬 Talk opportunities at PyCons
- ❤️ Positive feedback and stars from users
- 💪 Learning opportunities
  - ⚡ Tech: WebRTC knowledge
  - 💼 Business: Consulting jobs
    - Contracts with overseas clients
    - Income in foreign currency
    - Work in English
- 🧑‍💻 Contribution opportunities to the OSS you use `aiortc`

</v-clicks>

---

# Example: Stlite

<v-clicks>

- 💡 Inspired by JupyterLite → Opportunities to learn its internals
- 🧑‍💻 Contribution opportunities to the OSS you use `pyodide`
- 👛 Sponsorship: Databutton, Streamlit, Hal9, RAKUDEJI
- 🧑‍🤝‍🧑 Friends at sponsor companies
- 🤝 Collaboration opportunities with the Streamlit core team
- 💼 Job opportunities at companies using Streamlit/Stlite

</v-clicks>

---

# Example: Streamlit-WebRTC & Stlite

<v-clicks>

- 🤗 Job opportunity at Hugging Face
- 💡 Inspiration for Gradio-Lite
- 🤝 Discussion behind FastRTC

</v-clicks>

---

# Sharing is (often) better

<v-clicks>

- OSS developed, maintained, tested, and used by many people \
  **is better than** code only owned by you.
- General procedures don't have to be the core of your business... in many cases.
- If you don't make it open, others may make it open in near future.

</v-clicks>

---
layout: statement
---

<div text-left>
<v-clicks>

- You share something with the community through OSS.
- You gain something from the community and OSS.

</v-clicks>
</div>

---

# ⚠️ Don't troll. Be professional.
You can get many good things from OSS and community, so...

<v-clicks>

- Be respectful and kind
- Community is made of people
- "Can I do it to my boss/colleague/client?"

</v-clicks>

---
layout: statement
---

<h1>
You share, you gain:<br>
<small>
OSS, community, and reward
</small>
</h1>

---

# Thank you 💫

<h2 mt-10>

Yuichiro Tachibana / 橘 祐一郎 / `@whitphx`

</h2>

<div mt-8 w-min flex="~ gap-1" items-center justify-center>
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>
