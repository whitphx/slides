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

<div text-2xl>
  Structured slides and animated diagrams<br />
  for developers' presentations
</div>

---

<div class="slide">

# Yuichiro Tachibana

@whitphx

<div mt-8 v-click>
Software Artisan / Indie Dev / OSS Enthusiast
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

</div>

<style>
.slide {
  font-size: 1.8em;
}
</style>

---
layout: quote
---

<h1 text-4xl>

What presentation tool do you like?

</h1>

---
layout: center
---

<div text-4xl>

At [第七届FEDAY](https://fequan.com/2024/) in Xiamen, China on Dec 2024...

</div>

---
clicks: 5
---

# Various presentation styles

<div grid="~ cols-3 gap-6">

<div bg-orange:10 border="~ orange/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-orange:10 px4 py2 rounded text-md>Slides.com</div>
    <div p1 :class="$clicks === 0 ? 'absolute top-1 left-1 right-1 bottom-1 z-modal' : ''">
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

  * WYSIWYG / Slide-based
  * Flexible figure designs and animations
  * Dev-friendly features e.g. codeblocks
</div>

<div v-click="2" bg-gray:10 border="~ gray/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-gray:10 px4 py2 rounded>Excalidraw (+ Obsidian)</div>
    <div p1 :class="$clicks === 2 ? 'absolute top-1 left-1 right-1 bottom-1 z-modal' : ''">
      <SlidevVideo autoplay muted controls loop>
        <source src="/feday_maieul_4x.mp4" type="video/mp4" />
      </SlidevVideo>
    </div>

<!-- Key parts:
Original: https://www.bilibili.com/video/BV1iQ6EYHENU/
* 14:14 - 15:02 = 854s + 48s -> (4x) 3:33 + 12s
* 21:21 - 22:50 = 1281s + 89s -> (4x) 5:20 + 22s
/-->

  * WYSIWYG / Canvas-based
  * Tidy font and diagrams
  * Transitions on an infinite single canvas
</div>

<div v-click="4" bg-lime:10 border="~ lime/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-lime:10 px4 py2 rounded>Slidev</div>
    <div p1 :class="$clicks === 4 ? 'absolute top-1 left-1 right-1 bottom-1 z-modal' : ''">
      <SlidevVideo autoplay muted controls loop>
        <source src="/feday_antfu_10x.mp4" type="video/mp4" />
      </SlidevVideo>
    </div>

<!--
Original: https://www.bilibili.com/video/BV1Z4qdYpEUE/
Key parts:
* 04:22 - 09:44 = 262s + 322s -> (10x) 27s + 32s
-->

  * Markdown / Slide-based
  * Structured contents
  * Stylish theming
  * More dev-friendly components
</div>

</div>

<footer text-xs absolute bottom-0 left-0 right-0 text-center>

Refs:
<a href="https://www.bilibili.com/video/BV1tUcBemE2r/" target="_blank" border-0 opacity-70>
  使用 Gradio 和 Transformers 构建 Web AI 应用 - Yuichiro
</a>,
<a v-click="2" href="https://www.bilibili.com/video/BV1iQ6EYHENU/" target="_blank" border-0 opacity-70>
  Qwik: Resumability(可恢复性) 将引领时代 - 毛雨乐
</a>,
<a v-click="4" href="https://www.bilibili.com/video/BV1Z4qdYpEUE/" target="_blank" border-0 opacity-70>
  ESLint 通用配置方案：化繁为简 - Anthony Fu
</a>

</footer>

---

# What I want

<div flex="~ items-center gap-2" text-xl>

  <div i-ph-subtract-square text-2xl text-orange-500 />

  Intuitive editing of complex diagrams with animations like <strong id="item-slidescom" v-mark.underline.orange="2">Slides.com</strong> (or PowerPoint)

</div>

<FancyArrow v-click="2" id1="item-slidescom" pos1="bottomleft" id2="card-anipres-title" pos2="right" color="orange" arc="0.1" seed="2" />

<div v-click="1" forward:delay-300 w="2/3" m-auto bg-fuchsia:10 border="~ fuchsia/50 rounded-lg" id="card-anipres">
  <div flex="~ items-center gap-2" bg-fuchsia:10 px4 py2 rounded text-md>
    <span id="card-anipres-title">
      Anipres
    </span>
    <sup text-fuchsia-500 bg-fuchsia:15 px1.5 rounded text-md>New Project</sup>
  </div>

  <div ml2 p2>

  - WYSIWYG Excalidraw-like diagrams
  - Animations: frame transitions, shape morphing, etc

  </div>
</div>

<FancyArrow v-click="2" id1="item-excalidraw" pos1="top" id2="card-anipres-title" pos2="bottomright" color="teal" arc="0.1" seed="2" />

<div flex="~ items-center gap-2" text-xl :class="$clicks < 1 ? 'translate-y--30' : ''" transition duration-500>

  <div i-ph-slideshow-duotone text-2xl text-teal-500 />

Textured diagrams like <strong id="item-excalidraw" v-mark.underline.teal="2">Excalidraw</strong> and animations like its **Obsidian plugin**

</div>

<FancyArrow v-click="3" id1="card-anipres" pos1="bottomleft" id2="card-anipres-slidev-addon-title" pos2="topleft" color="blue" arc="-0.5" />

<div v-click="3" forward:delay-300 w="2/3" m-auto bg-fuchsia:10 border="~ fuchsia/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-fuchsia:10 px4 py2 rounded text-md>
    <span id="card-anipres-slidev-addon-title">
      Anipres addon for Slidev
    </span>
    <sup text-fuchsia-500 bg-fuchsia:15 px1.5 rounded text-md>New Project</sup>
  </div>

  <div ml2 p2>

  - <span id="anipres-addon-embed" v-mark.underline.blue="4">Embed</span> Anipres presentations in Slidev's
  - Integrated click actions

  </div>
</div>

<FancyArrow v-click="4" id1="anipres-addon-embed" pos1="bottom" id2="item-slidev" pos2="top" color="blue" arc="0" roughness="0.3" seed="4" />

<div flex="~ items-center gap-2" text-xl :class="$clicks < 1 ? 'translate-y--60' : $clicks < 3 ? 'translate-y--30' : ''" transition duration-500>

  <div text-2xl  i-ph-text-align-left text-lime-500 />

  Structured contents, cool designs, and dev-friendly features like <strong id="item-slidev" v-mark.underline.lime="4">Slidev</strong>

</div>


---
layout: center
---

<div flex="~ col gap-6" text-5xl>

<div flex="~ items-center gap-2">

  <div i-carbon-logo-github/>

  <a href="https://github.com/whitphx/anipres" target="_blank" border-0 font-mono opacity-80>
    whitphx/anipres
  </a>

</div>


<div flex="~ items-center gap-2">

  <div i-carbon-link />

  <a href="https://anipres.app" target="_blank" border-0 font-mono opacity-80>
    anipres.app
  </a>

</div>

</div>

---

# Example: WebRTC signaling protocol

<div :w="$clicks >= 1 ? '1/2' : 'full'" h-100 :ml="$clicks >= 1 ? '1/2' : '0'">

  <SlidevAnipres id="fig-webrtc" at="0" />

</div>

<div :w="$clicks >= 1 ? '1/2' : '0'" absolute left-0 top-30 bottom-20 transition-width duration-500>

```javascript {*|4-5|21-32|33-34,35-36|*|6-20}{lines:true,maxHeight:'100%'}
function negotiate() {
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });
    return pc.createOffer().then((offer) => {
        return pc.setLocalDescription(offer);
    }).then(() => {
        // wait for ICE gathering to complete
        return new Promise((resolve) => {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                const checkState = () => {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                };
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(() => {
        var offer = pc.localDescription;
        return fetch('/offer', {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then((response) => {
        return response.json();
    }).then((answer) => {
        return pc.setRemoteDescription(answer);
    }).catch((e) => {
        alert(e);
    });
}

```

</div>


<footer absolute bottom-0 left-0 right-0 p-2 text-xs>
  <div text-center>
    Refs:
    <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity" target="_blank" border-0 font-mono opacity-80>
      https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity
    </a>,
    <a href="https://github.com/aiortc/aiortc/blob/65cd5653f9cc922777b706563be7f4b0058d19c4/examples/webcam/client.js" target="_blank" border-0 font-mono opacity-80>
      https://github.com/aiortc/aiortc/blob/65cd5653f9cc922777b706563be7f4b0058d19c4/examples/webcam/client.js
    </a>
  </div>
</footer>

<!-- https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity -->

<!-- // https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/forms -->


---

# Example: Gradio-Lite architecture

<div h-100>
<SlidevAnipres id="fig-gradio-lite" />
</div>

---

# Anipres & its Slidev addon were just bootstrapped!

<div mt-4 flex="~ col gap-6">

<div v-click w="2/3" m-auto bg-fuchsia:10 border="~ fuchsia/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-fuchsia:10 px4 py2 rounded text-md>
    <span id="card-anipres-slidev-addon-title">
      Anipres
    </span>
    <sup text-fuchsia-500 bg-fuchsia:15 px1.5 rounded text-md>New Project</sup>
  </div>

  <div ml2 p2>

  * WYSIWYG drawing on a whiteboard
  * Frame transitions & diagram morphing
  * Embeddable and exportable

  </div>
</div>

<div v-click w="2/3" m-auto bg-fuchsia:10 border="~ fuchsia/50 rounded-lg">
  <div flex="~ items-center gap-2" bg-fuchsia:10 px4 py2 rounded text-md>
    <span id="card-anipres-slidev-addon-title">
      Anipres addon for Slidev
    </span>
    <sup text-fuchsia-500 bg-fuchsia:15 px1.5 rounded text-md>New Project</sup>
  </div>

  <div ml2 p2>

  * Embeddable in Slidev
  * Integrated slide transitions
  * Take advantages of both Anipres and Slidev

  </div>
</div>


<div v-click w="2/3" m-auto flex="~ col gap-2" text-xl>

<div flex="~ items-center gap-2">

  <div i-carbon-logo-github/>

  <a href="https://github.com/whitphx/anipres" target="_blank" border-0 font-mono opacity-80>
    whitphx/anipres
  </a>

</div>


<div flex="~ items-center gap-2">

  <div i-carbon-link />

  <a href="https://anipres.app" target="_blank" border-0 font-mono opacity-80>
    anipres.app
  </a>

</div>

</div>


</div>
