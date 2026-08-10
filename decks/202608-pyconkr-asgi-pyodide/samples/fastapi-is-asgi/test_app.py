"""The claim the slide makes: a FastAPI `app` is itself an ASGI application.

No test client, no server. The first test asserts what the slide's REPL shows;
the second goes further than the slide does and calls the object the way a
server would, which is the part that needs a scope, a receive and a send.
"""

import inspect
import json

from app import app


def test_app_takes_the_asgi_parameters():
    assert callable(app)
    assert list(inspect.signature(app).parameters) == ["scope", "receive", "send"]


async def test_awaiting_the_app_sends_the_response():
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

    # The call returns nothing; the response leaves through `send`.
    assert await app(scope, receive, send) is None
    assert [event["type"] for event in events] == [
        "http.response.start",
        "http.response.body",
    ]

    start, *body_events = events
    assert start["status"] == 200
    body = b"".join(event.get("body", b"") for event in body_events)
    assert json.loads(body) == {"hello": "PyCon KR"}
