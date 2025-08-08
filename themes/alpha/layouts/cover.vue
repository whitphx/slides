<script setup lang="ts">
import { useDarkMode } from "@slidev/client";

const { isDark } = useDarkMode();
</script>

<template>
  <div class='content'>
    <div w="100%" p-16 :backdrop-blur="isDark ? 24 : 48" bg-white:10>
      <slot />
    </div>
  </div>
</template>

<style>
.content {
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
