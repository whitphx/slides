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
  const { dispatch } = pyodide.pyimport("bridge");
  // endregion slide-call
  return { pyodide, app, dispatch };
}

const bootPromise = boot();

export async function appFetch(input, init) {
  const request = new Request(input, init);
  const url = new URL(request.url);
  const body = new Uint8Array(await request.arrayBuffer());
  const { pyodide, app, dispatch } = await bootPromise;

  // region slide-dispatch
  const result = await dispatch(app, pyodide.toPy({
    method: request.method,
    path: url.pathname,
    query: url.search.replace(/^\?/, ""),
    headers: [...request.headers],
    body,
  }));
  const response = result.toJs({ dict_converter: Object.fromEntries });
  // endregion slide-dispatch

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
