// Pluggable authentication and authorization for the annotation API.
// Everything here uses the Fetch API and Web Crypto only, so it runs in Node,
// Cloudflare Workers and other Fetch-compatible hosts alike.

import type { Annotation } from './afs.ts'

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

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]!)

function htmlPage(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reviewer login</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:28rem;margin:4rem auto;padding:0 1rem;color:#222}
label{display:block;margin:1rem 0 .25rem}input[type=password]{width:100%;padding:.5rem;font:inherit;box-sizing:border-box}
button{margin-top:1rem;padding:.5rem 1rem;font:inherit;border:0;border-radius:6px;background:#7c3aed;color:#fff;cursor:pointer}
.error{color:#b00020}</style>
${body}`, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })
}

function loginForm(action: string, next: string, error?: string) {
  return htmlPage(`<h1>Reviewer login</h1>
${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : '<p>Enter the reviewer key to leave notes on the slides.</p>'}
<form method="post" action="${escapeHtml(action)}">
<input type="hidden" name="next" value="${escapeHtml(next)}">
<input type="text" name="username" value="reviewer" autocomplete="username" hidden>
<label for="token">Reviewer key</label>
<input type="password" id="token" name="token" autocomplete="current-password" required autofocus>
<button type="submit">Log in</button>
</form>`, error ? 401 : 200)
}

// Resolves `next` the way a browser would and keeps it only if it stays on `origin`,
// so a link cannot send the reviewer elsewhere (e.g. `/\evil.example` or `//evil.example`).
function sameOriginPath(next: string | null | undefined, base: URL) {
  const target = next && URL.canParse(next, base) ? new URL(next, base) : undefined
  return target && target.origin === base.origin ? target.pathname + target.search + target.hash : undefined
}

function redirect(location: string, cookies: string[] = []) {
  const headers = new Headers({ 'Location': location, 'Cache-Control': 'no-store' })
  for (const c of cookies)
    headers.append('Set-Cookie', c)
  return new Response(null, { status: 303, headers })
}

const randomToken = () => base64url(crypto.getRandomValues(new Uint8Array(18)))

export interface SignedCookieOptions {
  // Both the reviewer key and the key that signs the cookie. Rotating it logs everyone out.
  secret: string | undefined
  role?: Role
  id?: string
  cookieName?: string
  maxAgeSeconds?: number
  // Origin of a "home" host (e.g. the production site). When set, logging in on any other
  // host goes through the home host, so one login there covers every host it trusts.
  home?: string
  // Which origins the home host may hand a login to. Required for `home` to be used.
  trustOrigin?: (origin: string) => boolean
}

// Browser login for reviewers, with the reviewer key typed into a form (never put in a URL):
// - `GET <api>/login?next=/path` shows the form; `POST <api>/login` checks the key and sets a
//   signed, expiring, HttpOnly cookie, which the toolbar's same-origin requests then carry.
// - With `home`, `GET <api>/login` on another host starts a hand-off instead: the browser goes
//   to the home host's `<api>/login/authorize`, which (once logged in there) sends it back to
//   `<api>/login/finish` with a pass signed for that origin, valid for a minute and tied to a
//   one-time state cookie on that host.
// - `<api>/logout` clears the cookie.
export function signedCookie({
  secret,
  role = 'reviewer',
  id = role,
  cookieName = 'annotate_session',
  maxAgeSeconds = 30 * 24 * 60 * 60,
  home,
  trustOrigin,
}: SignedCookieOptions): Authenticator {
  const stateCookieName = `${cookieName}_state`
  // Lax rather than Strict so the home host sees its cookie when a preview sends the browser
  // there; writes are still refused cross-site by the Origin check in `authenticate`.
  const cookie = (name: string, value: string, maxAge: number) =>
    `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`
  const homeOrigin = home && trustOrigin && URL.canParse(home) ? new URL(home).origin : undefined

  async function sessionCookie() {
    const expires = Math.floor(Date.now() / 1000) + maxAgeSeconds
    return cookie(cookieName, `${expires}.${await hmac(secret!, `${id}.${role}.${expires}`)}`, maxAgeSeconds)
  }

  async function loggedIn(request: Request) {
    const [expires, signature] = readCookie(request, cookieName)?.split('.') ?? []
    if (!secret || !expires || !signature || Number(expires) < Date.now() / 1000)
      return false
    return timingSafeEqual(signature, await hmac(secret, `${id}.${role}.${expires}`))
  }

  const passMessage = (origin: string, state: string, expires: string) => `handoff.${id}.${role}.${origin}.${state}.${expires}`

  return {
    async authenticate(request) {
      // Also refuse cross-site requests outright, so the cookie never authorises one.
      if (!sameOrigin(request))
        return undefined
      return await loggedIn(request) ? { id, role } : undefined
    },
    async route(request, segments) {
      if (segments[0] !== 'login' && segments[0] !== 'logout')
        return undefined
      const url = new URL(request.url)
      const api = url.pathname.slice(0, url.pathname.lastIndexOf(`/${segments.join('/')}`))
      if (!secret)
        return htmlPage('<p class="error">Reviewer login is not set up on this site.</p>', 503)

      if (segments.length === 1 && segments[0] === 'logout')
        return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie(cookieName, '', 0) } })

      // GET /login: the form, or the hand-off to the home host.
      if (segments.length === 1 && request.method === 'GET') {
        const next = sameOriginPath(url.searchParams.get('next'), url) ?? '/'
        if (homeOrigin && url.origin !== homeOrigin) {
          const state = randomToken()
          const authorize = new URL(`${homeOrigin}${api}/login/authorize`)
          authorize.searchParams.set('origin', url.origin)
          authorize.searchParams.set('state', state)
          authorize.searchParams.set('next', next)
          return redirect(authorize.href, [cookie(stateCookieName, state, 600)])
        }
        return loginForm(`${api}/login`, next)
      }

      // POST /login: check the key from the form.
      if (segments.length === 1 && request.method === 'POST') {
        if (!sameOrigin(request))
          return htmlPage('<p class="error">Cross-site login refused.</p>', 403)
        const form = await request.formData().catch(() => undefined)
        const token = form?.get('token')
        const next = String(form?.get('next') ?? '/')
        if (typeof token !== 'string' || !await timingSafeEqual(token, secret))
          return loginForm(`${api}/login`, next, 'That key is not valid.')
        const target = sameOriginPath(next, url)
        if (target)
          return redirect(target, [await sessionCookie()])
        return htmlPage('<p>Logged in. Notes you leave on the slides in this browser will now be saved.</p>', 200, { 'Set-Cookie': await sessionCookie() })
      }

      // GET /login/authorize (home host): hand a login to a trusted origin.
      if (segments[1] === 'authorize' && request.method === 'GET' && homeOrigin && url.origin === homeOrigin) {
        const origin = url.searchParams.get('origin') ?? ''
        const state = url.searchParams.get('state') ?? ''
        const next = url.searchParams.get('next') ?? '/'
        if (!trustOrigin!(origin) || !/^[\w-]{16,64}$/.test(state))
          return htmlPage('<p class="error">That site is not allowed to log in through here.</p>', 403)
        if (!await loggedIn(request))
          return loginForm(`${api}/login`, url.pathname + url.search)
        const expires = String(Math.floor(Date.now() / 1000) + 60)
        const finish = new URL(`${origin}${api}/login/finish`)
        finish.searchParams.set('state', state)
        finish.searchParams.set('expires', expires)
        finish.searchParams.set('pass', await hmac(secret, passMessage(origin, state, expires)))
        finish.searchParams.set('next', next)
        return redirect(finish.href)
      }

      // GET /login/finish: accept the pass from the home host.
      if (segments[1] === 'finish' && request.method === 'GET' && homeOrigin) {
        const state = url.searchParams.get('state') ?? ''
        const expires = url.searchParams.get('expires') ?? ''
        const pass = url.searchParams.get('pass') ?? ''
        const expected = readCookie(request, stateCookieName)
        const valid = !!expected && await timingSafeEqual(state, expected)
          && Number(expires) >= Date.now() / 1000
          && await timingSafeEqual(pass, await hmac(secret, passMessage(url.origin, state, expires)))
        const clearState = cookie(stateCookieName, '', 0)
        if (!valid)
          return htmlPage('<p class="error">That login has expired or is not valid. Try logging in again.</p>', 401, { 'Set-Cookie': clearState })
        return redirect(sameOriginPath(url.searchParams.get('next'), url) ?? '/', [await sessionCookie(), clearState])
      }

      return undefined
    },
  }
}
