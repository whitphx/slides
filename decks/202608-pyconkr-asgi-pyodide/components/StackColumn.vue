<script setup>
defineProps({
  title: { type: String, required: true },
  env: { type: String, default: "" },
  layers: { type: Array, required: true },
})

const kindClass = {
  app: "border border-emerald-400/60 bg-emerald-400/10",
  framework: "border border-violet-400/60 bg-violet-400/10",
  caller: "border border-sky-400/60 bg-sky-400/10",
  runtime: "border border-gray-400/50 bg-gray-400/10",
  frontend: "border border-teal-400/50 bg-teal-400/10",
}
</script>

<template>
  <div class="border border-gray-400/40 rounded-xl p-3 bg-gray-400/5 text-center">
    <div class="font-bold text-sm mb-0.5">{{ title }}</div>
    <div v-if="env" class="text-xs op60 mb-2">{{ env }}</div>
    <div class="flex flex-col gap-1.5">
      <template v-for="layer in layers" :key="layer.label">
        <div v-if="layer.kind === 'transport'" class="text-xs op70 leading-tight py-0.5">
          <span aria-hidden="true">⇅</span> {{ layer.label }}
          <div v-if="layer.note" class="op70">{{ layer.note }}</div>
        </div>
        <div v-else class="rounded-lg px-2 py-1.5 leading-tight" :class="[kindClass[layer.kind], layer.dim ? 'op50' : '']">
          <div class="text-sm font-600">{{ layer.label }}</div>
          <div v-if="layer.note" class="text-xs op70">{{ layer.note }}</div>
        </div>
      </template>
    </div>
  </div>
</template>
