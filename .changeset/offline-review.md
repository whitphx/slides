---
"slidev-addon-review-annotations": minor
---

Annotate offline or on a poor connection. Annotation changes go through an outbox in the
browser's `localStorage` and are saved once the server can be reached (when the browser
comes back online, every 30 seconds while changes are waiting, and on the next page load).
A deck opened online can be annotated after going offline. **Send to agent** saves waiting
changes before sending and holds the send until they are saved.
