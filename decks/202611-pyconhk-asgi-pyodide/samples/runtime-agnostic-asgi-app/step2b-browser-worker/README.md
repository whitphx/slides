# Step 2b: the same bridge, in a Web Worker

Step 2 runs Pyodide on the page's main thread, which is the shortest path from
"JavaScript has a request" to "Python answered it": `asgiFetch` calls `dispatch`
directly.

Real apps move that work off the main thread, because Python running there
blocks rendering and input. This variant does exactly that and changes nothing
else: same `bridge.py`, same `main.py`, same ASGI call. The only difference is
that the call is made from a worker, so `asgiFetch` posts a message instead of
calling `dispatch` itself, and correlates replies by id.

This is the shape Stlite uses in production.

```sh
python3 -m http.server 8080   # from the repository root
# then open /step2b-browser-worker/
```
