// Browser side: turns the toolbar's notes into AFS annotations with slide context
// and keeps the annotation API in sync with what the toolbar creates, edits and deletes,
// through an outbox (src/outbox.ts) that holds changes while the server is unreachable.

import type { Annotation as ToolbarAnnotation } from 'agent-ui-annotation/vue'
import type { Annotation } from './afs'
import type { FlushResult } from './outbox'
import { createOutbox } from './outbox'
import type { ReviewAnnotationsClientConfig } from './types'

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
  // 'notes' when the annotation is about the slide's speaker notes (made in the presenter view).
  target?: 'notes'
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

// What a clicked element belongs to: the current slide (Slidev's main #slide-content, in
// the audience and the presenter view), its speaker notes (presenter view), or neither:
// Slidev's navigation controls and menus, the next-slide preview and other parts of the UI.
export function annotationTarget(element: Element): 'slide' | 'notes' | undefined {
  if (element.closest('.slidev-note'))
    return 'notes'
  if (element.closest('#slide-content'))
    return 'slide'
  return undefined
}

export function sourceLocation(config: ReviewAnnotationsClientConfig, filepath: string | undefined, start: number | undefined) {
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
    let style = root.querySelector<HTMLStyleElement>('style[data-slidev-review-annotations]')
    if (!style) {
      style = document.createElement('style')
      style.dataset.slidevReviewAnnotations = ''
      root.append(style)
    }
    const hidden = [...known]
      .filter(([, ctx]) => ctx.deck !== deck || ctx.slide !== slide)
      .map(([id]) => `[data-annotation-marker][data-annotation-id="${CSS.escape(id)}"]`)
    style.textContent = hidden.length ? `${hidden.join(',\n')} { display: none !important; }` : ''
  }

  return { remember, forget: (id: string) => known.delete(id), apply }
}

export function toAfs(annotation: ToolbarAnnotation, config: ReviewAnnotationsClientConfig): Partial<Annotation> {
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
    if (ctx.target)
      attributes['slidev-target'] = ctx.target
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
export function loginUrl(config: ReviewAnnotationsClientConfig) {
  return `${config.endpoint}/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`
}

// With `replace`, it takes the place of a notice already shown; otherwise that one stays.
export function showNotice(text: string, action?: { label: string, href: string }, { replace = false } = {}) {
  const id = 'slidev-review-annotations-notice'
  const shown = document.getElementById(id)
  if (shown && !replace)
    return
  shown?.remove()
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

function hideNotice() {
  document.getElementById('slidev-review-annotations-notice')?.remove()
}

function browserStorage() {
  try {
    return window.localStorage
  }
  catch {
    return undefined
  }
}

// Remembers that this browser may add annotations, so annotating can go on offline.
const canCreateKey = (config: ReviewAnnotationsClientConfig) => `slidev-review-annotations:can-create:${config.endpoint}`

function rememberCanCreate(config: ReviewAnnotationsClientConfig, can: boolean) {
  try {
    if (can)
      localStorage.setItem(canCreateKey(config), '1')
    else
      localStorage.removeItem(canCreateKey(config))
  }
  catch {
    // Without storage, annotating offline needs this page to have been online once.
  }
}

function rememberedCanCreate(config: ReviewAnnotationsClientConfig) {
  try {
    return localStorage.getItem(canCreateKey(config)) === '1'
  }
  catch {
    return false
  }
}

// Asks the server whether this browser may add annotations, and remembers the answer.
// Undefined when the server can't be reached.
async function askCanCreate(config: ReviewAnnotationsClientConfig): Promise<{ can: boolean, status: number } | undefined> {
  let response: Response
  try {
    response = await fetch(`${config.endpoint}/whoami`)
  }
  catch (error) {
    console.warn('[slidev-addon-review-annotations] access check failed', error)
    return undefined
  }
  if (response.status >= 500)
    return undefined
  const can = response.ok && !!(await response.json().catch(() => ({})) as { canCreate?: boolean }).canCreate
  rememberCanCreate(config, can)
  return { can, status: response.status }
}

// Whether this browser may add notes right now. Asked before each new note, so logging
// in (e.g. in another tab) takes effect without a reload. When the server can't be
// reached, the last answer it gave counts: the note is kept in the outbox until it can.
export async function checkCanCreate(config: ReviewAnnotationsClientConfig) {
  const answer = await askCanCreate(config)
  if (!answer)
    return offlineCanCreate(config)
  if (answer.status === 401)
    showNotice('Log in before adding annotations; this annotation was not added.', { label: 'Log in', href: loginUrl(config) })
  else if (!answer.can)
    showNotice(`You can't add annotations here (HTTP ${answer.status}); this annotation was not added.`)
  return answer.can
}

function offlineCanCreate(config: ReviewAnnotationsClientConfig) {
  if (rememberedCanCreate(config))
    return true
  showNotice('The annotation server is unreachable, so this annotation was not added. Open the deck online and log in once to annotate offline.')
  return false
}

const RETRY_MS = 30_000

// Keeps the annotation API in step with the toolbar. Changes go through an outbox in
// localStorage, so they survive being offline and reloads, and are sent once the server
// can be reached: right away, when the browser comes back online, and every 30 s meanwhile.
export function createSync(config: ReviewAnnotationsClientConfig, onFlushed?: (result: FlushResult) => void) {
  const sessionPath = `/sessions/${encodeURIComponent(config.sessionId)}`
  const outboxKey = `slidev-review-annotations:outbox:${config.endpoint}:${config.sessionId}`
  const outbox = createOutbox({
    storage: browserStorage(),
    key: outboxKey,
    send: entry => entry.op === 'save'
      // The toolbar assigns the id, so creating and editing both post the full note.
      ? fetch(`${config.endpoint}${sessionPath}/annotations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.annotation),
        })
      : fetch(`${config.endpoint}/annotations/${encodeURIComponent(entry.id)}`, { method: 'DELETE' }),
    lock: run => navigator.locks
      ? navigator.locks.request(`${outboxKey}:flush`, run)
      : run(),
  })

  let retry: ReturnType<typeof setTimeout> | undefined
  let stopped: FlushResult['stopped']
  let destroyed = false

  async function flush() {
    clearTimeout(retry)
    const result = await outbox.flush()
    // Tell the reviewer when this changes, not on every try, so a dismissed notice stays dismissed.
    if (result.stopped !== stopped) {
      if (result.stopped === 'login')
        showNotice('Your annotations are kept in this browser until you log in again.', { label: 'Log in', href: loginUrl(config) }, { replace: true })
      else if (result.stopped === 'unreachable')
        showNotice('Offline: your annotations are kept in this browser and will be saved when the connection is back. Keep annotating, but don\'t clear this site\'s data.', undefined, { replace: true })
      else
        hideNotice()
      stopped = result.stopped
    }
    for (const { op, status } of result.rejected)
      showNotice(`An annotation could not be ${op === 'delete' ? 'deleted' : 'saved'} (HTTP ${status}).`)
    if (result.pending && !destroyed) {
      // Concurrent calls share one outbox run and all get here: keep a single timer.
      clearTimeout(retry)
      retry = setTimeout(flush, RETRY_MS)
    }
    onFlushed?.(result)
    return result
  }

  // Asked up front too, so a deck opened online can be annotated after going offline.
  void askCanCreate(config)

  const online = () => void flush()
  window.addEventListener('online', online)
  // Changes left from an earlier visit.
  if (outbox.pending())
    void flush()

  return {
    save: (annotation: ToolbarAnnotation) => {
      outbox.add({ op: 'save', id: annotation.id, annotation: toAfs(annotation, config) })
      return flush()
    },
    remove: (id: string) => {
      outbox.add({ op: 'delete', id })
      return flush()
    },
    flush,
    pending: () => outbox.pending(),
    destroy() {
      destroyed = true
      clearTimeout(retry)
      window.removeEventListener('online', online)
    },
  }
}

export type Sync = ReturnType<typeof createSync>
