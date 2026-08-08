"""Both tests play the server role, each at a different level: the first builds
`scope`/`receive`/`send` by hand (the talk's whole point), the second lets
httpx's ASGITransport do the same as an independent check."""

import httpx

from raw_asgi import app


async def test_direct_call():
    scope = {"type": "http", "method": "GET", "path": "/", "headers": []}

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    events = []

    async def send(event):
        events.append(event)

    await app(scope, receive, send)

    start, body = events
    assert start["type"] == "http.response.start"
    assert start["status"] == 200
    assert (b"content-type", b"text/plain") in start["headers"]
    assert body["type"] == "http.response.body"
    assert body["body"] == b"Hello, PyCon KR!"


async def test_via_httpx_asgi_transport():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/plain"
    assert response.text == "Hello, PyCon KR!"
