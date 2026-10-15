import numpy as np
import streamlit as st

st.title("Sales dashboard")
rows = st.slider("Rows", 10, 100, 60)
st.line_chart(np.random.randn(rows, 3).cumsum(0))
