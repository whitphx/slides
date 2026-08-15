"""The slide shows a curl transcript next to the code. This makes the same
request without a server, so the status, the content type and the body shape
beside the code stay honest."""

import platform
import sys

import httpx

from main import app


async def test_runtime_endpoint_reports_this_interpreter():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/runtime")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    # Declared `-> str`, so FastAPI serialises it as a JSON string, quotes and all.
    assert response.json() == f"Python {platform.python_version()} on {sys.platform}"
