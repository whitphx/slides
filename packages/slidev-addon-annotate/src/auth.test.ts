import assert from 'node:assert/strict'
import { test } from 'node:test'
import { signedCookie } from './auth.ts'

const auth = signedCookie({ secret: 's3cret' })

async function login(query: string) {
  const request = new Request(`https://preview.example/api/login?${query}`)
  const response = await auth.route!(request, ['login'])
  assert.ok(response)
  return response
}

test('the login link only redirects within the same origin', async () => {
  assert.equal((await login('token=s3cret&next=/deck/2?clicks=1')).headers.get('Location'), '/deck/2?clicks=1')
  for (const next of ['//evil.example', '/\\evil.example', '/\t/evil.example', 'https://evil.example/', 'javascript:alert(1)']) {
    const response = await login(`token=s3cret&next=${encodeURIComponent(next)}`)
    assert.equal(response.headers.get('Location'), null, next)
    assert.equal(response.status, 200, next)
  }
})

test('a wrong token sets no cookie', async () => {
  const response = await login('token=nope')
  assert.equal(response.status, 401)
  assert.equal(response.headers.get('Set-Cookie'), null)
})

test('the cookie from the login link authenticates same-origin requests only', async () => {
  const cookie = (await login('token=s3cret')).headers.get('Set-Cookie')!.split(';')[0]
  const request = (origin?: string) => new Request('https://preview.example/api/pending', {
    headers: { Cookie: cookie, ...(origin ? { Origin: origin } : {}) },
  })
  assert.deepEqual(await auth.authenticate(request()), { id: 'reviewer', role: 'reviewer' })
  assert.equal(await auth.authenticate(request('https://evil.example')), undefined)
  assert.equal(await auth.authenticate(request('null')), undefined)
  const forged = new Request('https://preview.example/api/pending', { headers: { Cookie: `${cookie.split('.')[0]}.forged` } })
  assert.equal(await auth.authenticate(forged), undefined)
})
