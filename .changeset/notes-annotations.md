---
"slidev-addon-review-annotations": minor
---

Annotate speaker notes. The toolbar now also appears in the presenter view, where annotating
the notes panel marks the annotation with `slidev-target: notes`. The PR comment labels such
annotations "speaker notes", and the agent skill edits the slide's notes instead of its
content. Only the current slide and its notes can be annotated: Slidev's navigation
controls and menus and the next-slide preview are refused with a notice.
