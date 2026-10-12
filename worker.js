import { createAnnotateWorker } from "slidev-addon-annotate/worker";

// Review notes left on PR previews with slidev-addon-annotate; see its README for the bindings.
// Agents send ANNOTATE_AGENT_KEY in `x-api-key`; reviewers log in at `<host>/__annotate/api/login`
// with ANNOTATE_REVIEWER_KEY. With ANNOTATE_HOME_ORIGIN set (e.g. the production host), previews
// hand logins off to that host, so one login there covers every PR preview.
// With ANNOTATE_GITHUB_TOKEN set, "Send to agent" posts the notes as a comment on the PR.
const annotate = createAnnotateWorker({
  repo: "whitphx/slides",
  // This Worker's preview hosts (`<version or alias>-slides.whitphx.workers.dev`), which the home host may log in.
  trustOrigin: (origin) => /^https:\/\/[a-z0-9-]+-slides\.whitphx\.workers\.dev$/.test(origin),
});

// Static assets are served before this Worker runs,
// so it only sees paths with no matching file.
// Those are the annotation API and client-side routes of a deck, e.g. /<deck>/12 or /<deck>/presenter/3;
// each deck is its own SPA, so we serve that deck's index.html.
export default {
  async fetch(request, env) {
    const response = await annotate(request, env);
    if (response)
      return response;
    const url = new URL(request.url);
    const deck = url.pathname.split("/")[1];
    return env.ASSETS.fetch(new URL(`/${deck}/`, url));
  },
};
