// The annotation API as a Cloudflare Worker route, set up from the Worker's bindings:
//
//   ANNOTATIONS_DB         D1 database for the notes (required; the API answers 503 without it)
//   ANNOTATE_AGENT_KEY     key agents send in `x-api-key`
//   ANNOTATE_REVIEWER_KEY  key reviewers log in with; also signs their login cookie
//   ANNOTATE_HOME_ORIGIN   origin whose login covers every trusted host (optional)
//   ANNOTATE_GITHUB_TOKEN  token for posting "Send to agent" batches as PR comments (optional)
//
// A Worker that also serves the decks calls it first and falls back to its own routes:
//
//   const annotate = createAnnotateWorker({ repo: 'owner/slides', trustOrigin: o => ... })
//   export default {
//     async fetch(request, env) {
//       return (await annotate(request, env)) ?? env.ASSETS.fetch(request)
//     },
//   }

import { apiKey, chain, signedCookie } from './auth.ts'
import type { D1Database } from './d1-store.ts'
import { createD1Store } from './d1-store.ts'
import { githubComment } from './github.ts'
import type { GitHubCommentOptions } from './github.ts'
import { createAnnotateHandler } from './server.ts'

export interface AnnotateWorkerEnv {
  ANNOTATIONS_DB?: D1Database
  ANNOTATE_AGENT_KEY?: string
  ANNOTATE_REVIEWER_KEY?: string
  ANNOTATE_HOME_ORIGIN?: string
  ANNOTATE_GITHUB_TOKEN?: string
}

export interface AnnotateWorkerOptions {
  // Where the API is served; must match the addon's SLIDEV_ANNOTATE_ENDPOINT. Defaults to "/__annotate/api".
  basePath?: string
  // "owner/repo" whose PRs get "Send to agent" comments, when ANNOTATE_GITHUB_TOKEN is set.
  repo?: string
  // Maps a session id to its PR number; by default `pr-<number>.<deck>`.
  prNumber?: GitHubCommentOptions['prNumber']
  // Which origins (e.g. PR preview hosts) the home host may hand a login to.
  // Logins are handed off only when this and ANNOTATE_HOME_ORIGIN are both set.
  trustOrigin?: (origin: string) => boolean
}

// Returns the API's response for requests under `basePath`, and undefined for anything else.
export function createAnnotateWorker({ basePath = '/__annotate/api', repo, prNumber, trustOrigin }: AnnotateWorkerOptions = {}) {
  // Bindings are fixed for the life of an isolate, so the handler is built once.
  let handler: ReturnType<typeof createAnnotateHandler> | undefined

  return async (request: Request, env: AnnotateWorkerEnv): Promise<Response | undefined> => {
    const { pathname } = new URL(request.url)
    if (pathname !== basePath && !pathname.startsWith(`${basePath}/`))
      return undefined
    if (!env.ANNOTATIONS_DB)
      return Response.json({ error: 'Annotations are not set up on this deployment' }, { status: 503 })
    handler ??= createAnnotateHandler({
      store: createD1Store(env.ANNOTATIONS_DB),
      basePath,
      auth: chain(
        apiKey({ key: env.ANNOTATE_AGENT_KEY, role: 'agent' }),
        signedCookie({
          secret: env.ANNOTATE_REVIEWER_KEY,
          role: 'reviewer',
          home: env.ANNOTATE_HOME_ORIGIN,
          trustOrigin,
        }),
      ),
      dispatch: repo && env.ANNOTATE_GITHUB_TOKEN
        ? githubComment({ token: env.ANNOTATE_GITHUB_TOKEN, repo, prNumber })
        : undefined,
    })
    return (await handler(request)) ?? new Response('Not found', { status: 404 })
  }
}
