import asgi
from workers import WorkerEntrypoint

# src/main.py is a symlink to main.py: the exact same file Uvicorn and
# Pyodide serve in steps 1 and 2.
from main import app


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        return await asgi.fetch(app, request, self.env, self.ctx)
