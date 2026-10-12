// A Fetch-API (Request -> Response) handler serving the parts of Agentation's HTTP API
// that the browser toolbar and agentation-mcp use, so the same handler can run
// in a Vite dev server, a Cloudflare Worker, or any other Fetch-compatible host.
// The API is the one defined by Agentation (https://github.com/benjitaylor/agentation,
// PolyForm Shield 1.0.0), as called by agentation-mcp; no Agentation code is included.

import type { Annotation, Session, ThreadMessage } from './afs'
import type { Action, Authenticator, Authorize, Principal } from './auth'
import { defaultAuthorize } from './auth.ts'

export interface AnnotationStore {
  listSessions(): Promise<Session[]>
  getSession(id: string): Promise<Session | undefined>
  putSession(session: Session): Promise<void>
  listAnnotations(filter?: { sessionId?: string, status?: Annotation['status'] }): Promise<Annotation[]>
  getAnnotation(id: string): Promise<Annotation | undefined>
  // Runs `fn` on the current note and stores what it returns, as one atomic step,
  // so concurrent requests can't overwrite each other's changes.
  // Returning undefined leaves the store unchanged. `fn` may run more than once.
  updateAnnotation(id: string, fn: (existing: Annotation | undefined) => Annotation | undefined): Promise<Annotation | undefined>
  deleteAnnotation(id: string): Promise<boolean>
}

export interface HandlerOptions {
  store: AnnotationStore
  // Path prefix the API is mounted at, e.g. "/__annotate/api".
  basePath: string
  // Who may call the API at all, e.g. `localDev()` or `chain(apiKey(...), signedCookie(...))`.
  auth: Authenticator
  // What each caller may do; defaults to `defaultAuthorize`.
  authorize?: Authorize
}

// How often an open event stream checks the store for new notes.
const POLL_INTERVAL_MS = 1000

const STATUSES: ReadonlySet<string> = new Set(['pending', 'acknowledged', 'resolved', 'dismissed'])

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

const notFound = (what: string) => json({ error: `${what} not found` }, 404)

const forbidden = () => json({ error: 'Not allowed' }, 403)

const now = () => new Date().toISOString()

const newId = () => crypto.randomUUID()

// Fields a client may set when creating or patching a note.
// `id`, `sessionId`, `thread` and the timestamps are owned by the server.
const WRITABLE_FIELDS = [
  'comment', 'elementPath', 'timestamp', 'x', 'y', 'element', 'url', 'boundingBox',
  'selectedText', 'nearbyText', 'sourceFile', 'attributes', 'intent', 'severity',
  'status',
] as const

// Fields an agent may change: it reports on notes but cannot rewrite them.
const STATUS_FIELDS: ReadonlySet<string> = new Set(['status', 'resolvedBy'])

function pickWritable(body: Record<string, unknown>): Partial<Annotation> {
  const picked: Record<string, unknown> = {}
  for (const key of WRITABLE_FIELDS) {
    if (key in body)
      picked[key] = body[key]
  }
  if ('status' in picked && !STATUSES.has(String(picked.status)))
    delete picked.status
  return picked as Partial<Annotation>
}

export function createAnnotateHandler({ store, basePath, auth, authorize = defaultAuthorize }: HandlerOptions) {
  async function pending(sessionId?: string) {
    const annotations = await store.listAnnotations({ sessionId, status: 'pending' })
    return { count: annotations.length, annotations }
  }

  // Each write runs its permission check inside the store's atomic update, against the
  // note as it is at that moment. `denied` is set when the check fails, to tell a 403
  // apart from a missing note.
  async function createAnnotation(principal: Principal, sessionId: string, body: Record<string, unknown>) {
    const id = typeof body.id === 'string' && body.id ? body.id : newId()
    const annotation = await store.updateAnnotation(id, (existing) => {
      // The toolbar re-posts a note to save an edit, so posting an existing id is an edit.
      if (existing ? existing.sessionId !== sessionId || !authorize(principal, 'edit', existing) : !authorize(principal, 'create'))
        return undefined
      return {
        comment: '',
        elementPath: '',
        timestamp: Date.now(),
        x: 0,
        y: 0,
        element: '',
        thread: [],
        createdAt: now(),
        ...existing,
        ...pickWritable(body),
        id,
        sessionId,
        status: existing?.status ?? 'pending',
        author: existing?.author ?? { id: principal.id, role: principal.role },
        updatedAt: now(),
      }
    })
    // Only once the note is stored, so a refused request leaves no session behind.
    if (annotation && !await store.getSession(sessionId)) {
      await store.putSession({
        id: sessionId,
        url: typeof body.url === 'string' ? body.url : '',
        status: 'active',
        createdAt: now(),
      })
    }
    return annotation
  }

  async function patchAnnotation(principal: Principal, id: string, body: Record<string, unknown>) {
    const patch = pickWritable(body)
    const action: Action = Object.keys(body).every(key => STATUS_FIELDS.has(key)) ? 'set-status' : 'edit'
    let denied = false
    const annotation = await store.updateAnnotation(id, (existing) => {
      if (!existing)
        return undefined
      if (!authorize(principal, action, existing)) {
        denied = true
        return undefined
      }
      const annotation: Annotation = { ...existing, ...patch, updatedAt: now() }
      if (patch.status === 'resolved' || patch.status === 'dismissed') {
        annotation.resolvedAt = now()
        annotation.resolvedBy = principal.role === 'agent' ? 'agent' : 'human'
      }
      return annotation
    })
    return { annotation, denied }
  }

  async function addThreadMessage(principal: Principal, id: string, body: Record<string, unknown>) {
    const message: ThreadMessage = {
      id: newId(),
      role: principal.role === 'agent' ? 'agent' : 'human',
      content: String(body.content ?? ''),
      timestamp: Date.now(),
    }
    let denied = false
    const updated = await store.updateAnnotation(id, (existing) => {
      if (!existing)
        return undefined
      if (!authorize(principal, 'reply', existing)) {
        denied = true
        return undefined
      }
      return { ...existing, thread: [...existing.thread, message], updatedAt: now() }
    })
    return { message: updated && message, denied }
  }

  // Server-sent events for agentation-mcp's watch tool. Only `annotation.created`
  // is emitted, found by polling the store, so this works on hosts without
  // shared in-process state (e.g. Cloudflare Workers) as well as in Node.
  function events(request: Request, sessionId?: string) {
    const encoder = new TextEncoder()
    let timer: ReturnType<typeof setInterval> | undefined
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const seen = new Set((await store.listAnnotations({ sessionId })).map(a => a.id))
        // The client may have gone away while the store was being read.
        if (request.signal.aborted) {
          controller.close()
          return
        }
        let sequence = 0
        controller.enqueue(encoder.encode(': connected\n\n'))
        timer = setInterval(async () => {
          try {
            for (const annotation of await store.listAnnotations({ sessionId, status: 'pending' })) {
              if (seen.has(annotation.id))
                continue
              seen.add(annotation.id)
              const event = {
                type: 'annotation.created',
                timestamp: now(),
                sessionId: annotation.sessionId,
                sequence: ++sequence,
                payload: annotation,
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
            }
          }
          catch (error) {
            clearInterval(timer)
            controller.error(error)
          }
        }, POLL_INTERVAL_MS)
        request.signal.addEventListener('abort', () => {
          clearInterval(timer)
          try {
            controller.close()
          }
          catch {
            // Already closed.
          }
        })
      },
      cancel() {
        clearInterval(timer)
      },
    })
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  }

  // Returns undefined for requests outside `basePath`, so callers can fall through.
  return async function handle(request: Request): Promise<Response | undefined> {
    const url = new URL(request.url)
    if (url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`))
      return undefined
    const path = url.pathname.slice(basePath.length).replace(/\/$/, '') || '/'
    const segments = path.split('/').filter(Boolean).map(decodeURIComponent)
    const method = request.method
    // Anything but a JSON object counts as an empty body.
    const body = async () => {
      const parsed: unknown = await request.json().catch(() => undefined)
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}) as Record<string, unknown>
    }

    if (segments.length === 1 && segments[0] === 'health')
      return json({ ok: true })

    // Authenticator routes such as `login`, then everything else needs a caller.
    const routed = await auth.route?.(request, segments)
    if (routed)
      return routed
    const principal = await auth.authenticate(request)
    if (!principal)
      return json({ error: 'Authentication required' }, 401)
    const can = (action: Action, annotation?: Annotation) => authorize(principal, action, annotation)

    // GET /whoami: who the caller is and whether they may add notes, so the toolbar
    // can refuse a note up front instead of showing one the server will reject.
    if (segments.length === 1 && segments[0] === 'whoami' && method === 'GET')
      return json({ id: principal.id, role: principal.role, canCreate: can('create') })

    // GET /sessions, GET /sessions/:id, GET /sessions/:id/pending,
    // POST /sessions/:id/annotations, GET /sessions/:id/events
    if (segments[0] === 'sessions') {
      const [, sessionId, sub] = segments
      if (method === 'GET' && !can('read'))
        return forbidden()
      if (!sessionId && method === 'GET')
        return json(await store.listSessions())
      if (sessionId && !sub && method === 'GET') {
        const session = await store.getSession(sessionId)
        if (!session)
          return notFound('Session')
        return json({ ...session, annotations: await store.listAnnotations({ sessionId }) })
      }
      if (sessionId && sub === 'pending' && method === 'GET')
        return json(await pending(sessionId))
      if (sessionId && sub === 'annotations' && method === 'POST') {
        const annotation = await createAnnotation(principal, sessionId, await body())
        return annotation ? json(annotation, 201) : forbidden()
      }
      if (sessionId && sub === 'events' && method === 'GET')
        return events(request, sessionId)
    }

    // GET /pending, GET /events
    if (segments.length === 1 && (segments[0] === 'pending' || segments[0] === 'events') && !can('read'))
      return forbidden()
    if (segments.length === 1 && segments[0] === 'pending' && method === 'GET')
      return json(await pending())
    if (segments.length === 1 && segments[0] === 'events' && method === 'GET')
      return events(request)

    // GET|PATCH|DELETE /annotations/:id, POST /annotations/:id/thread
    if (segments[0] === 'annotations' && segments[1]) {
      const id = segments[1]
      if (segments.length === 2 && method === 'PATCH') {
        const { annotation, denied } = await patchAnnotation(principal, id, await body())
        return annotation ? json(annotation) : denied ? forbidden() : notFound('Annotation')
      }
      if (segments[2] === 'thread' && method === 'POST') {
        const { message, denied } = await addThreadMessage(principal, id, await body())
        return message ? json(message, 201) : denied ? forbidden() : notFound('Annotation')
      }
      const existing = await store.getAnnotation(id)
      if (!existing)
        return notFound('Annotation')
      if (segments.length === 2 && method === 'GET')
        return can('read', existing) ? json(existing) : forbidden()
      if (segments.length === 2 && method === 'DELETE') {
        // The author, which the delete check depends on, never changes after creation.
        if (!can('delete', existing))
          return forbidden()
        await store.deleteAnnotation(id)
        return json({ deleted: true })
      }
    }

    return json({ error: 'Not found' }, 404)
  }
}
