import streamlit as st
import pandas as pd
import altair as alt

from process_data import process_sales_data


st.title("Sales Data Processor")

st.write("Upload a CSV file to process:")
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

if uploaded_file is None:
    st.stop()

df = pd.read_csv(uploaded_file)
with st.spinner("Processing data..."):
    df = process_sales_data(df)

st.write(df)
st.download_button(
    label="Download processed data",
    data=df.to_csv(index=False),
    file_name="processed_sales_data.csv",
    mime="text/csv",
)
