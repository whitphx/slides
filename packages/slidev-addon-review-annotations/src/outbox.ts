// Annotation changes that haven't reached the annotation API yet. They are kept in
// localStorage, so a reviewer can keep annotating offline or on a flaky connection, and the
// changes are saved once the server is reachable again, even after a reload.

import type { Annotation } from './afs'

export type OutboxChange =
  | { op: 'save', id: string, annotation: Partial<Annotation> }
  | { op: 'delete', id: string }

// `token` tells a change apart from a later change to the same annotation.
export type OutboxEntry = OutboxChange & { token: string }

export interface FlushResult {
  // Changes still waiting.
  pending: number
  // Why sending stopped early, leaving the remaining changes for the next try.
  stopped?: 'unreachable' | 'login'
  // Changes the server refused for good (e.g. 403); they are dropped.
  rejected: { id: string, op: OutboxChange['op'], status: number }[]
}

export interface OutboxOptions {
  // Where changes are kept between visits; without it (or if it fails), only in memory.
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  key: string
  // Sends one change. Throws when the request doesn't get through.
  send: (entry: OutboxEntry) => Promise<Response>
  // Runs a flush exclusively among everything sharing the storage, e.g. other tabs of the
  // deck. Otherwise a tab could send an annotation's older version after another tab has
  // saved a newer one, and the server would keep the older one.
  lock?: <T>(run: () => Promise<T>) => Promise<T>
}

type Outcome = 'done' | 'retry' | 'login' | number

function outcomeOf(entry: OutboxEntry, response: Response): Outcome {
  // Deleting an annotation the server never had (e.g. one made and removed offline) is fine.
  if (response.ok || (entry.op === 'delete' && response.status === 404))
    return 'done'
  if (response.status === 401)
    return 'login'
  if (response.status >= 500 || response.status === 408 || response.status === 429)
    return 'retry'
  return response.status
}

export function createOutbox({ storage, key, send, lock = run => run() }: OutboxOptions) {
  let memory: OutboxEntry[] = []
  let useStorage = !!storage

  function read(): OutboxEntry[] {
    if (useStorage) {
      try {
        return JSON.parse(storage!.getItem(key) ?? '[]') as OutboxEntry[]
      }
      catch {
        // Unreadable: fall through to the copy in memory.
      }
    }
    return memory
  }

  function write(entries: OutboxEntry[]) {
    memory = entries
    if (!useStorage)
      return
    try {
      if (entries.length)
        storage!.setItem(key, JSON.stringify(entries))
      else
        storage!.removeItem(key)
    }
    catch {
      // Full or blocked: keep going in memory, so at least this page's changes aren't lost.
      useStorage = false
    }
  }

  // Read again before every change: another tab of the same deck may share the storage.
  function add(change: OutboxChange) {
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    // Only the latest change to an annotation matters: saves carry the whole annotation.
    write([...read().filter(e => e.id !== change.id), { ...change, token }])
  }

  async function run(): Promise<FlushResult> {
    const result: FlushResult = { pending: 0, rejected: [] }
    const tried = new Set<string>()
    for (;;) {
      // Changes added while sending are picked up in the same run.
      const entry = read().find(e => !tried.has(e.token))
      if (!entry)
        break
      tried.add(entry.token)
      let outcome: Outcome
      try {
        outcome = outcomeOf(entry, await send(entry))
      }
      catch {
        outcome = 'retry'
      }
      if (outcome === 'retry' || outcome === 'login') {
        result.stopped = outcome === 'login' ? 'login' : 'unreachable'
        break
      }
      if (outcome !== 'done')
        result.rejected.push({ id: entry.id, op: entry.op, status: outcome })
      // Unless the annotation changed again while this was being sent.
      write(read().filter(e => e.token !== entry.token))
    }
    result.pending = read().length
    return result
  }

  let flushing: Promise<FlushResult> | undefined

  return {
    add,
    pending: () => read().length,
    // Sends the waiting changes in order. Concurrent calls share one run.
    flush: () => (flushing ??= lock(run).finally(() => {
      flushing = undefined
    })),
  }
}

export type Outbox = ReturnType<typeof createOutbox>
