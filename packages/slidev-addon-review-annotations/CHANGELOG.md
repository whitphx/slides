# slidev-addon-review-annotations

## 0.3.0

### Minor Changes

- [#41](https://github.com/whitphx/slides/pull/41) [`4bcf604`](https://github.com/whitphx/slides/commit/4bcf604c45938287817ead16d6ae6dff69b392d7) Thanks [@whitphx](https://github.com/whitphx)! - Annotate speaker notes. The toolbar now also appears in the presenter view, where annotating
  the notes panel marks the annotation with `slidev-target: notes`. The PR comment labels such
  annotations "speaker notes", and the agent skill edits the slide's notes instead of its
  content. Only the current slide and its notes can be annotated: Slidev's navigation
  controls and menus and the next-slide preview are refused with a notice.

### Patch Changes

- [#43](https://github.com/whitphx/slides/pull/43) [`384ba1f`](https://github.com/whitphx/slides/commit/384ba1f8ac322dee3f6bf4bea3925e64b7bf1ccb) Thanks [@whitphx](https://github.com/whitphx)! - Leave Slidev's own UI out of annotating. While the toolbar is active, hovering Slidev's
  navigation controls, menus or the presenter's next-slide preview no longer highlights them,
  and they keep working, so slides can be changed without leaving annotate mode.

## 0.2.0

### Minor Changes

- [#37](https://github.com/whitphx/slides/pull/37) [`93bbd72`](https://github.com/whitphx/slides/commit/93bbd72c0aa52aff09c46bb1f51ea6fc29a9c1ed) Thanks [@whitphx](https://github.com/whitphx)! - Annotate offline or on a poor connection. Annotation changes go through an outbox in the
  browser's `localStorage` and are saved once the server can be reached (when the browser
  comes back online, every 30 seconds while changes are waiting, and on the next page load).
  A deck opened online can be annotated after going offline. **Send to agent** saves waiting
  changes before sending and holds the send until they are saved.

## 0.1.0

### Minor Changes

- [#34](https://github.com/whitphx/slides/pull/34) [`5f6ec1a`](https://github.com/whitphx/slides/commit/5f6ec1a2d39c36e14395e2b939910f820a9a3eea) Thanks [@whitphx](https://github.com/whitphx)! - Renamed from `slidev-addon-annotate`, so it isn't confused with Slidev's built-in drawing annotations. Everything named after the old package is renamed with it:
  
  - the package and the `addons:` entry: `slidev-addon-review-annotations`;
  - the settings: `SLIDEV_ANNOTATE*` becomes `SLIDEV_REVIEW_ANNOTATIONS*`;
  - the API path: `/__annotate/api` becomes `/__review-annotations/api`;
  - the Worker bindings: `ANNOTATE_*` and `ANNOTATIONS_DB` become `REVIEW_ANNOTATIONS_*` and `REVIEW_ANNOTATIONS_DB`;
  - the exports: `createAnnotateWorker`, `createAnnotateHandler` and the `Annotate*` types become `createReviewAnnotationsWorker`, `createReviewAnnotationsHandler` and `ReviewAnnotations*`;
  - the dispatch marker: `<!-- slidev-review-annotations:dispatch -->`;
  - the agent skill: `slidev-review-annotations`.
  
  The D1 tables, the login cookie and the dev-server store (`.review-annotations/`) are renamed too, so annotations and logins from the old package don't carry over. The UI now says "annotation" instead of "note".
