import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import type { OutboxEntry } from './outbox.ts'
import { createOutbox } from './outbox.ts'

class MemoryStorage {
  data = new Map<string, string>()
  getItem(key: string) {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.data.set(key, value)
  }

  removeItem(key: string) {
    this.data.delete(key)
  }
}

let storage: MemoryStorage
let sent: OutboxEntry[]
// What the next sends do: a status code, or 'offline' to throw like a failed fetch.
let replies: (number | 'offline')[]

function send(entry: OutboxEntry) {
  const reply = replies.shift() ?? 200
  if (reply === 'offline')
    return Promise.reject(new TypeError('Failed to fetch'))
  sent.push(entry)
  return Promise.resolve(new Response(null, { status: reply }))
}

const outbox = () => createOutbox({ storage, key: 'outbox', send })
const save = (id: string, comment: string) => ({ op: 'save' as const, id, annotation: { id, comment } })

beforeEach(() => {
  storage = new MemoryStorage()
  sent = []
  replies = []
})

test('sends changes in order and empties the storage', async () => {
  const box = outbox()
  box.add(save('a', 'one'))
  box.add(save('b', 'two'))
  assert.deepEqual(await box.flush(), { pending: 0, rejected: [] })
  assert.deepEqual(sent.map(e => e.id), ['a', 'b'])
  assert.equal(storage.data.size, 0)
})

test('keeps changes while offline and sends them later, also from a new page', async () => {
  replies = ['offline']
  const box = outbox()
  box.add(save('a', 'one'))
  box.add(save('b', 'two'))
  assert.deepEqual(await box.flush(), { pending: 2, stopped: 'unreachable', rejected: [] })
  assert.equal(sent.length, 0)

  // A reload: a new outbox over the same storage.
  const after = outbox()
  assert.equal(after.pending(), 2)
  assert.deepEqual(await after.flush(), { pending: 0, rejected: [] })
  assert.deepEqual(sent.map(e => e.id), ['a', 'b'])
})

test('only the latest change to an annotation is sent', async () => {
  const box = outbox()
  box.add(save('a', 'first'))
  box.add(save('b', 'other'))
  box.add(save('a', 'edited'))
  await box.flush()
  assert.deepEqual(sent.map(e => e.op === 'save' && e.annotation.comment), ['other', 'edited'])
})

test('an annotation made and deleted offline ends as a delete, and a 404 for it is fine', async () => {
  const box = outbox()
  box.add(save('a', 'one'))
  box.add({ op: 'delete', id: 'a' })
  replies = [404]
  assert.deepEqual(await box.flush(), { pending: 0, rejected: [] })
  assert.deepEqual(sent.map(e => e.op), ['delete'])
})

test('stops on a server error or an expired login, keeping the rest', async () => {
  const box = outbox()
  box.add(save('a', 'one'))
  box.add(save('b', 'two'))
  replies = [200, 503]
  assert.deepEqual(await box.flush(), { pending: 1, stopped: 'unreachable', rejected: [] })
  replies = [401]
  assert.deepEqual(await box.flush(), { pending: 1, stopped: 'login', rejected: [] })
  assert.deepEqual(await box.flush(), { pending: 0, rejected: [] })
  // b was tried three times: 503, 401, then saved.
  assert.deepEqual(sent.map(e => e.id), ['a', 'b', 'b', 'b'])
})

test('drops a change the server refuses for good, and goes on', async () => {
  const box = outbox()
  box.add(save('a', 'one'))
  box.add(save('b', 'two'))
  replies = [403]
  assert.deepEqual(await box.flush(), { pending: 0, rejected: [{ id: 'a', op: 'save', status: 403 }] })
  assert.deepEqual(sent.map(e => e.id), ['a', 'b'])
})

test('a change made while its earlier version is being sent stays queued', async () => {
  let release!: () => void
  const box = createOutbox({
    storage,
    key: 'outbox',
    send: async (entry) => {
      sent.push(entry)
      if (sent.length === 1)
        await new Promise<void>(resolve => (release = resolve))
      return new Response(null, { status: 200 })
    },
  })
  box.add(save('a', 'first'))
  const flushing = box.flush()
  await new Promise(resolve => setImmediate(resolve))
  box.add(save('a', 'second'))
  // Concurrent flushes share the run in progress.
  assert.equal(box.flush(), flushing)
  release()
  assert.deepEqual(await flushing, { pending: 0, rejected: [] })
  assert.deepEqual(sent.map(e => e.op === 'save' && e.annotation.comment), ['first', 'second'])
})

test('works in memory when storage fails', async () => {
  const broken = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError') }, removeItem: () => {} }
  replies = ['offline']
  const box = createOutbox({ storage: broken, key: 'outbox', send })
  box.add(save('a', 'one'))
  assert.equal(box.pending(), 1)
  assert.equal((await box.flush()).pending, 1)
  assert.equal((await box.flush()).pending, 0)
})

test('two tabs sharing the storage and a lock save an annotation\'s versions in order', async () => {
  // A mutex like navigator.locks: runs one holder at a time, in request order.
  let tail = Promise.resolve()
  const lock = <T>(run: () => Promise<T>) => {
    const result = tail.then(run)
    tail = result.then(() => {}, () => {})
    return result
  }
  const received: string[] = []
  let releaseA!: () => void
  const tab = (name: string) => createOutbox({
    storage,
    key: 'outbox',
    lock,
    send: async (entry) => {
      // Tab A's first request is slow to arrive.
      if (name === 'A' && !received.length)
        await new Promise<void>(resolve => (releaseA = resolve))
      received.push(entry.op === 'save' ? String(entry.annotation.comment) : 'delete')
      return new Response(null, { status: 200 })
    },
  })
  const a = tab('A')
  const b = tab('B')
  a.add(save('x', 'old'))
  const flushingA = a.flush()
  await new Promise(resolve => setImmediate(resolve))
  // Edited in tab B while tab A's request with the old text is on its way.
  b.add(save('x', 'new'))
  const flushingB = b.flush()
  await new Promise(resolve => setImmediate(resolve))
  releaseA()
  await Promise.all([flushingA, flushingB])
  assert.deepEqual(received, ['old', 'new'])
  assert.equal(b.pending(), 0)
})
