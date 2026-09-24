// Static assets are served before this Worker runs,
// so it only sees paths with no matching file.
// Those are client-side routes of a deck, e.g. /<deck>/12 or /<deck>/presenter/3,
// and each deck is its own SPA, so we serve that deck's index.html.
export default {
  fetch(request, env) {
    const url = new URL(request.url);
    const deck = url.pathname.split("/")[1];
    return env.ASSETS.fetch(new URL(`/${deck}/`, url));
  },
};
