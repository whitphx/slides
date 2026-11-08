# first-fastapi-sample

The FastAPI app from the "You deploy this pair every week" slide, the first code the talk shows. `slides.md` imports `main.py` whole, so the slide and the runnable app cannot drift apart.

```sh
uv run uvicorn main:app   # serve it, as the slide does
uv run pytest             # or call the endpoint with no server involved
```

```sh
$ curl -i localhost:8000/api/runtime
HTTP/1.1 200 OK
server: uvicorn
content-type: application/json

"Python 3.12.7 on darwin"
```

The endpoint reports the interpreter it is running on, which is what makes it worth keeping for the rest of the talk: the same app answers with `emscripten` once it runs on Pyodide in a browser tab.
