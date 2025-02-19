---
theme: seriph
title: "Slidev meets Anipres: beautiful slides with animated diagrams"
class: text-center
drawings:
  persist: false
mdc: true
addons:
  - anipres
  - fancy-arrow
transition: fade-out
---

<h1 data-text="Slidev meets Anipres">Slidev meets Anipres</h1>

Structured slides and animated diagrams

---

# Story

At [第七届FEDAY](https://fequan.com/2024/),

---

<div grid="~ cols-3 gap-6">

<div bg-lime:10 border="~ orange/50 rounded-lg">
<div flex="~ items-center gap-2" bg-orange:10 px4 py2 rounded text-md>Slides.com</div>
https://www.bilibili.com/video/BV1tUcBemE2r


// 12:36 - 13:15
<iframe
  src="//player.bilibili.com/player.html?isOutside=true&aid=113832169051645&bvid=BV1tUcBemE2r&cid=27883799748&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

* WYSIWYG / Slide style
* Flexible figure designs and animations
* Dev-friendly features e.g. Codeblocks
</div>

<div bg-gray:10 border="~ gray/50 rounded-lg">
<div flex="~ items-center gap-2" bg-gray:10 px4 py2 rounded>Excalidraw (+ Obsidian)</div>
https://www.bilibili.com/video/BV1iQ6EYHENU/

// 15:02
// 19:40

* WYSIWYG / Whiteboard
* Tidy font and diagrams
* Sliding animations on a single whiteboard.
</div>

<div bg-orange:10 border="~ lime/50 rounded-lg">
<div flex="~ items-center gap-2" bg-lime:10 px4 py2 rounded>Slidev</div>
https://www.bilibili.com/video/BV1Z4qdYpEUE/

// 04:23

* Markdown / Slide style
* Structured contents
* Stylish theming
* More dev-friendly components
</div>

</div>

---

# What I want

Structured contents, cool designs, and dev-friendly features like **Slidev**{ #item-slidev }

Textured diagrams like **Excalidraw** and animation like its **Obsidian plugin**{ #item-excalidraw }

<FancyArrow id1="item-excalidraw" pos1="bottomleft" id2="item-anipres" pos2="topright" color="orange" />

<span id="item-anipres">
  Anipres
</span>

<FancyArrow id1="item-powerpoint" pos1="topleft" id2="item-anipres" pos2="bottomright" color="orange" />

Intuitive editing of complex diagrams with animation like **PowerPoint**{ #item-powerpoint }

---

# Anipres

* Excalidraw-like diagrams and texts
* Diagram animations
* Frame transitions

---

<SlidevAnipres id="fig-webrtc" />

<!-- https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity -->

<!-- // https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/forms -->
