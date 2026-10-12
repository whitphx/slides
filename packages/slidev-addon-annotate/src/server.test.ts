import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, test } from 'node:test'
import { createFileStore } from './file-store.ts'
import { createAnnotateHandler } from './server.ts'

let dir: string
let handle: ReturnType<typeof createAnnotateHandler>

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'slidev-annotate-'))
  handle = createAnnotateHandler({ store: createFileStore(join(dir, 'annotations.json')), basePath: '/api' })
})

afterEach(() => rm(dir, { recursive: true, force: true }))

async function call(method: string, path: string, body?: unknown) {
  const response = await handle(new Request(`http://localhost/api${path}`, {
    method,
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
