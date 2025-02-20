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
defaults:
  transition: slide-left
transition: fade-out
---

<h1 data-text="Slidev meets Anipres">Slidev meets Anipres</h1>

Structured slides and animated diagrams

---
layout: quote
---

# What presentation tool do you like?

---

# Story

At [第七届FEDAY](https://fequan.com/2024/),

---
clicks: 5
---

# Various presentation styles

<div grid="~ cols-3 gap-6">

<div bg-orange:10 border="~ orange/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-orange:10 px4 py2 rounded text-md>Slides.com</div>
    <div :class="$clicks === 0 ? 'absolute top-1 left-1 right-1 bottom-1' : ''">
      <SlidevVideo autoplay muted controls loop>
        <source src="/feday_whitphx_4x.mp4" type="video/mp4" />
      </SlidevVideo>
    </div>

<!-- Key parts:
Original: https://www.bilibili.com/video/BV1tUcBemE2r
* 07:54 - 09:04
* 12:36 - 13:15
-->
  <!-- <iframe
    src="//player.bilibili.com/player.html?isOutside=true&aid=113832169051645&bvid=BV1tUcBemE2r&cid=27883799748&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe> -->

  * WYSIWYG / Slide
  * Flexible figure designs and animations
  * Dev-friendly features e.g. codeblocks
</div>

<div v-click="2" bg-gray:10 border="~ gray/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-gray:10 px4 py2 rounded>Excalidraw (+ Obsidian)</div>
    <div :class="$clicks === 2 ? 'absolute top-1 left-1 right-1 bottom-1' : ''">
      <SlidevVideo autoplay muted controls loop>
        <source src="/feday_maieul_4x.mp4" type="video/mp4" />
      </SlidevVideo>
    </div>

<!-- Key parts:
Original: https://www.bilibili.com/video/BV1iQ6EYHENU/
* 14:14 - 15:02 = 854s + 48s -> (4x) 3:33 + 12s
* 21:21 - 22:50 = 1281s + 89s -> (4x) 5:20 + 22s
/-->

  * WYSIWYG / Whiteboard
  * Tidy font and diagrams
  * Sliding animations on a single whiteboard
</div>

<div v-click="4" bg-lime:10 border="~ lime/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-lime:10 px4 py2 rounded>Slidev</div>
    <div :class="$clicks === 4 ? 'absolute top-1 left-1 right-1 bottom-1' : ''">
      <SlidevVideo autoplay muted controls loop>
        <source src="/feday_antfu_10x.mp4" type="video/mp4" />
      </SlidevVideo>
    </div>

<!--
Original: https://www.bilibili.com/video/BV1Z4qdYpEUE/
Key parts:
* 04:22 - 09:44 = 262s + 322s -> (10x) 27s + 32s
-->

  * Markdown / Slide
  * Structured contents
  * Stylish theming
  * More dev-friendly components
</div>

</div>

---

# What I want


<div flex="~ items-center gap-2">

  <div i-ph-subtract-square text-2xl text-orange-500 />

  Intuitive editing of complex diagrams with animation like <strong id="item-slidescom" v-mark.underline.orange="2">Slides.com</strong> (or PowerPoint, Keynote)

</div>

<FancyArrow v-click="2" id1="item-slidescom" pos1="bottomleft" id2="card-anipres-title" pos2="right" color="orange" arc="0.1" seed="2" />

<div v-click="1" w="2/3" m-auto bg-purple:10 border="~ purple/50 rounded-lg" id="card-anipres">
  <div flex="~ items-center gap-2" bg-orange:10 px4 py2 rounded text-md>
    <span id="card-anipres-title">
      Anipres
    </span>
    <sup text-fuchsia-500 bg-fuchsia:15 px1.5 rounded text-md>New Project</sup>
  </div>

  <div ml2 p2>

  - WYSIWYG Excalidraw-like diagrams
  - Animations: frame transitions, diagram morphing, etc

  </div>
</div>

<FancyArrow v-click="2" id1="item-excalidraw" pos1="top" id2="card-anipres-title" pos2="bottomright" color="teal" arc="0.1" seed="2" />

<div flex="~ items-center gap-2">

  <div i-ph-slideshow-duotone text-2xl text-teal-500 />

Textured diagrams like <strong id="item-excalidraw" v-mark.underline.teal="2">Excalidraw</strong> and animation like its **Obsidian plugin**

</div>

<FancyArrow v-click="3" id1="card-anipres" pos1="bottomleft" id2="card-anipres-slidev-addon-title" pos2="topleft" color="blue" arc="-0.5" />

<div v-click="3" w="2/3" m-auto bg-purple:10 border="~ purple/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-orange:10 px4 py2 rounded text-md>
    <span id="card-anipres-slidev-addon-title">
      Anipres addon for Slidev
    </span>
    <sup text-fuchsia-500 bg-fuchsia:15 px1.5 rounded text-md>New Project</sup>
  </div>

  <div ml2 p2>

  - <span id="anipres-addon-embed" v-mark.underline.blue="4">Embed</span> Anipres diagrams in Slidev
  - Integrated slide transitions

  </div>
</div>

<FancyArrow v-click="4" id1="anipres-addon-embed" pos1="bottom" id2="item-slidev" pos2="top" color="blue" arc="0" roughness="0.3" seed="4" />

<div flex="~ items-center gap-2">

  <div text-2xl  i-ph-text-align-left text-lime-500 />

  Structured contents, cool designs, and dev-friendly features like <strong id="item-slidev" v-mark.underline.lime="4">Slidev</strong>

</div>


---

# Anipres

<div flex="~ items-center gap-2" text-2xl>

  <div i-carbon-logo-github text-2xl/>

  <a href="https://github.com/whitphx/anipres" target="_blank" border-0 font-mono opacity-80>
    whitphx/anipres
  </a>

</div>


<div flex="~ items-center gap-2" text-2xl>

  <div i-carbon-link text-2xl />

  <a href="https://anipres.app" target="_blank" border-0 font-mono opacity-80>
    anipres.app
  </a>

</div>

---
clicks: 10
---

<div :w="$clicks >= 10 ? '1/2' : 'full'" h-full>

  <SlidevAnipres id="fig-webrtc" />

</div>

<div :w="$clicks >= 10 ? '1/2' : '0'" h-full absolute right-0 top-0 bottom-0>

````javascript
function handleVideoOfferMsg(msg) {
  let localStream = null;

  targetUsername = msg.name;
  createPeerConnection();

  const desc = new RTCSessionDescription(msg.sdp);

  myPeerConnection
    .setRemoteDescription(desc)
    .then(() => navigator.mediaDevices.getUserMedia(mediaConstraints))
    .then((stream) => {
      localStream = stream;
      document.getElementById("local_video").srcObject = localStream;

      localStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, localStream));
    })
    .then(() => myPeerConnection.createAnswer())
    .then((answer) => myPeerConnection.setLocalDescription(answer))
    .then(() => {
      const msg = {
        name: myUsername,
        target: targetUsername,
        type: "video-answer",
        sdp: myPeerConnection.localDescription,
      };

      sendToServer(msg);
    })
    .catch(handleGetUserMediaError);
}
````

</div>


<footer absolute bottom-0 left-0 right-0 p-2 text-xs>
  <div text-center>
    Refs:
    <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity" target="_blank" border-0 font-mono opacity-80>
      https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity
    </a>,
    <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling#the_client_application" target="_blank" border-0 font-mono opacity-80>
      https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling#the_client_application
    </a>
  </div>
</footer>

<!-- https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity -->

<!-- // https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/forms -->


---
clicks: 12
---

<SlidevAnipres id="fig-gradio-lite" />
