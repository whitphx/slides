<script setup>
import { computed } from "vue";

const props = defineProps({
  // [{ key, label, hidden? }] — one entry per column, in display order.
  columns: { type: Array, required: true },
});

// Keep the visible columns centered while the hidden ones wait off to the side.
const offset = computed(() => {
  const hidden = props.columns.filter((column) => column.hidden).length;
  return (hidden / 2 / props.columns.length) * 100;
});
</script>

<template>
  <div
    class="stack-compare"
    :style="{
      gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
      transform: offset ? `translateX(${offset}%)` : 'none',
    }"
  >
    <div v-for="column in columns" :key="column.key" class="stack-cell" :class="column.hidden ? 'op0' : ''">
      <div class="text-center text-sm font-600 op70 mb-1">{{ column.label }}</div>
      <slot :name="column.key" />
    </div>
  </div>
</template>

<style scoped>
.stack-compare {
  display: grid;
  gap: 1rem;
  transition: transform 700ms ease;
}
.stack-cell {
  min-width: 0;
  transition: opacity 700ms ease 250ms;
}
</style>
