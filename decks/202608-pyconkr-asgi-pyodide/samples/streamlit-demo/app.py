import streamlit as st

from data import load_data

st.title("Sales dashboard")
rows = st.slider("Rows", 10, 100, 60)
st.line_chart(load_data(rows))
