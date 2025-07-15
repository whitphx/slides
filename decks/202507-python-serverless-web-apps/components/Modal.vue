<template>
  <div border="~ sky/50 rounded-lg" from-sky:10 to-indigo:10 bg-gradient-to-br :w="w">
    <div flex gap-2 items-center bg-sky:10 px4 py2 rounded text-md>
      <span grow>
        {{ title }}
      </span>
      <sup v-if="badge" class="text-sky-500 bg-sky-500/15 px-2 py-1 rounded text-md">
        {{ badge }}
      </sup>
    </div>
    <div class="ml-2 p-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  badge?: string
  w?: string
}

defineProps<Props>()
</script>
