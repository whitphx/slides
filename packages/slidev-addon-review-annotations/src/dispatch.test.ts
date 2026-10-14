import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, test } from 'node:test'
import type { Authenticator, Role } from './auth.ts'
import { createFileStore } from './file-store.ts'
import { DISPATCH_MARKER, formatDispatchComment, githubComment } from './github.ts'
import type { DispatchBatch } from './server.ts'
import { createReviewAnnotationsHandler } from './server.ts'

const testAuth: Authenticator = {
  authenticate(request) {
    const [id, role] = request.headers.get('x-test-user')?.split(':') ?? []
    return id ? { id, role: role as Role } : undefined
  },
}

let dir: string
let sent: DispatchBatch[]
let fail: boolean
let handle: ReturnType<typeof createReviewAnnotationsHandler>

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'slidev-review-annotations-'))
  sent = []
  fail = false
  handle = createReviewAnnotationsHandler({
    store: createFileStore(join(dir, 'annotations.json')),
    basePath: '/api',
    auth: testAuth,
    dispatch: async (batch) => {
      if (fail)
        throw new Error('boom')
      sent.push(batch)
      return { url: 'https://example.test/comment' }
    },
    dispatchIntervalMs: 0,
  })
})

afterEach(() => rm(dir, { recursive: true, force: true }))

async function call(method: string, path: string, body?: unknown, user = 'rev:reviewer') {
  const response = await handle(new Request(`http://localhost/api${path}`, {
    method,
    headers: { 'x-test-user': user },
    body: body === undefined ? undefined : JSON.stringify(body),
  }))
  assert.ok(response)
  return { status: response.status, json: await response.json() }
}

const note = (comment: string, id?: string) => call('POST', '/sessions/pr-7.deck/annotations', { id, comment })

test('dispatch sends each pending note once', async () => {
  await note('one')
  await note('two')
  const first = await call('POST', '/sessions/pr-7.deck/dispatch')
  assert.deepEqual(first.json, { count: 2, url: 'https://example.test/comment' })
  assert.deepEqual(sent[0].annotations.map(a => a.comment), ['one', 'two'])
  assert.equal((await call('POST', '/sessions/pr-7.deck/dispatch')).json.count, 0)
  await note('three')
  await call('POST', '/sessions/pr-7.deck/dispatch')
  assert.deepEqual(sent[1].annotations.map(a => a.comment), ['three'])
})

test('editing a sent note sends it again; resolved notes are not sent', async () => {
  const { json: a } = await note('first wording')
  const { json: b } = await note('to resolve')
  await call('POST', '/sessions/pr-7.deck/dispatch')
  await note('second wording', a.id)
  await call('PATCH', `/annotations/${b.id}`, { status: 'resolved' }, 'bot:agent')
  await call('POST', '/sessions/pr-7.deck/dispatch')
  assert.deepEqual(sent[1].annotations.map(x => x.comment), ['second wording'])
})

test('only reviewers dispatch, and a failed dispatch leaves notes unsent', async () => {
  await note('one')
  assert.equal((await call('POST', '/sessions/pr-7.deck/dispatch', undefined, 'bot:agent')).status, 403)
  fail = true
  assert.equal((await call('POST', '/sessions/pr-7.deck/dispatch')).status, 502)
  fail = false
  assert.equal((await call('POST', '/sessions/pr-7.deck/dispatch')).json.count, 1)
})

test('dispatches of one session are rate limited', async () => {
  const limited = createReviewAnnotationsHandler({
    store: createFileStore(join(dir, 'limited.json')),
    basePath: '/api',
    auth: testAuth,
    dispatch: async () => {},
  })
  const post = (path: string, body?: unknown) => limited(new Request(`http://localhost/api${path}`, {
    method: 'POST', headers: { 'x-test-user': 'rev:reviewer' }, body: body === undefined ? undefined : JSON.stringify(body),
  }))
  await post('/sessions/s/annotations', { comment: 'a' })
  assert.equal((await post('/sessions/s/dispatch'))!.status, 200)
  await post('/sessions/s/annotations', { comment: 'b' })
  const second = (await post('/sessions/s/dispatch'))!
  assert.equal(second.status, 429)
  assert.ok(Number(second.headers.get('Retry-After')) > 0)
})

test('without a dispatcher the route answers 501 and whoami says so', async () => {
  const plain = createReviewAnnotationsHandler({ store: createFileStore(join(dir, 'plain.json')), basePath: '/api', auth: testAuth })
  const req = (method: string, path: string) => plain(new Request(`http://localhost/api${path}`, { method, headers: { 'x-test-user': 'rev:reviewer' } }))
  assert.equal((await req('POST', '/sessions/s/dispatch'))!.status, 501)
  assert.equal((await (await req('GET', '/whoami'))!.json()).canDispatch, false)
  assert.equal((await call('GET', '/whoami')).json.canDispatch, true)
})

test('the PR comment lists each note with its slide and quotes the reviewer text', () => {
  const body = formatDispatchComment({
    sessionId: 'pr-7.deck',
    principal: { id: 'rev', role: 'reviewer' },
    request: new Request('https://preview.example/api/sessions/pr-7.deck/dispatch'),
    annotations: [{
      id: 'n1', sessionId: 'pr-7.deck', comment: 'Make this bold\n## not a heading', elementPath: 'li', element: 'li',
      timestamp: 0, x: 0, y: 0, status: 'pending', thread: [], createdAt: '', updatedAt: '',
      sourceFile: 'decks/deck/slides.md:13', nearbyText: 'First point',
      attributes: { 'slidev-deck': 'deck', 'slidev-slide': '2', 'slidev-click': '1', 'slidev-title': 'Clicks', 'slidev-revision': 'abcdef123' },
    }],
  }, 'https://preview.example/api')
  assert.ok(body.startsWith(DISPATCH_MARKER))
  assert.match(body, /slide 2, click 1 · “Clicks” · `decks\/deck\/slides.md:13`/)
  assert.match(body, /\n {2}> Make this bold\n {2}> ## not a heading/)
  assert.match(body, /id `n1`/)
  assert.match(body, /https:\/\/preview\.example\/api/)
})

test('the PR comment marks annotations on the speaker notes', () => {
  const note = (id: string, attributes: Record<string, string>) => ({
    id, sessionId: 'pr-7.deck', comment: 'Explain this before the demo', elementPath: 'p', element: 'p',
    timestamp: 0, x: 0, y: 0, status: 'pending' as const, thread: [], createdAt: '', updatedAt: '',
    sourceFile: 'decks/deck/slides.md:13', attributes: { 'slidev-deck': 'deck', 'slidev-slide': '2', ...attributes },
  })
  const request = new Request('https://preview.example/api/sessions/pr-7.deck/dispatch')
  const principal = { id: 'rev', role: 'reviewer' as const }
  const withNotes = formatDispatchComment({ sessionId: 'pr-7.deck', principal, request, annotations: [note('n1', { 'slidev-target': 'notes' })] }, 'https://preview.example/api')
  assert.match(withNotes, /slide 2 · speaker notes · `decks\/deck\/slides.md:13`/)
  assert.match(withNotes, /those marked "speaker notes" to the slide's notes/)
  const slideOnly = formatDispatchComment({ sessionId: 'pr-7.deck', principal, request, annotations: [note('n2', {})] }, 'https://preview.example/api')
  assert.doesNotMatch(slideOnly, /speaker notes/)
})

test('githubComment posts to the PR named by the session id', async () => {
  const calls: { url: string, init: RequestInit }[] = []
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return new Response(JSON.stringify({ html_url: 'https://github.com/o/r/pull/7#c1' }), { status: 201 })
  }) as typeof fetch
  try {
    const dispatch = githubComment({ token: 't0ken', repo: 'o/r' })
    const result = await dispatch({
      sessionId: 'pr-7.deck', annotations: [], principal: { id: 'rev', role: 'reviewer' },
      request: new Request('https://preview.example/api/sessions/pr-7.deck/dispatch'),
    })
    assert.equal(calls[0].url, 'https://api.github.com/repos/o/r/issues/7/comments')
    assert.equal((calls[0].init.headers as Record<string, string>).Authorization, 'Bearer t0ken')
    assert.match(JSON.parse(calls[0].init.body as string).body, /https:\/\/preview\.example\/api/)
    assert.deepEqual(result, { url: 'https://github.com/o/r/pull/7#c1' })
    await assert.rejects(dispatch({ sessionId: 'local.deck', annotations: [], principal: { id: 'r', role: 'reviewer' }, request: new Request('http://x/api/sessions/local.deck/dispatch') }), /not a PR preview/)
  }
  finally {
    globalThis.fetch = realFetch
  }
})
