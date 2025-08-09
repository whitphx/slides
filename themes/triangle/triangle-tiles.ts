import { computed, Ref } from "vue";
import { slideWidth, slideHeight } from "@slidev/client";
import Delaunator from "delaunator";
import seedrandom from "seedrandom";

// Inspired by https://github.com/ImBaedin/Thpace

export interface Point {
  x: number;
  y: number;
}
export type TriangleVertices = [Point, Point, Point];
export interface Triangle {
  points: TriangleVertices;
  color: string;
}

/**
 * @description Better rounding function that returns a number
 * @param value Value to round
 * @param decimals How many decimal places to round to
 * @returns Float rounded to the specified decimal place
 */
function round(value: number, decimals: number) {
  return Number(Math.round(+(value + "e" + decimals)) + "e-" + decimals);
}

interface TriangleTilesOptions {
  triangleSize: number;
  bleed: number;
  noise: number;
  globalSeed: string;
  perturbationSeedRef: Ref<string | number>;
}
export function useTriangleTiles(
  options: TriangleTilesOptions,
  colorGetter: (point: Point) => string,
) {
  function getTriangleColor(vertices: TriangleVertices): string {
    const centroid = {
      x: (vertices[0].x + vertices[1].x + vertices[2].x) / 3,
      y: (vertices[0].y + vertices[1].y + vertices[2].y) / 3,
    };
    return colorGetter(centroid);
  }

  const { triangleSize, bleed, noise } = options;

  const points = computed(() => {
    const points: Point[] = [];
    for (let x = -bleed; x < slideWidth.value + bleed * 2; x += triangleSize) {
      for (
        let y = -bleed;
        y < slideHeight.value + bleed * 2;
        y += triangleSize
      ) {
        points.push({
          x,
          y,
        });
      }
    }
    return points;
  });

  const initialNoiseRng = seedrandom(options.globalSeed);

  const pointsWithNoise = computed(() => {
    function getRandomNumber(min: number, max: number) {
      return initialNoiseRng() * (max - min) + min;
    }

    return points.value.map((p) => {
      const xNoise = getRandomNumber(-0.5, 0.5);
      const yNoise = getRandomNumber(-0.5, 0.5);
      return [round(p.x + xNoise * noise, 14), round(p.y + yNoise * noise, 14)];
    });
  });

  const vertexIndexes = computed(() => {
    return Delaunator.from(pointsWithNoise.value).triangles;
  });

  const triangles = computed(() => {
    const perSlideRng = seedrandom(String(options.perturbationSeedRef.value));
    const pointsWithPerSlideNoise: [number, number][] =
      pointsWithNoise.value.map((p) => [
        p[0] + perSlideRng() * noise,
        p[1] + perSlideRng() * noise,
      ]);

    const triangles: Triangle[] = [];
    for (let i = 0; i < vertexIndexes.value.length; i += 3) {
      const idx0 = vertexIndexes.value[i];
      const idx1 = vertexIndexes.value[i + 1];
      const idx2 = vertexIndexes.value[i + 2];
      const p0 = pointsWithPerSlideNoise[idx0];
      const p1 = pointsWithPerSlideNoise[idx1];
      const p2 = pointsWithPerSlideNoise[idx2];
      const vertices: TriangleVertices = [
        { x: p0[0], y: p0[1] },
        { x: p1[0], y: p1[1] },
        { x: p2[0], y: p2[1] },
      ];

      triangles.push({
        points: vertices,
        color: getTriangleColor(vertices),
      });
    }

    return triangles;
  });

  return triangles;
}
