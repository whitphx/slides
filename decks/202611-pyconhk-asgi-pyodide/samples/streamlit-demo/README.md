# streamlit-demo

The Streamlit app shown on the "What is Streamlit?" slide, kept runnable so the slide code is real. `slides.md` imports `app.py` whole, so keep it short; the data generation lives in `data.py` to stay out of the slide.

```sh
uv run streamlit run app.py
```

The slide shows two screenshots of this app at its default slider position, cropped to the main content area, one per slide theme:

| File | Captured with |
| --- | --- |
| `../../public/streamlit-demo.png` | `uv run streamlit run app.py` |
| `../../public/streamlit-demo-dark.png` | `uv run streamlit run app.py --theme.base dark` |
