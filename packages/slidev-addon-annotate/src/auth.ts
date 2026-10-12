// Pluggable authentication and authorization for the annotation API.
// Everything here uses the Fetch API and Web Crypto only, so it runs in Node,
// Cloudflare Workers and other Fetch-compatible hosts alike.

import type { Annotation } from './afs'

export type Role = 'reviewer' | 'agent' | 'admin'

// Who made a request: decided by the server from a credential, never from the request body.
export interface Principal {
  id: string
  role: Role
}

export interface Authenticator {
  // Returns undefined when the request carries no credential this authenticator accepts.
  authenticate(request: Request): Promise<Principal | undefined> | Principal | undefined
  // Optional routes under the API path (e.g. `login`). Return undefined to fall through.
  route?(request: Request, segments: string[]): Promise<Response | undefined> | Response | undefined
}

export type Action = 'read' | 'create' | 'edit' | 'delete' | 'set-status' | 'reply' | 'dispatch'

// `annotation` is the note being acted on, when there is one.
export type Authorize = (principal: Principal, action: Action, annotation?: Annotation) => boolean

const PERMISSIONS: Record<Role, ReadonlySet<Action>> = {
  reviewer: new Set(['read', 'create', 'edit', 'delete', 'set-status', 'reply', 'dispatch']),
  // Agents can read notes and report on them, but cannot write instructions for themselves.
  agent: new Set(['read', 'set-status', 'reply']),
  admin: new Set(['read', 'create', 'edit', 'delete', 'set-status', 'reply', 'dispatch']),
}

// Role-based, and reviewers may edit or delete only their own notes.
export const defaultAuthorize: Authorize = (principal, action, annotation) => {
  if (!PERMISSIONS[principal.role].has(action))
    return false
  if (principal.role === 'reviewer' && (action === 'edit' || action === 'delete') && annotation?.author)
    return annotation.author.id === principal.id
  return true
}

// Tries each authenticator in turn; the first one that accepts the request wins.
export function chain(...authenticators: Authenticator[]): Authenticator {
  return {
    async authenticate(request) {
      for (const auth of authenticators) {
        const principal = await auth.authenticate(request)
        if (principal)
          return principal
      }
      return undefined
    },
    async route(request, segments) {
      for (const auth of authenticators) {
        const response = await auth.route?.(request, segments)
        if (response)
          return response
      }
      return undefined
    },
  }
}

function sameOrigin(request: Request) {
  const origin = request.headers.get('Origin')
  if (!origin)
    return true
  return URL.canParse(origin) && new URL(origin).host === new URL(request.url).host
}

// For a dev server bound to localhost: every same-origin request is the local user.
// Cross-site browser requests (another page open in the same browser) are refused.
export function localDev(): Authenticator {
  return {
    authenticate: request => sameOrigin(request) ? { id: 'local', role: 'admin' } : undefined,
  }
}

const encoder = new TextEncoder()

async function sha256(value: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))
}

// Compares hashes so the time taken does not depend on where the inputs differ.
async function timingSafeEqual(a: string, b: string) {
  const [x, y] = await Promise.all([sha256(a), sha256(b)])
  let diff = 0
  for (let i = 0; i < x.length; i++)
    diff |= x[i] ^ y[i]
  return diff === 0
}

// A shared key in the `x-api-key` header (what agentation-mcp sends) or `Authorization: Bearer`.
export function apiKey({ key, role = 'agent', id = role }: { key: string | undefined, role?: Role, id?: string }): Authenticator {
  return {
    async authenticate(request) {
      if (!key)
        return undefined
      const bearer = request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1]
      const given = request.headers.get('x-api-key') ?? bearer
      return given && await timingSafeEqual(given, key) ? { id, role } : undefined
    },
  }
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmac(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message))))
}

function readCookie(request: Request, name: string) {
  for (const part of request.headers.get('Cookie')?.split(';') ?? []) {
    const [key, ...value] = part.trim().split('=')
    if (key === name)
      return value.join('=')
  }
  return undefined
}

function htmlPage(message: string, status = 200) {
  return new Response(`<!doctype html><meta charset="utf-8"><title>Annotations</title><p>${message}</p>`, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export interface SignedCookieOptions {
  // Both the login token and the key that signs the cookie. Rotating it logs everyone out.
  secret: string | undefined
  role?: Role
  id?: string
  cookieName?: string
  maxAgeSeconds?: number
}

// Browser login for reviewers. Opening `<api>/login?token=<secret>` sets a signed, expiring,
// HttpOnly cookie; the toolbar's same-origin requests then carry it automatically.
// `next=/path` redirects back to the deck after logging in. `<api>/logout` clears the cookie.
export function signedCookie({
  secret,
  role = 'reviewer',
  id = role,
  cookieName = 'annotate_session',
  maxAgeSeconds = 30 * 24 * 60 * 60,
}: SignedCookieOptions): Authenticator {
  const cookie = (value: string, maxAge: number) =>
    `${cookieName}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`

  return {
    async authenticate(request) {
      if (!secret)
        return undefined
      // SameSite=Strict already keeps the cookie off cross-site requests; check Origin as well.
      if (!sameOrigin(request))
        return undefined
      const [expires, signature] = readCookie(request, cookieName)?.split('.') ?? []
      if (!expires || !signature || Number(expires) < Date.now() / 1000)
        return undefined
      const valid = await timingSafeEqual(signature, await hmac(secret, `${id}.${role}.${expires}`))
      return valid ? { id, role } : undefined
    },
    async route(request, segments) {
      if (segments.length !== 1 || request.method !== 'GET')
        return undefined
      if (segments[0] === 'logout') {
        return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie('', 0) } })
      }
      if (segments[0] !== 'login')
        return undefined
      const url = new URL(request.url)
      const token = url.searchParams.get('token')
      if (!secret || !token || !await timingSafeEqual(token, secret))
        return htmlPage('That login link is not valid.', 401)
      const expires = Math.floor(Date.now() / 1000) + maxAgeSeconds
      const value = `${expires}.${await hmac(secret, `${id}.${role}.${expires}`)}`
      // Resolve `next` the way a browser would and keep it only if it stays on this origin,
      // so the link cannot send the reviewer elsewhere (e.g. `/\evil.example` or `//evil.example`).
      const next = url.searchParams.get('next')
      const target = next && URL.canParse(next, url) ? new URL(next, url) : undefined
      if (target && target.origin === url.origin) {
        return new Response(null, {
          status: 303,
          headers: {
            'Location': target.pathname + target.search + target.hash,
            'Set-Cookie': cookie(value, maxAgeSeconds),
            'Cache-Control': 'no-store',
          },
        })
      }
      const response = htmlPage('Logged in. Notes you leave on the slides in this browser will now be saved.')
      response.headers.set('Set-Cookie', cookie(value, maxAgeSeconds))
      return response
    },
  }
}
