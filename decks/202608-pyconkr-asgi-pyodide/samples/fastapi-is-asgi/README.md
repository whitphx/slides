# fastapi-is-asgi

The FastAPI app from the "So what does a framework give you?" slide. `slides.md` imports `app.py`; the tests back up what the slide claims, by calling the `app` object the way a server would.

```sh
uv run pytest
```

`test_app_object_takes_the_asgi_signature` reads `type(app).__call__`'s signature and asserts it is `(self, scope, receive, send)`. `test_calling_the_app_directly_answers_the_request` builds a scope by hand and awaits the app, with no server and no test client involved.
