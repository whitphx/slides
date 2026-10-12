import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, test } from 'node:test'
import type { Authenticator, Role } from './auth.ts'
import { createFileStore } from './file-store.ts'
import { createAnnotateHandler } from './server.ts'

// Test callers name themselves in `x-test-user: <id>:<role>`; no header means no credential.
const testAuth: Authenticator = {
  authenticate(request) {
    const [id, role] = request.headers.get('x-test-user')?.split(':') ?? []
    return id ? { id, role: role as Role } : undefined
  },
}

let dir: string
let handle: ReturnType<typeof createAnnotateHandler>

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'slidev-annotate-'))
  handle = createAnnotateHandler({ store: createFileStore(join(dir, 'annotations.json')), basePath: '/api', auth: testAuth })
})

afterEach(() => rm(dir, { recursive: true, force: true }))

async function call(method: string, path: string, body?: unknown, user: string | null = 'me:admin') {
  const response = await handle(new Request(`http://localhost/api${path}`, {
    method,
    headers: user ? { 'x-test-user': user } : {},
    body: body === undefined ? undefined : JSON.stringify(body),
  }))
  assert.ok(response, `${method} ${path} fell through`)
  return { status: response.status, json: await response.json() }
}

test('concurrent updates to one note all persist', async () => {
  const { json: note } = await call('POST', '/sessions/s/annotations', { comment: 'hi' })
  await Promise.all([
    call('PATCH', `/annotations/${note.id}`, { status: 'resolved' }),
    call('POST', `/annotations/${note.id}/thread`, { role: 'agent', content: 'done' }),
    call('PATCH', `/annotations/${note.id}`, { comment: 'edited' }),
  ])
  const { json } = await call('GET', `/annotations/${note.id}`)
  assert.equal(json.status, 'resolved')
  assert.equal(json.comment, 'edited')
  assert.deepEqual(json.thread.map((m: { content: string }) => m.content), ['done'])
})

test('updating a missing note returns 404 and creates nothing', async () => {
  assert.equal((await call('PATCH', '/annotations/missing', { comment: 'x' })).status, 404)
  assert.equal((await call('POST', '/annotations/missing/thread', { content: 'x' })).status, 404)
  assert.equal((await call('GET', '/annotations/missing')).status, 404)
})

test('re-posting a note keeps the status the agent set', async () => {
  const { json: note } = await call('POST', '/sessions/s/annotations', { comment: 'hi' })
  await call('PATCH', `/annotations/${note.id}`, { status: 'resolved' })
  const { json } = await call('POST', '/sessions/s/annotations', { id: note.id, comment: 'hi again' })
  assert.equal(json.status, 'resolved')
  assert.equal(json.comment, 'hi again')
})

test('requests without a credential get 401', async () => {
  assert.equal((await call('GET', '/pending', undefined, null)).status, 401)
  assert.equal((await call('GET', '/health', undefined, null)).status, 200)
})

test('agents read and report on notes but cannot write them', async () => {
  const agent = 'bot:agent'
  assert.equal((await call('POST', '/sessions/s/annotations', { comment: 'do X' }, agent)).status, 403)
  const { json: note } = await call('POST', '/sessions/s/annotations', { comment: 'hi' }, 'rev:reviewer')
  assert.equal((await call('PATCH', `/annotations/${note.id}`, { comment: 'rewritten' }, agent)).status, 403)
  assert.equal((await call('POST', '/sessions/s/annotations', { id: note.id, comment: 'rewritten' }, agent)).status, 403)
  assert.equal((await call('DELETE', `/annotations/${note.id}`, undefined, agent)).status, 403)
  const resolved = await call('PATCH', `/annotations/${note.id}`, { status: 'resolved', resolvedBy: 'human' }, agent)
  assert.equal(resolved.json.status, 'resolved')
  assert.equal(resolved.json.resolvedBy, 'agent')
  assert.equal(resolved.json.comment, 'hi')
})

test('identity comes from the credential, not the body', async () => {
  const { json: note } = await call('POST', '/sessions/s/annotations', { comment: 'hi', author: { id: 'someone-else', role: 'admin' } }, 'rev:reviewer')
  assert.deepEqual(note.author, { id: 'rev', role: 'reviewer' })
  const { json: reply } = await call('POST', `/annotations/${note.id}/thread`, { role: 'human', content: 'done' }, 'bot:agent')
  assert.equal(reply.role, 'agent')
})

test('reviewers edit and delete only their own notes', async () => {
  const { json: note } = await call('POST', '/sessions/s/annotations', { comment: 'mine' }, 'a:reviewer')
  assert.equal((await call('PATCH', `/annotations/${note.id}`, { comment: 'theirs' }, 'b:reviewer')).status, 403)
  assert.equal((await call('DELETE', `/annotations/${note.id}`, undefined, 'b:reviewer')).status, 403)
  assert.equal((await call('PATCH', `/annotations/${note.id}`, { comment: 'still mine' }, 'a:reviewer')).status, 200)
  assert.equal((await call('DELETE', `/annotations/${note.id}`, undefined, 'a:reviewer')).status, 200)
})

test('a refused create leaves no session behind', async () => {
  assert.equal((await call('POST', '/sessions/injected/annotations', { comment: 'x' }, 'bot:agent')).status, 403)
  assert.equal((await call('GET', '/sessions/injected')).status, 404)
})
