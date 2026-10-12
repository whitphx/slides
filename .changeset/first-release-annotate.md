---
"slidev-addon-annotate": minor
---

First release: leave notes on Slidev slides in the browser and let an AI coding agent apply them.

- Slidev addon with an on-screen toolbar; each note is saved with its slide number, click step, title and source line, in Agentation's annotation format (AFS v1.1).
- Annotation API compatible with Agentation's, so `agentation-mcp` lets agents read, acknowledge and resolve notes. Served by the `slidev` dev server (notes in a JSON file) or by a Cloudflare Worker (notes in D1) via `slidev-addon-annotate/worker`.
- Agent API keys, reviewer login with a signed cookie, and one login for many hosts through a home host.
- "Send to agent" posts pending notes as a pull request comment, by hand or automatically.
- The `slidev-annotate-notes` agent skill and a Claude Code plugin manifest.
