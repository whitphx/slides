<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  // The sample app's URL. Served over http from localhost, so present from
  // `pnpm dev` rather than the deployed https deck: browsers disagree about
  // whether an http://localhost iframe counts as mixed content.
  url: { type: String, required: true },
  // Height of the page inside the window, not of the window itself.
  height: { type: String, default: "100%" },
  // How long the port gets to answer before the slide falls back.
  timeout: { type: Number, default: 600 },
});

// Long enough to read as the window lifting off the slide, short enough not to
// hold up a demo. Drives both the CSS transition and the un-teleport below, so
// the two cannot drift apart.
const DURATION = 280;
// How far the filled window stays clear of the slide's edges.
const MARGIN = 8;

const live = ref(false);
const expanded = ref(false);
const host = ref(null);
const overlay = ref(null);
// Expanding covers the slide rather than the screen, which keeps the deck's own
// frame visible and makes the way back obvious. The slide root is the only
// ancestor that is both positioned and the right size, and the window mockup in
// between clips its overflow, so the widget teleports out to it.
const slideRoot = ref(null);
// The box the window occupies, in slide coordinates. Animating it from its place
// on the slide out to the whole slide is what makes the window appear to grow
// rather than to be replaced.
const geometry = ref(null);
// Height held open where the window came from: the slide has to keep its shape
// while the window is away, or there would be nothing to shrink back onto.
const reserved = ref(null);
let collapseTimer = null;
let cancelled = false;

function motionDuration() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : DURATION;
}

const overlayStyle = computed(() => {
  const box = geometry.value;
  if (!box) return null;
  return {
    top: `${box.top}px`,
    left: `${box.left}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    transitionDuration: `${motionDuration()}ms`,
  };
});

// Slidev scales the slide to the window, so measured pixels have to be divided
// back out before they can be written as slide coordinates.
function slideScale(root, rootRect) {
  return root.offsetWidth ? rootRect.width / root.offsetWidth : 1;
}

// Where the window sits when it is part of the slide. Measured from the host,
// which stays behind holding the space, so it stays correct in both directions.
function homeBox() {
  const root = slideRoot.value;
  const rootRect = root.getBoundingClientRect();
  const scale = slideScale(root, rootRect);
  const box = host.value.getBoundingClientRect();
  return {
    top: (box.top - rootRect.top) / scale,
    left: (box.left - rootRect.left) / scale,
    width: box.width / scale,
    height: box.height / scale,
  };
}

function filledBox() {
  const root = slideRoot.value;
  return {
    top: MARGIN,
    left: MARGIN,
    width: root.offsetWidth - MARGIN * 2,
    height: root.offsetHeight - MARGIN * 2,
  };
}

async function expand() {
  clearTimeout(collapseTimer);
  const home = homeBox();
  reserved.value = home.height;
  geometry.value = home;
  expanded.value = true;
  await nextTick();
  // Measure to settle the starting box before changing it, or the two land in
  // one style recalculation and the box jumps to full size without animating.
  overlay.value?.getBoundingClientRect();
  geometry.value = filledBox();
}

function collapse() {
  if (!expanded.value) return;
  geometry.value = homeBox();
  // Teleport back only once the window has shrunk onto the space held for it, so
  // the handover happens where the two positions coincide.
  collapseTimer = setTimeout(() => {
    expanded.value = false;
    geometry.value = null;
    reserved.value = null;
  }, motionDuration());
}

function onKeydown(event) {
  if (event.key === "Escape") collapse();
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
  clearTimeout(collapseTimer);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="host" class="live-embed-host" :style="{ height: reserved ? `${reserved}px` : undefined }">
    <Teleport :to="slideRoot" :disabled="!expanded">
      <div
        ref="overlay"
        class="live-embed"
        :class="{ 'live-embed--expanded': expanded }"
        :style="expanded ? overlayStyle : undefined"
      >
        <!-- The window belongs to the widget rather than to the slide around it,
             so it comes along when the widget leaves for the slide root, and one
             iframe serves both places: expanding never reloads the demo. -->
        <WindowMockup :title="url" light>
          <iframe
            v-if="live"
            :src="url"
            :title="url"
            class="live-embed__frame"
            :style="{ height: expanded ? '100%' : height }"
          />
          <slot v-else />
        </WindowMockup>
        <button
          v-if="live && !expanded"
          type="button"
          class="live-embed__expand"
          aria-label="Fill the slide with this app"
          @click.stop="expand"
        >
          <div i-ri-fullscreen-line />
        </button>
        <button
          v-else-if="expanded"
          type="button"
          class="live-embed__return"
          @click.stop="collapse"
        >
          <div i-ri-arrow-go-back-line />
          <span>Return</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.live-embed-host {
  width: 100%;
}
.live-embed {
  position: relative;
  width: 100%;
}
/* The animation starts from the host's box, so the window has to fill it exactly
   rather than float inside a margin. */
.live-embed :deep(figure.wrap) {
  margin: 0;
}
.live-embed--expanded {
  position: absolute;
  z-index: 40;
  transition-property: top, left, width, height;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
/* The addon sizes itself to its content; filling the slide means stretching the
   window and letting its body take the remaining height. */
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
  top: 4px;
  right: 10px;
  padding: 0.25rem;
  border-radius: 0.375rem;
  /* Sized against the title bar it sits on rather than the slide's body text. */
  font-size: 16px;
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
/* Always visible: leaving is the one thing that must never be a guess. Sits on
   the title bar, like the button it replaces, where both read as controls of the
   window rather than as marks on the page. */
.live-embed__return {
  top: 4px;
  right: 10px;
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
