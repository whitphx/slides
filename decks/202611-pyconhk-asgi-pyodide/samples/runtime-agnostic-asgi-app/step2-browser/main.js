// A fetch()-compatible function whose "server" is Pyodide, running right here
// on the page, instead of the network.
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.4/full/pyodide.mjs";

async function boot() {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install(["fastapi", "python-multipart"]);

  // Load the exact same main.py that Uvicorn serves in step 1.
  for (const [url, filename] of [
    ["../main.py", "main.py"],
    ["./bridge.py", "bridge.py"],
  ]) {
    const source = await (await fetch(url)).text();
    pyodide.FS.writeFile(filename, source);
  }

  // region slide-call
  const { app } = pyodide.pyimport("main");
  const { handle_fetch } = pyodide.pyimport("bridge");
  // endregion slide-call
  return { pyodide, app, handle_fetch };
}

const bootPromise = boot();

async function toJsRequest(input, init) {
  const request = new Request(input, init);
  const url = new URL(request.url);
  return {
    method: request.method,
    path: url.pathname,
    query: url.search.replace(/^\?/, ""),
    headers: [...request.headers],
    body: new Uint8Array(await request.arrayBuffer()),
  };
}

// region slide-fetch
export async function asgiFetch(input, init) {
  const { pyodide, app, handle_fetch } = await bootPromise;
  const jsRequest = await toJsRequest(input, init);

  const pyRequest = pyodide.toPy(jsRequest);
  const result = await handle_fetch(app, pyRequest);
  const response = result.toJs({ dict_converter: Object.fromEntries });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
// endregion slide-fetch
