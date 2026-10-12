// A Fetch-API (Request -> Response) handler serving the parts of Agentation's HTTP API
// that the browser toolbar and agentation-mcp use, so the same handler can run
// in a Vite dev server, a Cloudflare Worker, or any other Fetch-compatible host.
// The API is the one defined by Agentation (https://github.com/benjitaylor/agentation,
// PolyForm Shield 1.0.0), as called by agentation-mcp; no Agentation code is included.

import type { Annotation, Session, ThreadMessage } from './afs'

export interface AnnotationStore {
  listSessions(): Promise<Session[]>
  getSession(id: string): Promise<Session | undefined>
  putSession(session: Session): Promise<void>
  listAnnotations(filter?: { sessionId?: string, status?: Annotation['status'] }): Promise<Annotation[]>
  getAnnotation(id: string): Promise<Annotation | undefined>
  // Runs `fn` on the current note and stores what it returns, as one atomic step,
  // so concurrent requests can't overwrite each other's changes.
  // Returning undefined leaves the store unchanged.
  updateAnnotation(id: string, fn: (existing: Annotation | undefined) => Annotation | undefined): Promise<Annotation | undefined>
  deleteAnnotation(id: string): Promise<boolean>
}

export interface HandlerOptions {
  store: AnnotationStore
  // Path prefix the API is mounted at, e.g. "/__annotate/api".
  basePath: string
}

// How often an open event stream checks the store for new notes.
const POLL_INTERVAL_MS = 1000

const STATUSES: ReadonlySet<string> = new Set(['pending', 'acknowledged', 'resolved', 'dismissed'])

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

const notFound = (what: string) => json({ error: `${what} not found` }, 404)

const now = () => new Date().toISOString()

const newId = () => crypto.randomUUID()

// Fields a client may set when creating or patching a note.
// `id`, `sessionId`, `thread` and the timestamps are owned by the server.
const WRITABLE_FIELDS = [
  'comment', 'elementPath', 'timestamp', 'x', 'y', 'element', 'url', 'boundingBox',
  'selectedText', 'nearbyText', 'sourceFile', 'attributes', 'intent', 'severity',
  'status', 'resolvedBy',
] as const

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

export function createAnnotateHandler({ store, basePath }: HandlerOptions) {
  async function pending(sessionId?: string) {
    const annotations = await store.listAnnotations({ sessionId, status: 'pending' })
    return { count: annotations.length, annotations }
  }

  async function createAnnotation(sessionId: string, body: Record<string, unknown>) {
    if (!await store.getSession(sessionId)) {
      await store.putSession({
        id: sessionId,
        url: typeof body.url === 'string' ? body.url : '',
        status: 'active',
        createdAt: now(),
      })
    }
    const id = typeof body.id === 'string' && body.id ? body.id : newId()
    const annotation = await store.updateAnnotation(id, existing => ({
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
      updatedAt: now(),
    }))
    return annotation!
  }

  function patchAnnotation(id: string, body: Record<string, unknown>) {
    const patch = pickWritable(body)
    return store.updateAnnotation(id, (existing) => {
      if (!existing)
        return undefined
      const annotation: Annotation = { ...existing, ...patch, updatedAt: now() }
      if (patch.status === 'resolved' || patch.status === 'dismissed')
        annotation.resolvedAt = now()
      return annotation
    })
  }

  async function addThreadMessage(id: string, body: Record<string, unknown>) {
    const message: ThreadMessage = {
      id: newId(),
      role: body.role === 'agent' ? 'agent' : 'human',
      content: String(body.content ?? ''),
      timestamp: Date.now(),
    }
    const updated = await store.updateAnnotation(id, existing =>
      existing && { ...existing, thread: [...existing.thread, message], updatedAt: now() })
    return updated && message
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

    // GET /sessions, GET /sessions/:id, GET /sessions/:id/pending,
    // POST /sessions/:id/annotations, GET /sessions/:id/events
    if (segments[0] === 'sessions') {
      const [, sessionId, sub] = segments
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
      if (sessionId && sub === 'annotations' && method === 'POST')
        return json(await createAnnotation(sessionId, await body()), 201)
      if (sessionId && sub === 'events' && method === 'GET')
        return events(request, sessionId)
    }

    // GET /pending, GET /events
    if (segments.length === 1 && segments[0] === 'pending' && method === 'GET')
      return json(await pending())
    if (segments.length === 1 && segments[0] === 'events' && method === 'GET')
      return events(request)

    // GET|PATCH|DELETE /annotations/:id, POST /annotations/:id/thread
    if (segments[0] === 'annotations' && segments[1]) {
      const id = segments[1]
      if (segments.length === 2 && method === 'GET') {
        const annotation = await store.getAnnotation(id)
        return annotation ? json(annotation) : notFound('Annotation')
      }
      if (segments.length === 2 && method === 'PATCH') {
        const annotation = await patchAnnotation(id, await body())
        return annotation ? json(annotation) : notFound('Annotation')
      }
      if (segments.length === 2 && method === 'DELETE')
        return await store.deleteAnnotation(id) ? json({ deleted: true }) : notFound('Annotation')
      if (segments[2] === 'thread' && method === 'POST') {
        const message = await addThreadMessage(id, await body())
        return message ? json(message, 201) : notFound('Annotation')
      }
    }

    if (segments.length === 1 && segments[0] === 'health')
      return json({ ok: true })

    return json({ error: 'Not found' }, 404)
  }
}
