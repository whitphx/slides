// Slidev loads `setup/vite-plugins.ts` from every addon root.
// This plugin passes the annotation settings to the client (`__SLIDEV_REVIEW_ANNOTATIONS__`)
// and, in `slidev` dev mode, serves the annotation API from the dev server
// with notes stored in `<deck>/.review-annotations/annotations.json`.

import { execFileSync } from 'node:child_process'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { basename, relative, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { localDev } from '../src/auth'
import { createFileStore } from '../src/file-store'
import { createReviewAnnotationsHandler } from '../src/server'
import type { ReviewAnnotationsClientConfig } from '../src/types'

interface SlidevOptions {
  mode: 'dev' | 'build' | 'export'
  entry: string
  userRoot: string
}

function git(cwd: string, ...args: string[]) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  }
  catch {
    return undefined
  }
}

function resolveConfig({ mode, entry, userRoot }: SlidevOptions): ReviewAnnotationsClientConfig {
  const env = process.env
  const enabled = mode === 'dev' ? env.SLIDEV_REVIEW_ANNOTATIONS !== '0' : env.SLIDEV_REVIEW_ANNOTATIONS === '1'
  const repoRoot = git(userRoot, 'rev-parse', '--show-toplevel') ?? userRoot
  const deck = basename(userRoot)
  const session = env.SLIDEV_REVIEW_ANNOTATIONS_SESSION || 'local'
  return {
    enabled,
    endpoint: (env.SLIDEV_REVIEW_ANNOTATIONS_ENDPOINT || '/__review-annotations/api').replace(/\/$/, ''),
    sessionId: `${session}.${deck}`,
    deck,
    entry: relative(repoRoot, entry),
    // Only needed to shorten dev-mode source paths; kept out of built bundles.
    repoRoot: mode === 'dev' ? repoRoot : '',
    revision: env.SLIDEV_REVIEW_ANNOTATIONS_REVISION || git(userRoot, 'rev-parse', 'HEAD') || '',
    autoDispatch: env.SLIDEV_REVIEW_ANNOTATIONS_AUTO_DISPATCH === '1',
    autoDispatchSeconds: Number(env.SLIDEV_REVIEW_ANNOTATIONS_AUTO_DISPATCH_SECONDS) || 120,
  }
}

async function toRequest(req: IncomingMessage, res: ServerResponse): Promise<Request> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined)
      headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }
  let body: Uint8Array<ArrayBuffer> | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = []
    for await (const chunk of req)
      chunks.push(chunk as Buffer)
    body = new Uint8Array(Buffer.concat(chunks))
  }
  const controller = new AbortController()
  res.on('close', () => controller.abort())
  return new Request(url, { method: req.method, headers, body, signal: controller.signal })
}

async function sendResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  if (!response.body) {
    res.end()
    return
  }
  res.flushHeaders()
  const reader = response.body.getReader()
  res.on('close', () => reader.cancel().catch(() => {}))
  for (;;) {
    const { done, value } = await reader.read()
    if (done)
      break
    res.write(value)
  }
  res.end()
}

export default function setupVitePlugins(options: SlidevOptions): Plugin[] {
  const config = resolveConfig(options)
  return [{
    name: 'slidev-addon-review-annotations',
    config() {
      return {
        define: {
          __SLIDEV_REVIEW_ANNOTATIONS__: JSON.stringify(config),
          __SLIDEV_REVIEW_ANNOTATIONS_ENABLED__: JSON.stringify(config.enabled),
        },
      }
    },
    configureServer(server) {
      if (options.mode !== 'dev' || !config.enabled || !config.endpoint.startsWith('/'))
        return
      const handle = createReviewAnnotationsHandler({
        store: createFileStore(resolve(options.userRoot, '.review-annotations/annotations.json')),
        basePath: config.endpoint,
        // The dev server listens on localhost: same-origin requests are the local user,
        // and cross-site requests from other pages in the same browser are refused.
        auth: localDev(),
      })
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(config.endpoint))
          return next()
        try {
          const response = await handle(await toRequest(req, res))
          if (!response)
            return next()
          await sendResponse(res, response)
        }
        catch (error) {
          next(error)
        }
      })
    },
  }]
}
