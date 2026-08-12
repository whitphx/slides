<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  // The sample app's URL. Served over http from localhost, so present from
  // `pnpm dev` rather than the deployed https deck: browsers disagree about
  // whether an http://localhost iframe counts as mixed content.
  url: { type: String, required: true },
  // Height of the page inside the window, not of the window itself.
  height: { type: String, default: "100%" },
  // How much to shrink the page while the window sits on the slide, so more of
  // the app fits the space it is given. The filled window always shows it at
  // full size, which is the point of filling the slide.
  zoom: { type: Number, default: 1 },
  // How long the url gets to answer before the slide settles for the fallback.
  // Generous because the fallback is what shows while the probe is in flight, so
  // waiting costs nothing, while being impatient costs the live app: a first
  // request to a remote host pays DNS and TLS before it answers at all.
  timeout: { type: Number, default: 2500 },
  // Shown in the title bar. Defaults to the url, which is what a browser would
  // show, but a url carrying query parameters reads badly on a slide.
  title: { type: String, default: "" },
  // Passed to the window: pin it white for a page that is white whatever the
  // deck's theme, leave it off for an app that follows the theme too.
  light: { type: Boolean, default: false },
  // Passed to the window: the gutter between the frame and the page inside.
  padding: { type: String, default: undefined },
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
// between clips its overflow, so the widget moves out to it and back.
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

// Zoom multiplies the lengths on the iframe as well as scaling the page inside
// it, so the height has to be specified that much larger to end up the height it
// was asked for. Its width is a percentage, which zoom leaves alone.
const frameStyle = computed(() => {
  const zoom = expanded.value ? 1 : props.zoom;
  return {
    zoom,
    height: expanded.value ? "100%" : `calc(${props.height} / ${zoom})`,
  };
});

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

// Re-parenting an iframe reloads it, whatever the element's identity, which for a
// demo that boots Pyodide means watching it boot again. An atomic move keeps the
// document alive; where the browser has no such move, the reload is the old
// behaviour rather than a new failure.
function moveTo(parent) {
  const el = overlay.value;
  if (!el || el.parentElement === parent) return;
  if (typeof parent.moveBefore === "function") {
    try {
      parent.moveBefore(el, null);
      return;
    } catch {
      // Falls through to the reparenting move below.
    }
  }
  parent.appendChild(el);
}

async function expand() {
  clearTimeout(collapseTimer);
  const home = homeBox();
  reserved.value = home.height;
  geometry.value = home;
  expanded.value = true;
  moveTo(slideRoot.value);
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
    moveTo(host.value);
    expanded.value = false;
    geometry.value = null;
    reserved.value = null;
  }, motionDuration());
}

function onKeydown(event) {
  if (event.key === "Escape") collapse();
}

// A page served from anywhere but the machine itself has no business reaching that
// machine's ports: browsers now ask the viewer for permission first, so a deployed
// deck would greet its readers with a loopback-access prompt for an app that is not
// running anyway. The fallback is the right answer there.
function reachable() {
  const loopback = (hostname) =>
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost");
  return !loopback(new URL(props.url, location.href).hostname) || loopback(location.hostname);
}

onMounted(async () => {
  slideRoot.value = host.value?.closest(".slidev-page") ?? document.body;
  window.addEventListener("keydown", onKeydown);
  if (!reachable()) return;
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
  // Hand the widget back before Vue tears the slide down, so it is unmounted from
  // where it was rendered.
  if (host.value) moveTo(host.value);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="host" class="live-embed-host" :style="{ height: reserved ? `${reserved}px` : undefined }">
    <div
      ref="overlay"
      class="live-embed"
      :class="{ 'live-embed--expanded': expanded }"
      :style="expanded ? overlayStyle : undefined"
    >
      <!-- The window belongs to the widget rather than to the slide around it,
           so it comes along when the widget leaves for the slide root, and one
           iframe serves both places: expanding never reloads the demo. -->
      <WindowMockup :title="title || url" :light="light" :padding="padding">
        <iframe
          v-if="live"
          :src="url"
          :title="url"
          class="live-embed__frame"
          :style="frameStyle"
        />
        <slot v-else />
      </WindowMockup>
      <div v-if="live" class="live-embed__controls">
        <!-- For driving the app itself: a tab has a real address bar, devtools,
             and survives leaving the slide. -->
        <a
          class="live-embed__control"
          :href="url"
          target="_blank"
          rel="noopener"
          aria-label="Open this app in a new tab"
          @click.stop
        >
          <div i-ri-external-link-line />
        </a>
        <!-- One control in one place for both directions, so the way back is
             where the way in was. -->
        <button
          type="button"
          class="live-embed__control"
          :aria-label="expanded ? 'Return this app to its place on the slide' : 'Fill the slide with this app'"
          @click.stop="expanded ? collapse() : expand()"
        >
          <div :class="expanded ? 'i-ri-fullscreen-exit-line' : 'i-ri-fullscreen-line'" />
        </button>
      </div>
    </div>
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
/* Sit at the right end of the title bar, where they read as controls of the
   window rather than as marks on the page. */
.live-embed__controls {
  position: absolute;
  top: 4px;
  right: 10px;
  display: flex;
  gap: 0.25rem;
  /* Kept out of the way of the presentation until wanted. Revealed on focus too,
     and shown unconditionally where there is no cursor to hover with. */
  opacity: 0;
  /* Invisible must also mean inert, or a click aimed at the app underneath would
     hit a control instead. */
  pointer-events: none;
  transition: opacity 150ms ease;
}
/* The title bar is the window's chrome, so that is where reaching for a control
   belongs. Hovering the app itself does not raise them, which matters most when
   the app fills the slide and every stray movement is over it. */
.live-embed:has(.titlebar:hover) .live-embed__controls,
.live-embed__controls:hover,
.live-embed:focus-within .live-embed__controls {
  opacity: 1;
  pointer-events: auto;
}
@media (hover: none) {
  .live-embed__controls {
    opacity: 1;
    pointer-events: auto;
  }
}
.live-embed__control {
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 0.375rem;
  color: #1f2937;
  background: rgb(255 255 255 / 0.8);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
  backdrop-filter: blur(2px);
  cursor: pointer;
  /* Sized against the title bar it sits on rather than the slide's body text. */
  font-size: 16px;
  /* Links in this deck carry a dashed underline and turn primary on hover; a
     control should do neither. Zero width rather than `border: none`, because the
     theme restores the style on hover and a style alone can revive a border. */
  border-width: 0;
  text-decoration: none;
}
.live-embed .live-embed__control:hover,
.live-embed .live-embed__control:focus-visible {
  background: rgb(255 255 255 / 0.97);
  color: #1f2937;
}
</style>
