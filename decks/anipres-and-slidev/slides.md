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

<div bg-orange:10 border="~ orange/50 rounded-lg">
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

<div bg-lime:10 border="~ lime/50 rounded-lg">
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


<div flex="~ items-center gap-2">

  <div i-ph-subtract-square text-2xl text-orange-500 />

  Intuitive editing of complex diagrams with animation like **Slides.com**{ #item-slidescom } (or PowerPoint, Keynote)

</div>

<FancyArrow id1="item-slidescom" pos1="bottomleft" id2="item-anipres" pos2="topright" color="orange" />

<div w="2/3" m-auto bg-purple:10 border="~ purple/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-orange:10 px4 py2 rounded text-md>
    <span id="item-anipres">
      Anipres
      <sup text-fuchsia-500 bg-fuchsia:15 px1.5 rounded text-md>New Project</sup>
    </span>
  </div>

  <div ml2 p2>

  - WYSIWYG Excalidraw-like diagrams
  - Animations: frame transitions, diagram morphing, etc

  </div>
</div>

<FancyArrow id1="item-excalidraw" pos1="topleft" id2="item-anipres" pos2="bottomright" color="orange" />

<div flex="~ items-center gap-2">

  <div i-ph-slideshow-duotone text-2xl text-teal-500 />

Textured diagrams like **Excalidraw** and animation like its **Obsidian plugin**{ #item-excalidraw }

</div>

<FancyArrow id1="item-anipres" pos1="bottom" id2="item-anipres-slidev-addon" pos2="top" color="blue" arc="0.5" />

<div w="2/3" m-auto bg-purple:10 border="~ purple/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-orange:10 px4 py2 rounded text-md>
    <span id="item-anipres-slidev-addon">
      Anipres addon for Slidev
      <sup text-fuchsia-500 bg-fuchsia:15 px1.5 rounded text-md>New Project</sup>
    </span>
  </div>

  <div ml2 p2>

  - Embed Anipres diagrams in Slidev
  - Integrated slide transitions

  </div>
</div>

<FancyArrow id1="item-anipres-slidev-addon" pos1="bottomright" id2="item-slidev" pos2="top" color="lime" arc="0.1" roughness="0.5" />

<div flex="~ items-center gap-2">

  <div text-2xl  i-ph-text-align-left text-lime-500 />

  Structured contents, cool designs, and dev-friendly features like **Slidev**{ #item-slidev }

</div>


---

# Anipres

* Excalidraw-like diagrams and texts
* Diagram animations
* Frame transitions

---

<SlidevAnipres id="fig-webrtc" />

<!-- https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity -->

<!-- // https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/forms -->
