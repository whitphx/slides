# samples

Runnable code behind the deck's code slides. `slides.md` imports from these files with `<<< @/samples/...`, so what the audience sees is what actually runs.

| Directory | What it is |
| --- | --- |
| `runtime-agnostic-asgi-app/` | The three-runtime demo app (Uvicorn, Pyodide in the browser, Cloudflare Workers). Vendored from [whitphx/runtime-agnostic-asgi-app-example](https://github.com/whitphx/runtime-agnostic-asgi-app-example), which this copy supersedes: edit here. |
| `raw-asgi/` | The framework-less ASGI app from "You don't even need a framework", with tests. |
| `streamlit-demo/` | The script from "What is Streamlit?". |

Slides select excerpts through `# region` / `// region` markers named `slide-*`. Renaming or deleting a region breaks the import, so grep `slides.md` before touching one.

Lockfiles must resolve against public PyPI, since this repo is public. This machine's uv config defaults to a private mirror, so re-lock with:

```sh
UV_DEFAULT_INDEX=https://pypi.org/simple uv lock
```
