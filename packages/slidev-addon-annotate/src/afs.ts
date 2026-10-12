// The subset of Agentation's Annotation Format Schema (AFS v1.1) this addon stores,
// plus the server-side fields (sessionId, createdAt, updatedAt) its HTTP API adds.
// https://www.agentation.com/schema

export type AnnotationStatus = 'pending' | 'acknowledged' | 'resolved' | 'dismissed'

export interface ThreadMessage {
  id: string
  role: 'human' | 'agent'
  content: string
  timestamp: number
}

export interface Annotation {
  id: string
  sessionId: string
  comment: string
  elementPath: string
  timestamp: number
  x: number
  y: number
  element: string
  url?: string
  boundingBox?: { x: number, y: number, width: number, height: number }
  selectedText?: string
  nearbyText?: string
  // "<file>:<line>" of the slide the note was made on.
  sourceFile?: string
  // Slide context (deck, slide number, click step, ...) as `slidev-*` keys.
  // agentation-mcp passes `attributes` through to the agent, unlike unknown fields.
  attributes?: Record<string, string>
  intent?: 'fix' | 'change' | 'question' | 'approve'
  severity?: 'blocking' | 'important' | 'suggestion'
  status: AnnotationStatus
  resolvedAt?: string
  resolvedBy?: 'human' | 'agent'
  thread: ThreadMessage[]
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  url: string
  status: 'active' | 'closed'
  createdAt: string
}
