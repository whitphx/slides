<script setup lang="ts">
/* global __SLIDEV_REVIEW_ANNOTATIONS__, __SLIDEV_REVIEW_ANNOTATIONS_ENABLED__ -- defined by setup/vite-plugins.ts */
import { computed, onBeforeUnmount, watch } from 'vue'
import { useNav } from '@slidev/client'
import type { Annotation, AnnotationInstance, BeforeAnnotationCreateData } from 'agent-ui-annotation/vanilla'
import { checkCanCreate, createMarkerFilter, createSync, slidePosition, sourceLocation } from './src/client'
import type { SlideContext } from './src/client'
import { createDispatchControl } from './src/dispatch-ui'

const config = __SLIDEV_REVIEW_ANNOTATIONS__
const nav = useNav()
const sync = createSync(config)

// Only in the audience view: not in print/export, the presenter view or embeds.
const visible = computed(() => config.enabled && nav.isPlaying.value
  && !nav.isPrintMode.value && !nav.isPresenter.value && !nav.isEmbedded.value)

async function beforeCreate(data: BeforeAnnotationCreateData) {
  // Refuse the note before the toolbar stores it, rather than keep one the server rejects.
  if (!await checkCanCreate(config))
    return { cancel: true }
  const slide = nav.currentSlideRoute.value.meta?.slide
  const context: SlideContext = {
    deck: config.deck,
    url: window.location.href,
    slide: nav.currentSlideNo.value,
    click: nav.clicks.value,
    clicksTotal: nav.clicksTotal.value,
    title: slide?.title,
    sourceFile: sourceLocation(config, slide?.filepath, slide?.start),
    ...slidePosition(data.clickX, data.clickY),
  }
  return { context: { slidev: context } }
}

// The toolbar is a custom element appended to <body>, outside the scaled slide
// container, so its fixed positioning is relative to the viewport.
let toolbar: AnnotationInstance | undefined
let markers: ReturnType<typeof createMarkerFilter> | undefined
let dispatcher: ReturnType<typeof createDispatchControl> | undefined

function refreshMarkers() {
  if (toolbar && markers)
    markers.apply(toolbar.element, nav.currentSlideNo.value)
}

async function saved(annotation: Annotation) {
  markers?.remember(annotation)
  await sync.save(annotation)
  await dispatcher?.changed()
}

async function removed(id: string) {
  markers?.forget(id)
  await sync.remove(id)
  await dispatcher?.changed()
}

watch(nav.currentSlideNo, refreshMarkers)

watch(visible, async (show) => {
  // A compile-time constant: builds without annotations drop the toolbar import entirely.
  if (!__SLIDEV_REVIEW_ANNOTATIONS_ENABLED__)
    return
  if (show && !toolbar) {
    const { createAnnotation } = await import('agent-ui-annotation/vanilla')
    if (toolbar || !visible.value)
      return
    markers = createMarkerFilter(config.deck)
    toolbar = createAnnotation({
      theme: 'auto',
      outputLevel: 'standard',
      onBeforeAnnotationCreate: beforeCreate,
      onAnnotationCreate: saved,
      onAnnotationUpdate: saved,
      onAnnotationDelete: removed,
      onAnnotationsClear: annotations => annotations.forEach(a => removed(a.id)),
    })
    dispatcher = createDispatchControl(config)
    requestAnimationFrame(refreshMarkers)
  }
  else if (!show && toolbar) {
    toolbar.destroy()
    toolbar = undefined
    dispatcher?.destroy()
    dispatcher = undefined
  }
}, { immediate: true })

onBeforeUnmount(() => {
  toolbar?.destroy()
  dispatcher?.destroy()
})
</script>

<template>
  <!-- Nothing to show here; the toolbar mounts itself on <body>. -->
  <div hidden />
</template>
