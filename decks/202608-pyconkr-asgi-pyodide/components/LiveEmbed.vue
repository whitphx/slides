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
const expanded = ref(false);
const host = ref(null);
// Expanding covers the slide rather than the screen, which keeps the deck's own
// frame visible and makes the way back obvious. The slide root is the only
// ancestor that is both positioned and the right size, and the window mockup in
// between clips its overflow, so the widget teleports out to it.
const slideRoot = ref(null);
let cancelled = false;

function onKeydown(event) {
  if (event.key === "Escape" && expanded.value) {
    expanded.value = false;
  }
}

onMounted(async () => {
  slideRoot.value = host.value?.closest(".slidev-page") ?? document.body;
  window.addEventListener("keydown", onKeydown);
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
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="host" class="live-embed-host" :style="{ height: live && !expanded ? height : undefined }">
    <template v-if="live">
      <Teleport :to="slideRoot" :disabled="!expanded">
        <div class="live-embed" :class="{ 'live-embed--expanded': expanded }">
          <!-- Expanding leaves the slide's own frame behind, so the overlay brings
               its own: filling the slide should still look like a browser. -->
          <WindowMockup v-if="expanded" :title="url" light padding="0">
            <iframe :src="url" :title="url" class="live-embed__frame" />
          </WindowMockup>
          <iframe v-else :src="url" :title="url" class="live-embed__frame" />
          <button
            v-if="!expanded"
            type="button"
            class="live-embed__expand"
            aria-label="Fill the slide with this app"
            @click.stop="expanded = true"
          >
            <div i-ri-fullscreen-line />
          </button>
          <button
            v-else
            type="button"
            class="live-embed__return"
            @click.stop="expanded = false"
          >
            <div i-ri-arrow-go-back-line />
            <span>Return</span>
          </button>
        </div>
      </Teleport>
    </template>
    <slot v-else />
  </div>
</template>

<style scoped>
.live-embed-host {
  width: 100%;
}
.live-embed {
  position: relative;
  width: 100%;
  height: 100%;
  /* The page inside is white, so it must not sit on the theme's dark ground. */
  background: #fff;
}
.live-embed--expanded {
  position: absolute;
  inset: 0;
  z-index: 40;
  /* The window frame carries its own ground, so the overlay does not need one,
     and a small inset keeps the frame off the slide's edges. */
  background: transparent;
  padding: 0.5rem;
}
/* The addon sizes itself to its content; filling the slide means stretching the
   frame and letting its body take the remaining height. */
.live-embed--expanded :deep(figure.wrap) {
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
}
.live-embed--expanded :deep(figure.wrap > .body) {
  flex: 1 1 auto;
  min-height: 0;
}
.live-embed__frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
.live-embed__expand,
.live-embed__return {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #1f2937;
  background: rgb(255 255 255 / 0.8);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
  backdrop-filter: blur(2px);
  cursor: pointer;
}
.live-embed__expand {
  top: 0.25rem;
  right: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.375rem;
  /* Kept out of the way of the presentation until wanted. Revealed on focus too,
     and shown unconditionally where there is no cursor to hover with. */
  opacity: 0;
  /* Invisible must also mean inert, or a click aimed at the app underneath would
     expand the widget instead. */
  pointer-events: none;
  transition: opacity 150ms ease;
}
.live-embed:hover .live-embed__expand,
.live-embed:focus-within .live-embed__expand {
  opacity: 1;
  pointer-events: auto;
}
@media (hover: none) {
  .live-embed__expand {
    opacity: 1;
    pointer-events: auto;
  }
}
/* Always visible: leaving is the one thing that must never be a guess. Offset
   past the overlay's own padding so it lands inside the window's title bar,
   where it reads as one of that window's controls. */
.live-embed__return {
  top: 0.9rem;
  right: 1.125rem;
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 16px;
  line-height: 1.15;
  font-weight: 600;
}
.live-embed__expand:hover,
.live-embed__expand:focus-visible,
.live-embed__return:hover,
.live-embed__return:focus-visible {
  background: rgb(255 255 255 / 0.97);
}
</style>
