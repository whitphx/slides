"""The `receive` side of the contract, checked the same two ways as `raw_asgi`.

The first test hands the body over in two `more_body` chunks, because that is
the case the `while` loop exists for and the one a single-chunk client never
exercises.
"""

import httpx

from raw_asgi_post import app


async def test_body_arriving_in_several_chunks():
    scope = {"type": "http", "method": "POST", "path": "/", "headers": []}

    chunks = [
        {"type": "http.request", "body": b"hello, ", "more_body": True},
        {"type": "http.request", "body": b"PyCon KR", "more_body": False},
    ]

    async def receive():
        return chunks.pop(0)

    events = []

    async def send(event):
        events.append(event)

    await app(scope, receive, send)

    start, body = events
    assert start["status"] == 200
    assert body["body"] == b"You said: hello, PyCon KR"
    assert chunks == [], "the app should stop asking once more_body is False"


async def test_via_httpx_asgi_transport():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/", content=b"hello, PyCon KR")

    assert response.status_code == 200
    assert response.text == "You said: hello, PyCon KR"
