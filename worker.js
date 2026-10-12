import { apiKey, chain, signedCookie } from "./packages/slidev-addon-annotate/src/auth.ts";
import { createD1Store } from "./packages/slidev-addon-annotate/src/d1-store.ts";
import { githubComment } from "./packages/slidev-addon-annotate/src/github.ts";
import { createAnnotateHandler } from "./packages/slidev-addon-annotate/src/server.ts";

// Review notes left on PR previews with slidev-addon-annotate.
// Agents send ANNOTATE_AGENT_KEY in `x-api-key`; reviewers log in at `<host>/__annotate/api/login`
// with ANNOTATE_REVIEWER_KEY. With ANNOTATE_HOME_ORIGIN set (e.g. the production host), previews
// hand logins off to that host, so one login there covers every PR preview.
// With ANNOTATE_GITHUB_TOKEN set, "Send to agent" posts the notes as a comment on the PR.
const ANNOTATE_API = "/__annotate/api";
const GITHUB_REPO = "whitphx/slides";
// This Worker's preview hosts (`<version or alias>-slides.whitphx.workers.dev`), which the home host may log in.
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+-slides\.whitphx\.workers\.dev$/;

let annotate;
function annotations(env) {
  annotate ??= createAnnotateHandler({
    store: createD1Store(env.ANNOTATIONS_DB),
    basePath: ANNOTATE_API,
    auth: chain(
      apiKey({ key: env.ANNOTATE_AGENT_KEY, role: "agent" }),
      signedCookie({
        secret: env.ANNOTATE_REVIEWER_KEY,
        role: "reviewer",
        home: env.ANNOTATE_HOME_ORIGIN,
        trustOrigin: (origin) => PREVIEW_ORIGIN.test(origin),
      }),
    ),
    dispatch: env.ANNOTATE_GITHUB_TOKEN
      ? githubComment({ token: env.ANNOTATE_GITHUB_TOKEN, repo: GITHUB_REPO })
      : undefined,
  });
  return annotate;
}

// Static assets are served before this Worker runs,
// so it only sees paths with no matching file.
// Those are the annotation API and client-side routes of a deck, e.g. /<deck>/12 or /<deck>/presenter/3;
// each deck is its own SPA, so we serve that deck's index.html.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === ANNOTATE_API || url.pathname.startsWith(`${ANNOTATE_API}/`)) {
      if (!env.ANNOTATIONS_DB) {
        return Response.json({ error: "Annotations are not set up on this deployment" }, { status: 503 });
      }
      return (await annotations(env)(request)) ?? new Response("Not found", { status: 404 });
    }
    const deck = url.pathname.split("/")[1];
    return env.ASSETS.fetch(new URL(`/${deck}/`, url));
  },
};
