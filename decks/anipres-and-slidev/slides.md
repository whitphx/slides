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

  Intuitive editing of complex diagrams with animation like <strong id="item-slidescom" v-mark.underline.orange>Slides.com</strong> (or PowerPoint, Keynote)

</div>

<FancyArrow id1="item-slidescom" pos1="bottomleft" id2="card-anipres-title" pos2="right" color="orange" arc="0.1" seed="2" />

<div w="2/3" m-auto bg-purple:10 border="~ purple/50 rounded-lg" id="card-anipres">
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

<FancyArrow id1="item-excalidraw" pos1="top" id2="card-anipres-title" pos2="bottomright" color="orange" arc="0.1" seed="2" />

<div flex="~ items-center gap-2">

  <div i-ph-slideshow-duotone text-2xl text-teal-500 />

Textured diagrams like <strong id="item-excalidraw" v-mark.underline.teal>Excalidraw</strong> and animation like its **Obsidian plugin**

</div>

<FancyArrow id1="card-anipres" pos1="bottomleft" id2="card-anipres-slidev-addon-title" pos2="topleft" color="blue" arc="-0.5" />

<div w="2/3" m-auto bg-purple:10 border="~ purple/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-orange:10 px4 py2 rounded text-md>
    <span id="card-anipres-slidev-addon-title">
      Anipres addon for Slidev
    </span>
    <sup text-fuchsia-500 bg-fuchsia:15 px1.5 rounded text-md>New Project</sup>
  </div>

  <div ml2 p2>

  - <span id="anipres-addon-embed" v-mark.underline.blue>Embed</span> Anipres diagrams in Slidev
  - Integrated slide transitions

  </div>
</div>

<FancyArrow id1="anipres-addon-embed" pos1="bottom" id2="item-slidev" pos2="top" color="blue" arc="0" roughness="0.3" seed="4" />

<div flex="~ items-center gap-2">

  <div text-2xl  i-ph-text-align-left text-lime-500 />

  Structured contents, cool designs, and dev-friendly features like <strong id="item-slidev" v-mark.underline.lime>Slidev</strong>

</div>


---

# Anipres

<div flex="~ items-center gap-2" text-2xl>

  <div i-carbon-logo-github text-2xl text-black />

  <a href="https://github.com/whitphx/anipres" target="_blank" border-0 font-mono opacity-80>
    whitphx/anipres
  </a>

</div>


<div flex="~ items-center gap-2" text-2xl>

  <div i-carbon-link text-2xl text-black />

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
