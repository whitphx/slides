"""The claim the slide makes: a FastAPI `app` is itself an ASGI application.

No test client, no server. The tests call the object the way a server would.
"""

import inspect
import json

from app import app


def test_app_object_takes_the_asgi_signature():
    assert callable(app)
    parameters = list(inspect.signature(type(app).__call__).parameters)
    assert parameters == ["self", "scope", "receive", "send"]


async def test_calling_the_app_directly_answers_the_request():
    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "method": "GET",
        "scheme": "http",
        "path": "/hello",
        "raw_path": b"/hello",
        "query_string": b"",
        "headers": [],
    }

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    events = []

    async def send(event):
        events.append(event)

    await app(scope, receive, send)

    start, *body_events = events
    assert start["status"] == 200
    body = b"".join(event.get("body", b"") for event in body_events)
    assert json.loads(body) == {"hello": "PyCon KR"}
