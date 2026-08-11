<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  // The sample app's URL. Served over http from localhost, so present from
  // `pnpm dev` rather than the deployed https deck: browsers disagree about
  // whether an http://localhost iframe counts as mixed content.
  url: { type: String, required: true },
  height: { type: String, default: "100%" },
  // How long the port gets to answer before the slide falls back.
  timeout: { type: Number, default: 600 },
});

const live = ref(false);
const frame = ref(null);
const isFullscreen = ref(false);
let cancelled = false;

function syncFullscreen() {
  isFullscreen.value = document.fullscreenElement === frame.value;
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await frame.value?.requestFullscreen();
    }
  } catch {
    // Nothing useful to do if the browser refuses; the embed stays inline.
  }
}

onMounted(async () => {
  document.addEventListener("fullscreenchange", syncFullscreen);
  try {
    // An opaque response is enough: this asks "is anything answering on that
    // port", not "what did it say". A dead port rejects.
    await fetch(props.url, {
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(props.timeout),
    });
    if (!cancelled) live.value = true;
  } catch {
    // Leave `live` false and show the fallback slot.
  }
});

onBeforeUnmount(() => {
  cancelled = true;
  document.removeEventListener("fullscreenchange", syncFullscreen);
});
</script>

<template>
  <div
    v-if="live"
    ref="frame"
    class="live-embed"
    :style="{ height: isFullscreen ? '100%' : height }"
  >
    <iframe :src="url" :title="url" class="live-embed__frame" />
    <!-- Always visible rather than revealed on hover: the presenter needs to
         find it at a glance, and a hover-only control is unreachable by
         keyboard and invisible on a touch screen. -->
    <button
      type="button"
      class="live-embed__button"
      :aria-label="isFullscreen ? 'Leave fullscreen' : 'Show this app fullscreen'"
      :aria-pressed="isFullscreen"
      @click.stop="toggleFullscreen"
    >
      <div :class="isFullscreen ? 'i-ri-fullscreen-exit-line' : 'i-ri-fullscreen-line'" />
    </button>
  </div>
  <slot v-else />
</template>

<style scoped>
.live-embed {
  position: relative;
  width: 100%;
  /* The page inside is white, so fullscreen must not letterbox it in theme dark. */
  background: #fff;
}
.live-embed__frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
.live-embed__button {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  display: flex;
  padding: 0.25rem;
  border-radius: 0.375rem;
  color: #1f2937;
  background: rgb(255 255 255 / 0.75);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  backdrop-filter: blur(2px);
  cursor: pointer;
}
.live-embed__button:hover,
.live-embed__button:focus-visible {
  background: rgb(255 255 255 / 0.95);
}
</style>
