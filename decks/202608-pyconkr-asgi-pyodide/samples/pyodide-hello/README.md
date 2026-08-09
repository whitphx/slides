# pyodide-hello

The smallest thing that shows the boundary: JavaScript loads Pyodide, hands it Python source as a string, and gets the value back. `slides.md` imports `hello.mjs`.

```sh
npm install
npm start   # → Python 3.13.2 on emscripten
npm test    # runs it and checks the output
```

This project is outside the pnpm workspace (`decks/*` only matches direct children), so it keeps its own `node_modules` and `npm` is enough.
