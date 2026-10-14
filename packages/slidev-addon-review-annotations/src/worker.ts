// The annotation API as a Cloudflare Worker route, set up from the Worker's bindings:
//
//   REVIEW_ANNOTATIONS_DB         D1 database for the notes (required; the API answers 503 without it)
//   REVIEW_ANNOTATIONS_AGENT_KEY     key agents send in `x-api-key`
//   REVIEW_ANNOTATIONS_REVIEWER_KEY  key reviewers log in with; also signs their login cookie
//   REVIEW_ANNOTATIONS_HOME_ORIGIN   origin whose login covers every trusted host (optional)
//   REVIEW_ANNOTATIONS_GITHUB_TOKEN  token for posting "Send to agent" batches as PR comments (optional)
//
// A Worker that also serves the decks calls it first and falls back to its own routes:
//
//   const reviewAnnotations = createReviewAnnotationsWorker({ repo: 'owner/slides', trustOrigin: o => ... })
//   export default {
//     async fetch(request, env) {
//       return (await reviewAnnotations(request, env)) ?? env.ASSETS.fetch(request)
//     },
//   }

import { apiKey, chain, signedCookie } from './auth.ts'
import type { D1Database } from './d1-store.ts'
import { createD1Store } from './d1-store.ts'
import { githubComment } from './github.ts'
import type { GitHubCommentOptions } from './github.ts'
import { createReviewAnnotationsHandler } from './server.ts'

export interface ReviewAnnotationsWorkerEnv {
  REVIEW_ANNOTATIONS_DB?: D1Database
  REVIEW_ANNOTATIONS_AGENT_KEY?: string
  REVIEW_ANNOTATIONS_REVIEWER_KEY?: string
  REVIEW_ANNOTATIONS_HOME_ORIGIN?: string
  REVIEW_ANNOTATIONS_GITHUB_TOKEN?: string
}

export interface ReviewAnnotationsWorkerOptions {
  // Where the API is served; must match the addon's SLIDEV_REVIEW_ANNOTATIONS_ENDPOINT. Defaults to "/__review-annotations/api".
  basePath?: string
  // "owner/repo" whose PRs get "Send to agent" comments, when REVIEW_ANNOTATIONS_GITHUB_TOKEN is set.
  repo?: string
  // Maps a session id to its PR number; by default `pr-<number>.<deck>`.
  prNumber?: GitHubCommentOptions['prNumber']
  // Which origins (e.g. PR preview hosts) the home host may hand a login to.
  // Logins are handed off only when this and REVIEW_ANNOTATIONS_HOME_ORIGIN are both set.
  trustOrigin?: (origin: string) => boolean
}

// Returns the API's response for requests under `basePath`, and undefined for anything else.
export function createReviewAnnotationsWorker({ basePath = '/__review-annotations/api', repo, prNumber, trustOrigin }: ReviewAnnotationsWorkerOptions = {}) {
  // Bindings are fixed for the life of an isolate, so the handler is built once.
  let handler: ReturnType<typeof createReviewAnnotationsHandler> | undefined

  return async (request: Request, env: ReviewAnnotationsWorkerEnv): Promise<Response | undefined> => {
    const { pathname } = new URL(request.url)
    if (pathname !== basePath && !pathname.startsWith(`${basePath}/`))
      return undefined
    if (!env.REVIEW_ANNOTATIONS_DB)
      return Response.json({ error: 'Annotations are not set up on this deployment' }, { status: 503 })
    handler ??= createReviewAnnotationsHandler({
      store: createD1Store(env.REVIEW_ANNOTATIONS_DB),
      basePath,
      auth: chain(
        apiKey({ key: env.REVIEW_ANNOTATIONS_AGENT_KEY, role: 'agent' }),
        signedCookie({
          secret: env.REVIEW_ANNOTATIONS_REVIEWER_KEY,
          role: 'reviewer',
          home: env.REVIEW_ANNOTATIONS_HOME_ORIGIN,
          trustOrigin,
        }),
      ),
      dispatch: repo && env.REVIEW_ANNOTATIONS_GITHUB_TOKEN
        ? githubComment({ token: env.REVIEW_ANNOTATIONS_GITHUB_TOKEN, repo, prNumber })
        : undefined,
    })
    return (await handler(request)) ?? new Response('Not found', { status: 404 })
  }
}
