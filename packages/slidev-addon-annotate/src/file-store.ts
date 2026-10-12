// An AnnotationStore kept in one JSON file, for the local dev server.

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { Annotation, Session } from './afs.ts'
import type { AnnotationStore } from './server.ts'

interface FileContent {
  sessions: Session[]
  annotations: Annotation[]
}

export function createFileStore(path: string): AnnotationStore {
  // Serialise read-modify-write cycles so concurrent requests don't drop each other's writes.
  let queue: Promise<unknown> = Promise.resolve()

  async function read(): Promise<FileContent> {
    try {
      return JSON.parse(await readFile(path, 'utf-8')) as FileContent
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT')
        return { sessions: [], annotations: [] }
      throw error
    }
  }

  function update<T>(fn: (content: FileContent) => T): Promise<T> {
    const result = queue.then(async () => {
      const content = await read()
      const value = fn(content)
      await mkdir(dirname(path), { recursive: true })
      // Write then rename, so a reader never sees a half-written file.
      await writeFile(`${path}.tmp`, `${JSON.stringify(content, null, 2)}\n`)
      await rename(`${path}.tmp`, path)
      return value
    })
    queue = result.catch(() => {})
    return result
  }

  return {
    async listSessions() {
      return (await read()).sessions
    },
    async getSession(id) {
      return (await read()).sessions.find(s => s.id === id)
    },
    putSession(session) {
      return update(({ sessions }) => {
        const i = sessions.findIndex(s => s.id === session.id)
        if (i === -1)
          sessions.push(session)
        else
          sessions[i] = session
      })
    },
    async listAnnotations(filter = {}) {
      return (await read()).annotations.filter(a =>
        (!filter.sessionId || a.sessionId === filter.sessionId)
        && (!filter.status || a.status === filter.status))
    },
    async getAnnotation(id) {
      return (await read()).annotations.find(a => a.id === id)
    },
    updateAnnotation(id, fn) {
      return update(({ annotations }) => {
        const i = annotations.findIndex(a => a.id === id)
        const annotation = fn(annotations[i])
        if (!annotation)
          return undefined
        if (i === -1)
          annotations.push(annotation)
        else
          annotations[i] = annotation
        return annotation
      })
    },
    deleteAnnotation(id) {
      return update((content) => {
        const before = content.annotations.length
        content.annotations = content.annotations.filter(a => a.id !== id)
        return content.annotations.length !== before
      })
    },
  }
}
