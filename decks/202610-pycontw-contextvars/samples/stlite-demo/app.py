import numpy as np
import pandas as pd
import streamlit as st

st.title("Sales dashboard")
rows = st.slider("Rows", 10, 100, 60)
rng = np.random.default_rng(0)
walk = rng.normal(0.4, 2.0, (rows, 3)).cumsum(axis=0)
cols = ["North", "South", "East"]
st.line_chart(pd.DataFrame(walk, columns=cols))
