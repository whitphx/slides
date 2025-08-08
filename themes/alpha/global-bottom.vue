<!--
Based on:
- https://freefrontend.com/css-glow-effects/
- https://codepen.io/DedaloD/pen/qBgmovJ
-->

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDarkMode, useNav, slideWidth, slideHeight } from "@slidev/client";

const { isDark } = useDarkMode();
const { currentSlideNo } = useNav();

const isCover = computed(() => {
  return currentSlideNo.value === 1;
});

const randomMask1 = ref(false);
const randomMask2 = ref(false);
const randomMask3 = ref(false);
watch(currentSlideNo, (newSlideNo) => {
  randomMask1.value = newSlideNo % 2 === 0;
  randomMask2.value = newSlideNo % 3 === 0;
  randomMask3.value = newSlideNo % 5 === 0;
});
</script>

<template>
  <section
    :class="['wrapper', { dark: isDark, cover: isCover }]"
    :style="{
      '--slide-width': `${slideWidth}px`,
      '--slide-height': `${slideHeight}px`,
      '--mask-color-1': isCover ? 'black' : randomMask1 ? 'transparent' : 'rgb(0 0 0 / 0.5)',
      '--mask-color-2': isCover ? 'black' : randomMask2 ? 'transparent' : 'rgb(0 0 0 / 0.5)',
      '--mask-color-3': isCover ? 'black' : randomMask3 ? 'transparent' : 'rgb(0 0 0 / 0.5)',
    }">
    <div class='hero'>
    </div>
  </section>
</template>

<style>
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

@property --accent-color {
    syntax: "<color>";
    inherits: true;
    initial-value: transparent;
}
@property --stripe-color {
    syntax: "<color>";
    inherits: true;
    initial-value: transparent;
}
@property --mask-edge-color {
    syntax: "<color>";
    inherits: true;
    initial-value: transparent;
}
@property --mask-color-1 {
    syntax: "<color>";
    inherits: true;
    initial-value: transparent;
}
@property --mask-color-2 {
    syntax: "<color>";
    inherits: true;
    initial-value: transparent;
}
@property --mask-color-3 {
    syntax: "<color>";
    inherits: true;
    initial-value: transparent;
}

.hero {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  place-content: center;
  place-items: center;

  transition:
    all 1.0s ease-in-out,
    --accent-color 1.0s ease-in-out,
    --stripe-color 1.0s ease-in-out,
    --mask-edge-color 1.0s ease-in-out,
    --mask-color-1 1.0s ease-in-out,
    --mask-color-2 1.0s ease-in-out,
    --mask-color-3 1.0s ease-in-out
    ;

  --blur: 50px;
  --opacity: 50%;
  --accent-color: #60a5fa;
  --stripe-color: #fff;
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
    #60a5fa 14%,
    var(--accent-color) 15%,
    #60a5fa 16%,
    #60a5fa 20%,
    #5eead4 25%,
    #60a5fa 30%
  );
  .dark & {
    --stripe-color: #000;
  }
  .cover & {
    --blur: 10px;
    --opacity: 1;
    --accent-color: #e879f9;
  }
  background-image: var(--stripes), var(--rainbow);
  background-size: 300%, 200%;
  background-position: 50% 50%, 50% 50%;

  filter:
    blur(var(--blur))
    opacity(var(--opacity))
    saturate(200%) /* Make the color more vivid */
    ;

  --mask-edge-color: black;
  .cover & {
    --mask-edge-color: transparent;
  }
  mask-repeat: no-repeat;
  mask-image:
    radial-gradient(ellipse at 100% 0, black 50%, var(--mask-edge-color) 90%),  /* Mask for the cover slide */
    /*
    Masks for non-cover slides that generates random patterns.
    You can customize/add the patterns for more variety and better aesthetics.
    */
    repeating-linear-gradient(
      20deg,
      black 5%,
      black 14%,
      var(--mask-color-1) 27%,
      var(--mask-color-1) 33%,
      black 80%
    ),
    repeating-linear-gradient(
      60deg,
      var(--mask-color-2) 0%,
      var(--mask-color-2) 7%,
      black 27%,
      black 33%,
      var(--mask-color-2) 70%
    ),
    repeating-linear-gradient(
      140deg,
      black 0%,
      black 6%,
      var(--mask-color-3) 27%,
      var(--mask-color-3) 48%,
      black 70%
    )
    ;
  mask-composite: intersect;
  mask-size: var(--slide-width) var(--slide-height);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--stripes), var(--rainbow);
    background-size: 200%, 100%;
    animation: smoothBg 60s linear infinite;
    background-attachment: fixed;
    mix-blend-mode: darken;
  }
  .dark & {
    &::after {
      mix-blend-mode: lighten;
    }
  }
}
</style>
