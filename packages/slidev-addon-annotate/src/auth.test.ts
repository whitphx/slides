import assert from 'node:assert/strict'
import { test } from 'node:test'
import { signedCookie } from './auth.ts'

const API = '/api'

async function route(auth: ReturnType<typeof signedCookie>, request: Request) {
  const url = new URL(request.url)
  const response = await auth.route!(request, url.pathname.slice(API.length + 1).split('/'))
  assert.ok(response, `${request.method} ${url.pathname} fell through`)
  return response
}

const post = (origin: string, fields: Record<string, string>, headers: Record<string, string> = {}) =>
  new Request(`${origin}${API}/login`, { method: 'POST', headers: { Origin: origin, ...headers }, body: new URLSearchParams(fields) })

const cookieOf = (response: Response, name = 'annotate_session') =>
  response.headers.getSetCookie().find(c => c.startsWith(`${name}=`))?.split(';')[0]

test('the login form posts the key, never puts it in a URL', async () => {
  const auth = signedCookie({ secret: 's3cret' })
  const form = await route(auth, new Request(`https://preview.example${API}/login?next=/deck/2`))
  const html = await form.text()
  assert.match(html, /<input type="password" id="token" name="token" autocomplete="current-password"/)
  assert.match(html, /method="post" action="\/api\/login"/)
  assert.match(html, /name="next" value="\/deck\/2"/)
  // A key in the URL no longer logs in.
  assert.equal(cookieOf(await route(auth, new Request(`https://preview.example${API}/login?token=s3cret`))), undefined)
})

test('posting the key logs in and redirects only within the same origin', async () => {
  const auth = signedCookie({ secret: 's3cret' })
  const ok = await route(auth, post('https://preview.example', { token: 's3cret', next: '/deck/2?clicks=1' }))
  assert.equal(ok.status, 303)
  assert.equal(ok.headers.get('Location'), '/deck/2?clicks=1')
  assert.ok(cookieOf(ok))
  for (const next of ['//evil.example', '/\\evil.example', '/\t/evil.example', 'https://evil.example/']) {
    const response = await route(auth, post('https://preview.example', { token: 's3cret', next }))
    assert.equal(response.headers.get('Location'), null, next)
  }
  const wrong = await route(auth, post('https://preview.example', { token: 'nope', next: '/' }))
  assert.equal(wrong.status, 401)
  assert.equal(cookieOf(wrong), undefined)
  const crossSite = await route(auth, post('https://preview.example', { token: 's3cret' }, { Origin: 'https://evil.example' }))
  assert.equal(crossSite.status, 403)
})

test('the session cookie authenticates same-origin requests only', async () => {
  const auth = signedCookie({ secret: 's3cret' })
  const cookie = cookieOf(await route(auth, post('https://preview.example', { token: 's3cret', next: '/' })))!
  const request = (origin?: string) => new Request(`https://preview.example${API}/pending`, {
    headers: { Cookie: cookie, ...(origin ? { Origin: origin } : {}) },
  })
  assert.deepEqual(await auth.authenticate(request()), { id: 'reviewer', role: 'reviewer' })
  assert.equal(await auth.authenticate(request('https://evil.example')), undefined)
  assert.equal(await auth.authenticate(request('null')), undefined)
  const forged = new Request(`https://preview.example${API}/pending`, { headers: { Cookie: `${cookie.split('.')[0]}.forged` } })
  assert.equal(await auth.authenticate(forged), undefined)
})

// Two hosts sharing one secret, like a Worker's production host and its PR previews.
const HOME = 'https://home.example'
const PREVIEW = 'https://pr-1-home.example'
const shared = { secret: 's3cret', home: HOME, trustOrigin: (o: string) => /^https:\/\/pr-\d+-home\.example$/.test(o) }

async function handoff(authorizeCookie?: string, tamper?: (finish: URL) => void) {
  const auth = signedCookie(shared)
  // 1. On the preview, /login sends the browser to the home host with a one-time state.
  const start = await route(auth, new Request(`${PREVIEW}${API}/login?next=/deck/3`))
  assert.equal(start.status, 303)
  const authorize = new URL(start.headers.get('Location')!)
  assert.equal(authorize.origin + authorize.pathname, `${HOME}${API}/login/authorize`)
  const state = cookieOf(start, 'annotate_session_state')!
  // 2. The home host, if logged in, sends it back with a pass.
  const back = await route(auth, new Request(authorize, { headers: authorizeCookie ? { Cookie: authorizeCookie } : {} }))
  if (back.status !== 303)
    return { back }
  const finish = new URL(back.headers.get('Location')!)
  tamper?.(finish)
  // 3. The preview checks the pass against its state cookie and logs in.
  const done = await route(auth, new Request(finish, { headers: { Cookie: state } }))
  return { back, finish, done }
}

test('one login on the home host logs a preview in', async () => {
  const home = signedCookie(shared)
  const homeCookie = cookieOf(await route(home, post(HOME, { token: 's3cret', next: '/' })))!
  const { finish, done } = await handoff(homeCookie)
  assert.equal(finish!.origin + finish!.pathname, `${PREVIEW}${API}/login/finish`)
  assert.equal(done!.status, 303)
  assert.equal(done!.headers.get('Location'), '/deck/3')
  const session = cookieOf(done!)!
  assert.deepEqual(await home.authenticate(new Request(`${PREVIEW}${API}/pending`, { headers: { Cookie: session } })), { id: 'reviewer', role: 'reviewer' })
})

test('the home host asks for the key first when not logged in there', async () => {
  const { back } = await handoff()
  assert.equal(back.status, 200)
  assert.match(await back.text(), /name="next" value="\/api\/login\/authorize\?origin=/)
})

test('the hand-off refuses untrusted origins, wrong state and tampered or expired passes', async () => {
  const home = signedCookie(shared)
  const homeCookie = cookieOf(await route(home, post(HOME, { token: 's3cret', next: '/' })))!
  const untrusted = await route(home, new Request(`${HOME}${API}/login/authorize?origin=https://evil.example&state=${'a'.repeat(24)}&next=/`, { headers: { Cookie: homeCookie } }))
  assert.equal(untrusted.status, 403)
  for (const tamper of [
    (u: URL) => u.searchParams.set('state', 'b'.repeat(24)),
    (u: URL) => u.searchParams.set('pass', 'forged'),
    (u: URL) => u.searchParams.set('expires', String(Math.floor(Date.now() / 1000) + 3600)),
    (u: URL) => u.searchParams.set('expires', '1'),
  ]) {
    const { done } = await handoff(homeCookie, tamper)
    assert.equal(done!.status, 401)
    assert.equal(cookieOf(done!), undefined)
  }
})
