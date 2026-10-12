// An AnnotationStore on Cloudflare D1. Each record is kept as JSON, with the
// columns the queries filter on alongside it. Tables are created on first use.
// D1 has no interactive transactions, so updates use a version column: a write
// only lands if the note is unchanged since it was read, and is retried otherwise.

import type { Annotation, Session } from './afs.ts'
import type { AnnotationStore } from './server.ts'

// The parts of D1's API used here, so this file needs no Workers type package.
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T>(): Promise<T | null>
  all<T>(): Promise<{ results: T[] }>
  run(): Promise<{ meta: { changes: number } }>
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<unknown>
}

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS annotate_sessions (id TEXT PRIMARY KEY, data TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS annotate_annotations (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, version INTEGER NOT NULL, data TEXT NOT NULL)',
  'CREATE INDEX IF NOT EXISTS annotate_annotations_by_session ON annotate_annotations (session_id, status)',
]

export function createD1Store(db: D1Database): AnnotationStore {
  let ready: Promise<unknown> | undefined
  const init = () => (ready ??= db.batch(SCHEMA.map(q => db.prepare(q))).catch((error) => {
    ready = undefined
    throw error
  }))

  const parse = <T>(rows: { data: string }[]) => rows.map(row => JSON.parse(row.data) as T)

  return {
    async listSessions() {
      await init()
      return parse<Session>((await db.prepare('SELECT data FROM annotate_sessions').all<{ data: string }>()).results)
    },
    async getSession(id) {
      await init()
      const row = await db.prepare('SELECT data FROM annotate_sessions WHERE id = ?').bind(id).first<{ data: string }>()
      return row ? JSON.parse(row.data) as Session : undefined
    },
    async putSession(session) {
      await init()
      await db.prepare('INSERT INTO annotate_sessions (id, data) VALUES (?, ?) ON CONFLICT (id) DO UPDATE SET data = excluded.data')
        .bind(session.id, JSON.stringify(session)).run()
    },
    async listAnnotations(filter = {}) {
      await init()
      const where: string[] = []
      const values: unknown[] = []
      if (filter.sessionId) {
        where.push('session_id = ?')
        values.push(filter.sessionId)
      }
      if (filter.status) {
        where.push('status = ?')
        values.push(filter.status)
      }
      const query = `SELECT data FROM annotate_annotations${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at`
      return parse<Annotation>((await db.prepare(query).bind(...values).all<{ data: string }>()).results)
    },
    async getAnnotation(id) {
      await init()
      const row = await db.prepare('SELECT data FROM annotate_annotations WHERE id = ?').bind(id).first<{ data: string }>()
      return row ? JSON.parse(row.data) as Annotation : undefined
    },
    async updateAnnotation(id, fn) {
      await init()
      for (let attempt = 0; attempt < 5; attempt++) {
        const row = await db.prepare('SELECT data, version FROM annotate_annotations WHERE id = ?')
          .bind(id).first<{ data: string, version: number }>()
        const next = fn(row ? JSON.parse(row.data) as Annotation : undefined)
        if (!next)
          return undefined
        const result = row
          ? await db.prepare('UPDATE annotate_annotations SET session_id = ?, status = ?, data = ?, version = version + 1 WHERE id = ? AND version = ?')
            .bind(next.sessionId, next.status, JSON.stringify(next), id, row.version).run()
          : await db.prepare('INSERT INTO annotate_annotations (id, session_id, status, created_at, version, data) VALUES (?, ?, ?, ?, 0, ?) ON CONFLICT (id) DO NOTHING')
            .bind(id, next.sessionId, next.status, next.createdAt, JSON.stringify(next)).run()
        if (result.meta.changes > 0)
          return next
      }
      throw new Error(`Note ${id} kept changing while being updated`)
    },
    async deleteAnnotation(id) {
      await init()
      return (await db.prepare('DELETE FROM annotate_annotations WHERE id = ?').bind(id).run()).meta.changes > 0
    },
  }
}
