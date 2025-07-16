import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from datetime import datetime, timedelta

st.set_page_config(
    page_title="Streamlit Introduction",
    page_icon="🚀",
    layout="wide"
)

st.title("🚀 Welcome to Streamlit!")
st.markdown("### Building Interactive Web Apps with Python")

st.markdown("---")

col1, col2 = st.columns(2)

with col1:
    st.header("📝 Text Elements")
    st.write("This is regular text")
    st.markdown("**Bold text** and *italic text*")
    st.code("print('Hello, World!')", language="python")
    
    st.header("🔢 Input Widgets")
    name = st.text_input("What's your name?", "Enter your name here")
    age = st.slider("How old are you?", 0, 100, 25)
    favorite_color = st.selectbox("Favorite color?", ["Red", "Blue", "Green", "Yellow"])
    
    if st.button("Say Hello!"):
        st.success(f"Hello {name}! You are {age} years old and love {favorite_color}!")

with col2:
    st.header("📊 Data Visualization")
    
    chart_type = st.radio("Choose chart type:", ["Line Chart", "Bar Chart", "Scatter Plot"])
    
    np.random.seed(42)
    data = pd.DataFrame({
        'Date': pd.date_range(datetime.now() - timedelta(days=30), periods=30),
        'Sales': np.random.randint(100, 1000, 30),
        'Profit': np.random.randint(10, 100, 30)
    })
    
    if chart_type == "Line Chart":
        fig = px.line(data, x='Date', y='Sales', title='Daily Sales')
        st.plotly_chart(fig, use_container_width=True)
    elif chart_type == "Bar Chart":
        fig = px.bar(data.tail(7), x='Date', y='Sales', title='Last 7 Days Sales')
        st.plotly_chart(fig, use_container_width=True)
    else:
        fig = px.scatter(data, x='Sales', y='Profit', title='Sales vs Profit')
        st.plotly_chart(fig, use_container_width=True)

st.markdown("---")

st.header("📋 Data Table")
st.dataframe(data.head(10), use_container_width=True)

st.markdown("---")

col3, col4, col5 = st.columns(3)

with col3:
    st.metric("Total Sales", f"${data['Sales'].sum():,}", f"{data['Sales'].pct_change().iloc[-1]:.1%}")

with col4:
    st.metric("Average Profit", f"${data['Profit'].mean():.0f}", f"{data['Profit'].pct_change().iloc[-1]:.1%}")

with col5:
    st.metric("Best Day", f"${data['Sales'].max():,}", "📈")

st.markdown("---")

with st.expander("🔍 More Features"):
    st.write("Streamlit offers many more features:")
    st.markdown("""
    - **File uploads**: `st.file_uploader()`
    - **Progress bars**: `st.progress()`
    - **Sidebars**: `st.sidebar`
    - **Tabs**: `st.tabs()`
    - **Forms**: `st.form()`
    - **Caching**: `@st.cache_data`
    - **Session state**: `st.session_state`
    """)

st.markdown("---")
st.info("💡 **Pro Tip**: Streamlit automatically reruns your script when you interact with widgets!")