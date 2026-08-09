// A fetch()-compatible function whose "server" is the Web Worker running the
// app in Pyodide, instead of the network.
const worker = new Worker("./worker.js", { type: "module" });

const pending = new Map();
let nextId = 0;

worker.onmessage = (event) => {
  const { id, response } = event.data;
  pending.get(id)(response);
  pending.delete(id);
};

export async function appFetch(input, init) {
  const request = new Request(input, init);
  const url = new URL(request.url);
  const body = new Uint8Array(await request.arrayBuffer());

  const id = nextId++;
  const { promise, resolve } = Promise.withResolvers();
  pending.set(id, resolve);
  worker.postMessage(
    {
      id,
      request: {
        method: request.method,
        path: url.pathname,
        query: url.search.replace(/^\?/, ""),
        headers: [...request.headers],
        body,
      },
    },
    [body.buffer],
  );

  const response = await promise;
  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
