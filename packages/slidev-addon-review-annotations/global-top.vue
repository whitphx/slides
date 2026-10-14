<script setup lang="ts">
/* global __SLIDEV_REVIEW_ANNOTATIONS__, __SLIDEV_REVIEW_ANNOTATIONS_ENABLED__ -- defined by setup/vite-plugins.ts */
import { computed, onBeforeUnmount, watch } from 'vue'
import { useNav } from '@slidev/client'
import type { Annotation, AnnotationInstance, BeforeAnnotationCreateData } from 'agent-ui-annotation/vanilla'
import { annotationTarget, checkCanCreate, createMarkerFilter, createSync, excludeNonTargets, showNotice, slidePosition, sourceLocation } from './src/client'
import type { SlideContext, Sync } from './src/client'
import { createDispatchControl } from './src/dispatch-ui'

const config = __SLIDEV_REVIEW_ANNOTATIONS__
const nav = useNav()

// In the audience view, and in the presenter view for annotating speaker notes;
// not in print/export or embeds.
const visible = computed(() => config.enabled && (nav.isPlaying.value || nav.isPresenter.value)
  && !nav.isPrintMode.value && !nav.isEmbedded.value)

async function beforeCreate(data: BeforeAnnotationCreateData) {
  // Only the current slide and its notes have a source an annotation can point to, not
  // Slidev's controls or the presenter view's next-slide preview.
  const target = annotationTarget(data.element)
  if (!target) {
    showNotice(`Annotate the current slide${nav.isPresenter.value ? ' or its speaker notes' : ''}; this annotation was not added.`, undefined, { replace: true })
    return { cancel: true }
  }
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
    // A position on the slide means nothing for the notes.
    ...(target === 'notes' ? { target } : slidePosition(data.clickX, data.clickY)),
  }
  return { context: { slidev: context } }
}

// The toolbar is a custom element appended to <body>, outside the scaled slide
// container, so its fixed positioning is relative to the viewport.
let toolbar: AnnotationInstance | undefined
let markers: ReturnType<typeof createMarkerFilter> | undefined
let dispatcher: ReturnType<typeof createDispatchControl> | undefined
let sync: Sync | undefined
// Undoes excludeNonTargets().
let stopExcluding: (() => void) | undefined

function refreshMarkers() {
  if (toolbar && markers)
    markers.apply(toolbar.element, nav.currentSlideNo.value)
}

async function saved(annotation: Annotation) {
  markers?.remember(annotation)
  await sync?.save(annotation)
}

async function removed(id: string) {
  markers?.forget(id)
  await sync?.remove(id)
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
    stopExcluding = excludeNonTargets()
    // After every attempt to save, including the retries once back online.
    sync = createSync(config, () => dispatcher?.changed())
    toolbar = createAnnotation({
      theme: 'auto',
      outputLevel: 'standard',
      onBeforeAnnotationCreate: beforeCreate,
      onAnnotationCreate: saved,
      onAnnotationUpdate: saved,
      onAnnotationDelete: removed,
      onAnnotationsClear: annotations => annotations.forEach(a => removed(a.id)),
    })
    dispatcher = createDispatchControl(config, sync)
    requestAnimationFrame(refreshMarkers)
  }
  else if (!show && toolbar) {
    toolbar.destroy()
    toolbar = undefined
    dispatcher?.destroy()
    dispatcher = undefined
    sync?.destroy()
    sync = undefined
    stopExcluding?.()
    stopExcluding = undefined
  }
}, { immediate: true })

onBeforeUnmount(() => {
  toolbar?.destroy()
  dispatcher?.destroy()
  sync?.destroy()
  stopExcluding?.()
})
</script>

<template>
  <!-- Nothing to show here; the toolbar mounts itself on <body>. -->
  <div hidden />
</template>
