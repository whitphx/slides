"""Bridges one HTTP request to one ASGI call, with no HTTP server involved.

This is the same job Uvicorn does for bytes read from a socket, and the same
job Cloudflare's Python Workers SDK does for a JS Request object. The design
comes from Shinylive, which did it first: it builds an ASGI scope from a
Request and awaits the app with its own receive and send. Stlite's bridge
follows that design, and this file is a trimmed copy of Stlite's, with
streaming, WebSocket, and error handling taken out:
- https://github.com/posit-dev/shinylive/blob/main/src/messageporthttp.ts
- https://github.com/whitphx/stlite/blob/main/packages/kernel/src/asgi-bridge.ts
- https://github.com/cloudflare/workers-py/blob/main/packages/runtime-sdk/src/asgi.py
"""


async def dispatch(app, request):
    """Call the ASGI ``app`` with one request and collect its whole response.

    ``request``: dict with "method", "path", "query" (str), "headers"
    (list of (name, value) pairs), and "body" (bytes-like).
    Returns a dict with "status", "headers", and "body".
    """
    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "method": request["method"],
        "scheme": "http",
        "path": request["path"],
        "raw_path": request["path"].encode(),
        "query_string": request["query"].encode(),
        "headers": [(k.lower().encode(), v.encode()) for k, v in request["headers"]],
    }

    request_body = bytes(request["body"])
    body_delivered = False

    async def receive():
        nonlocal body_delivered
        if body_delivered:
            return {"type": "http.disconnect"}
        body_delivered = True
        return {"type": "http.request", "body": request_body, "more_body": False}

    status = None
    headers = []
    chunks = []

    async def send(event):
        nonlocal status, headers
        if event["type"] == "http.response.start":
            status = event["status"]
            headers = [
                (k.decode("latin-1"), v.decode("latin-1")) for k, v in event["headers"]
            ]
        elif event["type"] == "http.response.body":
            chunks.append(bytes(event.get("body", b"")))

    await app(scope, receive, send)

    response = {"status": status, "headers": headers, "body": b"".join(chunks)}
    return response
