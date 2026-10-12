# Changelog

Each release's section is used as its GitHub release notes. Add a `## <version>` section
when bumping `version` in `package.json` (and in `.claude-plugin/plugin.json`).

## 0.1.0

First release.

- Slidev addon: an on-screen toolbar for leaving notes on slides, each saved with the slide
  number, click step, title and source line, in Agentation's annotation format (AFS v1.1).
- Annotation API compatible with Agentation's, so `agentation-mcp` lets agents read,
  acknowledge and resolve notes. Served by the `slidev` dev server (notes in a JSON file) or
  by a Cloudflare Worker (notes in D1) via `slidev-addon-annotate/worker`.
- Authentication: agent API keys, reviewer login with a signed cookie, and one login for
  many hosts through a home host.
- "Send to agent": posts pending notes as a pull request comment, by hand or automatically.
- Agent skill `slidev-annotate-notes` and a Claude Code plugin manifest.
