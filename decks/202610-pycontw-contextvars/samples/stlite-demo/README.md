# stlite-demo

The Stlite app embedded live on the "No backend, just a tab" slide. The slide quotes `app.py` and the `<streamlit-app>` part of `stlite.html`, so keep both short. `scripts/sync-demo-assets.mjs` copies them to `public/stlite-demo/` before every `dev`, `build` and `export`.

To run it on its own, serve this directory as static files and open `stlite.html`:

```sh
python3 -m http.server 8000
```

`../../public/stlite-demo.png` is the still the slide shows when the live app cannot load. The app draws the same chart as the PyCon KR deck's sample, so the image is shared with that deck.
