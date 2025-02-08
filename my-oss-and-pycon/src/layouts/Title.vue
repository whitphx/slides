<!--
Based on:
- https://freefrontend.com/css-glow-effects/
- https://codepen.io/DedaloD/pen/qBgmovJ
-->

<script setup lang="ts">
import { useDarkMode } from "@slidev/client";

const { isDark } = useDarkMode();
</script>

<template>
  <section :class="['wrapper', { dark: isDark }]">
    <div class='hero'>
    </div>
    <div class='content'>
      <slot />
    </div>
  </section>
</template>

<style>
/*houdini*/
@property --blink-opacity {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

/* #fallback @keyframes blink-animation {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}*/

@keyframes blink-animation {
  0%,
  100% {
    opacity: var(--blink-opacity, 1);
  }
  50% {
    opacity: 0;
  }
}
/*houdini*/

/*base*/
.wrapper {
  --stripe-color: #fff;
  --bg: var(--stripe-color);
  --maincolor: var(--bg);
}

/*custom*/
@keyframes smoothBg {
  from {
    background-position: 50% 50%, 50% 50%;
  }
  to {
    background-position: 350% 50%, 350% 50%;
  }
}

.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.hero {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  position: relative;
  display: flex;
  place-content: center;
  place-items: center;
  --stripes: repeating-linear-gradient(
    100deg,
    var(--stripe-color) 0%,
    var(--stripe-color) 7%,
    transparent 10%,
    transparent 12%,
    var(--stripe-color) 16%
  );

  --rainbow: repeating-linear-gradient(
    100deg,
    #60a5fa 10%,
    #e879f9 15%,
    #60a5fa 20%,
    #5eead4 25%,
    #60a5fa 30%
  );
  background-image: var(--stripes), var(--rainbow);
  background-size: 300%, 200%;
  background-position: 50% 50%, 50% 50%;

  filter: blur(10px) invert(100%);

  mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--stripes), var(--rainbow);
    background-size: 200%, 100%;
    animation: smoothBg 60s linear infinite;
    background-attachment: fixed;
    mix-blend-mode: difference;
  }
}

.wrapper.dark {
  --stripe-color: #000;
}
.dark .hero,
.dark .hero::after {
  filter: blur(10px) opacity(50%) saturate(200%);
}
.wrapper:not(.dark) .content {
  filter: invert(1);
}

.content {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  place-content: center;
  place-items: center;
  flex-flow: column;
  gap: 4.5%;
  text-align: center;
  mix-blend-mode: difference;
  -webbkit-mix-blend-mode: difference;
}

h1 {
  font-size: calc(1rem - -5vw);
  position: relative;
}

/*challenge*/
h1::before {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  background: white;
  text-shadow: 0 0 1px #ffffff;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-color: white;
  -webkit-mask: linear-gradient(#000 0 0) luminance;
  mask: linear-gradient(#000 0 0) luminance, alpha;
  backdrop-filter: blur(19px) brightness(12.5);
  -webkit-text-stroke: 1px white;
  display: flex;
  margin: auto;
  z-index: 1;
  pointer-events: none;
}

</style>
