# raw-asgi-demo

The framework-less ASGI apps shown on the "You don't even need a framework" and "…and `receive` is how the body arrives" slides, kept runnable so the slide code is verified working. `slides.md` imports both modules directly.

`raw_asgi.py` answers with a fixed body, using only `scope` and `send`. `raw_asgi_post.py` adds the third argument: it drains `receive` until `more_body` is false, so it works whether the client sends the body in one piece or several.

```sh
uv run uvicorn raw_asgi:app        # serve the GET one
uv run uvicorn raw_asgi_post:app   # serve the POST one
uv run pytest                      # or drive both without any server
```

```sh
$ curl -i -X POST localhost:8000 -d 'hello, PyCon KR'
HTTP/1.1 200 OK
content-type: text/plain

You said: hello, PyCon KR
```
