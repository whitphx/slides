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
      <div w="100%" p-16 :backdrop-blur="isDark ? 24 : 48">
        <slot />
      </div>
    </div>
  </section>
</template>

<style>
.wrapper {
  --stripe-color: #fff;
}
.wrapper.dark {
  --stripe-color: #000;
}

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

  filter:
    blur(10px)
    opacity(50%)
    saturate(200%) /* Make the color more vivid */
    invert(100%) /* Make the color for light mode */
    ;

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
.dark .hero {
  filter:
    blur(10px)
    opacity(50%)
    saturate(200%) /* Make the color more vivid */
    ;
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
}

h1 {
  font-size: 5rem;
}
h2 {
  font-size: 2.5rem;
}
h3 {
  font-size: 2.0rem;
}
p {
  font-size: 1.5rem;
}
</style>
