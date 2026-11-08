import platform, sys
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/runtime")
async def runtime() -> str:
    py = platform.python_version()
    return f"Python {py} on {sys.platform}"
