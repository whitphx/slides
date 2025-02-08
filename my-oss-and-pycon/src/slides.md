---
theme: seriph
background: https://cover.sli.dev
title: My OSS and PyCon
class: text-center
drawings:
  persist: false
transition: slide-left
mdc: true
addons:
  - anipres
---

---
transition: fade-out
---

<div class="slide">

# Yuichiro Tachibana

@whitphx

Software Developer / Indie Dev / OSS Enthusiast

<v-clicks>

- ML Developer Advocate at Hugging Face 🤗
- Streamlit Creator
- Born in <span v-mark.red="4">Mishima</span>, grew up in <span v-mark.orange="4">Ohito</span>, <span v-mark.circle.green="4">Shizuoka</span> 🍵

</v-clicks>

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
  font-size: 1.5em;
}
</style>

---

<Transform :scale="1.2">

# My OSS contributions

- Created:
  - <span v-click><vscode-icons-file-type-js-official ma text-xl /> <vscode-icons-file-type-vscode ma text-xl /></span> Awesome Emacs Keymap
  - <span v-after><vscode-icons-file-type-python ma text-xl /> <vscode-icons-file-type-js-official ma text-xl /></span> Stlite: In-browser Streamlit
    <!-- - PyScriptが[PyCon US 2022で発表された](https://www.youtube.com/watch?v=qKfkCY7cmBQ&list=PL2Uw4_HvXqvYeXy8ab7iRHjA-9HiYhRQl)のに触発され -->
  - <span v-after><vscode-icons-file-type-python ma text-xl /> <vscode-icons-file-type-js-official ma text-xl /></span> Streamlit-WebRTC
  - <span v-after><vscode-icons-file-type-python ma text-xl /> <vscode-icons-file-type-js-official ma text-xl /></span> Gradio-Lite: Serverless Gradio
  - <span v-after><vscode-icons-file-type-python ma text-xl /> <vscode-icons-file-type-js-official ma text-xl /></span> Transformers.js.py
  <!-- - Anipres -->
- Contributed:
  - <span v-after><vscode-icons-file-type-python ma text-xl /> <vscode-icons-file-type-js-official ma text-xl /></span> Streamlit
  - <span v-after><vscode-icons-file-type-python ma text-xl /> <vscode-icons-file-type-js-official ma text-xl /></span> Gradio

</Transform>

<style>
.hidden-on-start {
  display: inline-block;
  width: 0;
}
.slidev-vclick-target {
  width: initial;
  transition: all 500ms ease;
}
</style>

---

# My PyCon attendance

- 2021
  - PyCon JP (LT)
- 2022
  - EuroPython
  - PyCon APAC
- 2023
  - PyConDE & PyData Berlin
  - PyCon LT
  - PyCon TW
  - PyCon APAC
- 2024
  - PyCon FR

---
clicks: 23
---

<SlidevAnipres id="timeline" />


---

<div grid grid-cols-2 grid-rows-2 gap-4 h-full absolute top-0 left-0>
  <img src="./pyconlt2023/5R7A2914.JPG" />
  <img src="./pyconlt2023/5R7A3050.JPG" />
  <img src="./pyconapac2023/flickr_53294859225.jpg" />
  <img src="./pycontw2023/PXL_20230903_124942666.jpg" />
</div>

---

<div grid grid-cols-2 grid-rows-2 gap-4 h-full absolute top-0 left-0>
  <img src="./pycontw2023/IMG_2257.jpg" />
  <img src="./pycontw2023/DSC_3364.JPG" />
  <img src="./pyconde2023/PyConDe 19.04.2023-2113.jpg" />
  <img src="./pyconde2023/PyConDe 19.04.2023-2147.jpg" />
</div>

---

<div h-full w-full flex items-center justify-center>
  <img src="./star-history-202528.png" max-h-full max-w-full />
</div>

---

# わたしから見た各国のPyCon

<v-clicks>

- 優しさ、熱意、好奇心
- 英語発表だけど…
  - メンター制度（一部）
  - ノンネイティブ前提の英語カンファレンス
    - EuroPython, PyCon APAC
    - 国カンファレンスの英語トラック: PyCon JP, PyCon LT, PyCon FR
    - 国別カンファレンスだけど英語オンリー: PyCon DE
- 偶然の機会
  - Streamlitの話題を出したらPlotlyのクローズド飲み会に招待される
  - 海外のPyConで日本人と会うと仲良くなりがち
  - 海外のPyConで会った人がPyCon JPに来るときに飲みに行く

</v-clicks>

---

# PyCon-driven (海外)旅行

<div grid grid-cols-2 gap-4 h-80>
  <div v-click border-rounded px3 py3 pb-12 relative from-sky:20 to-fuchsia:15 bg-gradient-to-br>
    <h3 text-xl>旅費補助</h3>
    <div p-2>
      "Travel Grant" や "Financial Aid"
    </div>
  </div>

  <div v-click border-rounded px3 py3 pb-12 relative from-sky:20 to-fuchsia:15 bg-gradient-to-br >
    <h3 text-xl text-teal-800>食事・飲み会</h3>
    <div grid grid-cols-2 gap-4>
      <img src="./europython2022/PXL_20220713_114957669.jpg" />
      <img src="./europython2022/PXL_20220712_183854051.MP.jpg" />
    </div>
  </div>

  <div v-click border-rounded px3 py3 pb-12 relative from-sky:20 to-fuchsia:15 bg-gradient-to-br >
    <h3 text-xl text-teal-800>交流</h3>
    <div>
    </div>
  </div>

  <div v-click border-rounded px3 py3 pb-12 relative from-sky:20 to-fuchsia:15 bg-gradient-to-br >
    <h3 text-xl text-teal-800>観光</h3>
    <div>
      <iframe src="https://ep2025.europython.eu/explore/" class="w-200% scale-50% origin-top-left h-200%"/>
    </div>
  </div>
</div>

<v-click>

👉 あちこちにProposalを出して通ったところに行く

</v-click>

<v-click>

[Conf-driven Traveling✈️](https://www.whitphx.info/posts/20230511-conference-driven-travels/)

</v-click>

---

# まとめ

<v-clicks depth="2">

- 各地のPyConに参加してトークしたおかげで
  - 自分のプロジェクトがより良くなった
  - 友人が増えた
  - 仕事にもいい影響があった（かも）

- 各地のPyConに行くのいいよ
  - 旅行にもなるし

</v-clicks>
