# samples

Runnable code behind the deck's code slides. `slides.md` imports from these files with `<<< @/samples/...`, so what the audience sees is what actually runs.

| Directory | What it is |
| --- | --- |
| `runtime-agnostic-asgi-app/` | The three-runtime demo app (Uvicorn, Pyodide in the browser, Cloudflare Workers). Vendored from [whitphx/runtime-agnostic-asgi-app-example](https://github.com/whitphx/runtime-agnostic-asgi-app-example), which this copy supersedes: edit here. |
| `first-fastapi-sample/` | The FastAPI app from "You deploy this pair every week", the first code the talk shows. |
| `raw-asgi/` | The framework-less ASGI apps from "You don't even need a framework" and "Now a POST", with tests. |
| `streamlit-demo/` | The script from "What is Streamlit?". |

Slides select excerpts through `# region` / `// region` markers named `slide-*`. Renaming or deleting a region breaks the import, so grep `slides.md` before touching one.

Lockfiles must resolve against public PyPI, since this repo is public. This machine's uv config sets a private mirror as its default index, and `UV_DEFAULT_INDEX` does not override a config file's default, so re-lock by ignoring the config outright:

```sh
UV_NO_CONFIG=1 uv lock
```

Check the result before committing it. A lock that resolved against the mirror carries its host, and `uv run` then fails for anyone who clones this repo:

```sh
grep -c pypi.org uv.lock   # want a non-zero count
```
