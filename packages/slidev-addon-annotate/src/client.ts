// Browser side: turns the toolbar's notes into AFS annotations with slide context
// and keeps the annotation API in sync with what the toolbar creates, edits and deletes.

import type { Annotation as ToolbarAnnotation } from 'agent-ui-annotation/vue'
import type { Annotation } from './afs'
import type { AnnotateClientConfig } from './types'

// Captured when a note is created, so it describes the slide the reviewer was looking at.
export interface SlideContext {
  deck: string
  url: string
  slide: number
  click: number
  clicksTotal: number
  title?: string
  // "<file>:<line>" (1-based) of the slide's source, when known.
  sourceFile?: string
  // Click position as a percentage of the slide's width and height.
  slideX?: number
  slideY?: number
}

const round = (n: number) => Math.round(n * 10) / 10

export function slidePosition(clientX: number, clientY: number) {
  const slide = document.querySelector('#slide-content')?.getBoundingClientRect()
  if (!slide || !slide.width || !slide.height)
    return {}
  return {
    slideX: round(((clientX - slide.left) / slide.width) * 100),
    slideY: round(((clientY - slide.top) / slide.height) * 100),
  }
}

export function sourceLocation(config: AnnotateClientConfig, filepath: string | undefined, start: number | undefined) {
  // Slidev keeps the source path only in dev mode; builds fall back to the deck's entry file,
  // which is wrong only for slides pulled in from other files with `src:`.
  let file = filepath || config.entry
  if (config.repoRoot && file.startsWith(`${config.repoRoot}/`))
    file = file.slice(config.repoRoot.length + 1)
  return start === undefined ? file : `${file}:${start + 1}`
}

// The toolbar shows a marker while its element is still in the document, and Slidev
// keeps neighbouring slides mounted (hidden), so markers from other slides would stay
// on screen. Hide those with a style rule inside the toolbar's shadow root.
// Workaround until agent-ui-annotation lets route scoping take precedence.
export function createMarkerFilter(deck: string) {
  // Slide context of every note the toolbar knows about, by note id.
  const known = new Map<string, SlideContext>()
  try {
    // Where agent-ui-annotation persists notes (one list per origin), for notes from earlier visits.
    const stored = JSON.parse(localStorage.getItem(`annotation-annotations-${window.location.origin}`) ?? '[]') as ToolbarAnnotation[]
    for (const a of stored)
      remember(a)
  }
  catch {
    // Unreadable storage: markers from earlier visits stay visible.
  }

  function remember(annotation: ToolbarAnnotation) {
    const ctx = annotation.context?.slidev as SlideContext | undefined
    if (ctx)
      known.set(annotation.id, ctx)
  }

  function apply(host: Element, slide: number) {
    const root = host.shadowRoot
    if (!root)
      return
    let style = root.querySelector<HTMLStyleElement>('style[data-slidev-annotate]')
    if (!style) {
      style = document.createElement('style')
      style.dataset.slidevAnnotate = ''
      root.append(style)
    }
    const hidden = [...known]
      .filter(([, ctx]) => ctx.deck !== deck || ctx.slide !== slide)
      .map(([id]) => `[data-annotation-marker][data-annotation-id="${CSS.escape(id)}"]`)
    style.textContent = hidden.length ? `${hidden.join(',\n')} { display: none !important; }` : ''
  }

  return { remember, forget: (id: string) => known.delete(id), apply }
}

export function toAfs(annotation: ToolbarAnnotation, config: AnnotateClientConfig): Partial<Annotation> {
  const info = annotation.elementInfo
  const ctx = annotation.context?.slidev as SlideContext | undefined
  const attributes: Record<string, string> = {
    'slidev-deck': config.deck,
    'slidev-revision': config.revision,
  }
  if (ctx) {
    attributes['slidev-slide'] = String(ctx.slide)
    attributes['slidev-click'] = String(ctx.click)
    attributes['slidev-clicks-total'] = String(ctx.clicksTotal)
    if (ctx.title)
      attributes['slidev-title'] = ctx.title
    if (ctx.slideX !== undefined && ctx.slideY !== undefined)
      attributes['slidev-position'] = `${ctx.slideX}% ${ctx.slideY}%`
  }
  return {
    id: annotation.id,
    comment: annotation.comment,
    elementPath: info.selectorPath,
    element: info.tagName.toLowerCase(),
    timestamp: annotation.createdAt,
    x: round((annotation.clickX / window.innerWidth) * 100),
    y: annotation.clickY,
    url: ctx?.url ?? window.location.href,
    boundingBox: { x: info.rect.left, y: info.rect.top, width: info.rect.width, height: info.rect.height },
    selectedText: annotation.selectedText ?? undefined,
    nearbyText: info.innerText ? info.innerText.slice(0, 300) : undefined,
    sourceFile: ctx?.sourceFile,
    attributes,
  }
}

// A dismissible message at the top of the page, shown once, e.g. when saving needs a login.
// Where the reviewer logs in; it brings them back to the current slide afterwards.
export function loginUrl(config: AnnotateClientConfig) {
  return `${config.endpoint}/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`
}

function showNotice(text: string, action?: { label: string, href: string }) {
  const id = 'slidev-annotate-notice'
  if (document.getElementById(id))
    return
  const notice = document.createElement('div')
  notice.id = id
  notice.setAttribute('role', 'alert')
  // Keeps the dismiss button clickable while the toolbar is picking elements.
  notice.setAttribute('data-annotation-toolbar', '')
  notice.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;'
    + 'display:flex;gap:12px;align-items:center;max-width:calc(100vw - 32px);padding:10px 14px;border-radius:8px;'
    + 'background:#fff4e5;color:#4a2c00;border:1px solid #f0b45a;font:14px/1.4 system-ui,sans-serif;box-shadow:0 4px 12px rgb(0 0 0 / 15%)'
  const message = document.createElement('span')
  message.textContent = text
  if (action) {
    const link = document.createElement('a')
    link.href = action.href
    link.textContent = action.label
    link.style.cssText = 'color:inherit;font-weight:600;margin-left:8px'
    message.append(link)
  }
  const close = document.createElement('button')
  close.type = 'button'
  close.textContent = '×'
  close.setAttribute('aria-label', 'Dismiss')
  close.style.cssText = 'border:0;background:none;color:inherit;font-size:20px;line-height:1;cursor:pointer'
  close.addEventListener('click', () => notice.remove())
  notice.append(message, close)
  document.body.append(notice)
}

// Whether this browser may add notes right now. Asked before each new note, so logging
// in (e.g. in another tab) takes effect without a reload.
export async function checkCanCreate(config: AnnotateClientConfig) {
  try {
    const response = await fetch(`${config.endpoint}/whoami`)
    if (response.status === 401) {
      showNotice('Log in before adding notes; this note was not added.', { label: 'Log in', href: loginUrl(config) })
      return false
    }
    if (!response.ok || !(await response.json() as { canCreate?: boolean }).canCreate) {
      showNotice(`You can't add notes here (HTTP ${response.status}); this note was not added.`)
      return false
    }
    return true
  }
  catch (error) {
    console.warn('[slidev-addon-annotate] access check failed', error)
    showNotice('The annotation server is unreachable, so this note was not added.')
    return false
  }
}

export function createSync(config: AnnotateClientConfig) {
  async function send(method: string, path: string, body?: unknown) {
    try {
      const response = await fetch(`${config.endpoint}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (response.status === 401)
        showNotice('Your notes are not being saved: log in first.', { label: 'Log in', href: loginUrl(config) })
      // Deleting a note the server never had (e.g. one made before logging in) is fine.
      else if (!response.ok && !(method === 'DELETE' && response.status === 404))
        showNotice(`A note could not be ${method === 'DELETE' ? 'deleted' : 'saved'} (HTTP ${response.status}).`)
    }
    catch (error) {
      console.warn(`[slidev-addon-annotate] ${method} ${path} failed`, error)
      showNotice('The annotation server is unreachable, so notes are not being saved.')
    }
  }

  const sessionPath = `/sessions/${encodeURIComponent(config.sessionId)}`

  return {
    // The toolbar assigns the id, so creating and editing both post the full note.
    save: (annotation: ToolbarAnnotation) =>
      send('POST', `${sessionPath}/annotations`, toAfs(annotation, config)),
    remove: (id: string) =>
      send('DELETE', `/annotations/${encodeURIComponent(id)}`),
  }
}
