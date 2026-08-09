// Runs the FastAPI app inside Pyodide, in a Web Worker.
// Same bridge as step2-browser; only the thread it runs on differs.
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.4/full/pyodide.mjs";

async function boot() {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install(["fastapi", "python-multipart"]);

  // Load the exact same main.py that Uvicorn serves in step 1.
  for (const [url, filename] of [
    ["../main.py", "main.py"],
    ["../step2-browser/bridge.py", "bridge.py"],
  ]) {
    const source = await (await fetch(url)).text();
    pyodide.FS.writeFile(filename, source);
  }

  // region slide-call
  const { app } = pyodide.pyimport("main");
  const { dispatch } = pyodide.pyimport("bridge");
  // endregion slide-call
  return { app, dispatch, toPy: (value) => pyodide.toPy(value) };
}

const bootPromise = boot();

self.onmessage = async (event) => {
  const { id, request } = event.data;
  try {
    const { app, dispatch, toPy } = await bootPromise;
    // region slide-dispatch
    const result = await dispatch(app, toPy(request));
    const response = result.toJs({ dict_converter: Object.fromEntries });
    self.postMessage({ id, response }, [response.body.buffer]);
    // endregion slide-dispatch
  } catch (error) {
    self.postMessage({
      id,
      response: {
        status: 500,
        headers: [["content-type", "text/plain"]],
        body: new TextEncoder().encode(String(error)),
      },
    });
  }
};
