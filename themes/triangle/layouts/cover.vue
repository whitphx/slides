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
    <div class="content">
      <slot />
    </div>
  </section>
</template>

<style>
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
  transform: translateY(-5%);
}

h1 {
  font-size: 5rem;
  color: var(--slidev-theme-primary);
}
h2 {
  font-size: 2.5rem;
}
h3 {
  font-size: 2rem;
}
p {
  font-size: 1.5rem;
}
</style>
