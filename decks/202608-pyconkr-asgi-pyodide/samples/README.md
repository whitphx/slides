# raw-asgi-demo

The framework-less ASGI app shown on the "You don't even need a framework" slide, kept runnable so the slide code is verified working. `slides.md` imports `raw_asgi.py` directly.

```sh
uv run uvicorn raw_asgi:app   # serve it for real
uv run pytest                 # or drive it without any server
```
