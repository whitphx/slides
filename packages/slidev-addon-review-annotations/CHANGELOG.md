# slidev-addon-review-annotations

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
