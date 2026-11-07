# Step 3: Cloudflare Workers

Runs the shared FastAPI app (`src/main.py`, a symlink to `../../main.py`) on Cloudflare's Python Workers runtime via the SDK's `asgi` module.

```sh
uv run pywrangler dev     # local dev server on http://localhost:8787
uv run pywrangler deploy  # deploy to Cloudflare
```

See the [repository README](../README.md) for the full three-step story.
