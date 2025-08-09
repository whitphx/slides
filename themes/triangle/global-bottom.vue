<script setup lang="ts">
import { computed, ref, watch, onWatcherCleanup } from "vue";
import { useNav, slideWidth, slideHeight, configs } from "@slidev/client";
import { useTriangleTiles, type Point } from "./triangle-tiles";
import seedrandom from "seedrandom";

function mapNormalizedRange(
  normalizedValue: number,
  map0to: number,
  map1to: number,
) {
  return normalizedValue * (map1to - map0to) + map0to;
}

interface BaseRadialGradientConfig {
  x: number;
  y: number;
  rx: number;
  ry: number;
}
const currentBaseImage = ref<BaseRadialGradientConfig>({
  x: slideWidth.value / 2,
  y: slideHeight.value,
  rx: slideWidth.value / 3,
  ry: slideHeight.value / 12,
});

// Animate the base image
interface BaseRadialGradientTransition {
  data: BaseRadialGradientConfig;
  duration: number;
}
const baseGradientTransition = ref<BaseRadialGradientTransition>();
watch(
  baseGradientTransition,
  (newTransition) => {
    const start = Date.now();
    let timer: ReturnType<typeof setInterval> | undefined = undefined;
    const tick = () => {
      if (newTransition == null) {
        return;
      }

      const elapsed = Date.now() - start;
      if (elapsed >= newTransition.duration) {
        currentBaseImage.value = newTransition.data;
        clearInterval(timer);
        return;
      }

      // Interpolation
      const easingFn = (t: number) => {
        // Ease in-out cubic (implemented by Copilot)
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      const progress = elapsed / newTransition.duration;
      const easedProgress = easingFn(progress);
      const interpolate = (value: number, target: number) => {
        return value + (target - value) * easedProgress;
      };
      currentBaseImage.value = {
        x: interpolate(currentBaseImage.value.x, newTransition.data.x),
        y: interpolate(currentBaseImage.value.y, newTransition.data.y),
        rx: interpolate(currentBaseImage.value.rx, newTransition.data.rx),
        ry: interpolate(currentBaseImage.value.ry, newTransition.data.ry),
      };

      timer = setTimeout(tick, 100);
    };
    tick();

    onWatcherCleanup(() => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  },
  { immediate: true },
);

const baseColor = computed(() => {
  const color =
    configs.themeConfig.tile || configs.themeConfig.primary || "#888888";
  return color;
});

// Render each point color based on given base image.
function getPointColor(base: BaseRadialGradientConfig, point: Point): string {
  const x = (point.x - base.x) / base.rx;
  const y = (point.y - base.y) / base.ry;
  const normL1 = (Math.abs(x) + Math.abs(y)) / 2;
  const alpha = mapNormalizedRange(normL1, 0.5, 0);
  return `rgb(from ${baseColor.value} r g b / ${alpha})`;
}

const { currentSlideNo } = useNav();

const triangles = useTriangleTiles(
  {
    triangleSize: 60,
    bleed: 120,
    noise: 30,
    globalSeed: "hello",
    perturbationSeedRef: currentSlideNo,
  },
  (point: Point) => getPointColor(currentBaseImage.value, point),
);

// Animate the base image on slide changes
watch(
  currentSlideNo,
  () => {
    const rng = seedrandom(currentSlideNo.value.toString());

    const isCover = currentSlideNo.value === 1;
    if (isCover) {
      let timer: ReturnType<typeof setTimeout> | undefined = undefined;
      const setNextDestination = () => {
        const x = Math.random() * slideWidth.value;
        const y =
          Math.random() > 0.5
            ? (slideHeight.value * 11) / 12
            : slideHeight.value / 12; // Stick to top or bottom edge.
        const rx = mapNormalizedRange(
          Math.random(),
          slideWidth.value / 12,
          slideWidth.value / 3,
        );
        const ry = mapNormalizedRange(
          Math.random(),
          slideHeight.value / 12,
          slideHeight.value / 8,
        );
        baseGradientTransition.value = {
          data: { x, y, rx, ry },
          duration: 10000,
        };
        timer = setTimeout(setNextDestination, 10000);
      };
      setNextDestination();
      onWatcherCleanup(() => {
        if (timer) {
          clearTimeout(timer);
        }
      });
    } else {
      // Place the base gradient shape within the right-bottom area with a random perturbation per slide.
      const ratio = rng();
      const x = mapNormalizedRange(
        ratio,
        (slideWidth.value * 2) / 3,
        slideWidth.value,
      );
      const y = slideHeight.value;
      const rx = slideWidth.value / 3;
      const ry = mapNormalizedRange(
        ratio,
        slideHeight.value / 24,
        slideHeight.value / 6,
      );
      baseGradientTransition.value = {
        data: { x, y, rx, ry },
        duration: 3000,
      };
    }
  },
  { immediate: true },
);
</script>

<template>
  <div pointer-events-none z-index="-10" aria-hidden="true">
    <div
      v-for="(triangle, index) in triangles"
      :key="index"
      class="triangle"
      :style="{
        'clip-path': `polygon(${triangle.points.map((p) => `${p.x}px ${p.y}px`).join(', ')})`,
        'background-color': triangle.color,
      }"
    ></div>
  </div>
</template>

<style scoped>
.triangle {
  position: absolute;
  inset: 0;
  transition:
    clip-path 3s ease-in-out,
    background-color 0.3s ease-in-out;
}
</style>
