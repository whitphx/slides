import streamlit as st
import pandas as pd
import altair as alt

from main import process_sales_data


st.title("Sales Data Processor")

st.write("Upload a CSV file to process:")
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

if uploaded_file is None:
    st.stop()

df = pd.read_csv(uploaded_file)

df = await process_sales_data(df)

st.write(df)
st.download_button(
    label="Download processed data",
    data=df.to_csv(index=False),
    file_name="processed_sales_data.csv",
    mime="text/csv",
)

### Metrics
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric(label="Total orders", value=len(df))
with col2:
    total_revenue = df["purchase_amount"].sum()
    if total_revenue >= 1_000_000:
        revenue_display = f"${total_revenue / 1_000_000:.1f}M"
    elif total_revenue >= 1_000:
        revenue_display = f"${total_revenue / 1_000:.0f}K"
    else:
        revenue_display = f"${total_revenue:,.0f}"
    st.metric(label="Total revenue", value=revenue_display)
with col3:
    avg_order_value = df["purchase_amount"].mean()
    st.metric(label="Average order value", value=f"${avg_order_value:,.0f}")
with col4:
    positive_sentiment = len(df[df["sentiment"] == "POSITIVE"])
    sentiment_rate = positive_sentiment / len(df) * 100
    st.metric(label="Positive sentiment", value=f"{sentiment_rate:.1f}%")

### Charts
col1, col2 = st.columns(2)

with col1:
    st.subheader("Revenue by Customer Segment")
    segment_revenue = (
        df.groupby("customer_segment")["purchase_amount"].sum().reset_index()
    )
    st.bar_chart(segment_revenue.set_index("customer_segment")["purchase_amount"])


with col2:
    st.subheader("Top 10 States by Revenue")
    state_revenue = (
        df.groupby("state")["purchase_amount"]
        .sum()
        .sort_values(ascending=False)
        .head(10)
    )
    st.altair_chart(
        alt.Chart(state_revenue.reset_index())
        .mark_bar()
        .encode(x=alt.X("state", sort=None), y=alt.Y("purchase_amount")),
        use_container_width=True,
    )

col1, col2 = st.columns(2)

with col1:
    st.subheader("Payment Method Distribution")
    payment_counts = df["payment_method"].value_counts()
    st.altair_chart(
        alt.Chart(payment_counts.reset_index())
        .mark_bar()
        .encode(x=alt.X("payment_method", sort=None), y=alt.Y("count")),
        use_container_width=True,
    )

with col2:
    st.subheader("Sentiment Distribution")
    sentiment_counts = df["sentiment"].value_counts()
    st.altair_chart(
        alt.Chart(sentiment_counts.reset_index())
        .mark_bar()
        .encode(x=alt.X("sentiment", sort=None), y=alt.Y("count")),
        use_container_width=True,
    )

col1, col2 = st.columns(2)

with col1:
    st.subheader("Note Category Distribution")
    note_category_counts = df["note_category"].value_counts()
    st.altair_chart(
        alt.Chart(note_category_counts.reset_index())
        .mark_bar()
        .encode(x=alt.X("note_category", sort=None), y=alt.Y("count")),
        use_container_width=True,
    )

with col2:
    st.subheader("Identified Issues")
    issues_counts = df["identified_issues"].value_counts()
    st.altair_chart(
        alt.Chart(issues_counts.reset_index())
        .mark_bar()
        .encode(x=alt.X("identified_issues", sort=None), y=alt.Y("count")),
        use_container_width=True,
    )

st.subheader("Sales Note Analysis")
st.write("Sample sales notes:")
# Show a sample of sales notes in an expandable section
with st.expander("View sales notes samples"):
    sample_notes = df[["order_id", "customer_segment", "sales_note"]].head(10)
    st.dataframe(sample_notes, use_container_width=True)

st.subheader("Browse Data with Filters")

# Create filter columns
filter_col1, filter_col2, filter_col3 = st.columns(3)

with filter_col1:
    # Customer segment filter
    segments = ["All"] + sorted(df["customer_segment"].unique().tolist())
    selected_segment = st.selectbox("Customer Segment", segments)

    # Revenue category filter
    revenue_categories = ["All"] + sorted(df["revenue_category"].unique().tolist())
    selected_revenue_cat = st.selectbox("Revenue Category", revenue_categories)

with filter_col2:
    # Payment method filter
    payment_methods = ["All"] + sorted(df["payment_method"].unique().tolist())
    selected_payment = st.selectbox("Payment Method", payment_methods)

    # Sentiment filter
    sentiments = ["All"] + sorted(df["sentiment"].unique().tolist())
    selected_sentiment = st.selectbox("Sentiment", sentiments)

with filter_col3:
    # State filter
    states = ["All"] + sorted(df["state"].unique().tolist())
    selected_state = st.selectbox("State", states)

    # Note category filter
    note_categories = ["All"] + sorted(df["note_category"].unique().tolist())
    selected_note_cat = st.selectbox("Note Category", note_categories)

# Purchase amount range filter
st.write("Purchase Amount Range:")
min_amount = float(df["purchase_amount"].min())
max_amount = float(df["purchase_amount"].max())
amount_range = st.slider(
    "Select range",
    min_value=min_amount,
    max_value=max_amount,
    value=(min_amount, max_amount),
    format="$%.0f",
)

# Apply filters
filtered_df = df.copy()

if selected_segment != "All":
    filtered_df = filtered_df[filtered_df["customer_segment"] == selected_segment]
if selected_revenue_cat != "All":
    filtered_df = filtered_df[filtered_df["revenue_category"] == selected_revenue_cat]
if selected_payment != "All":
    filtered_df = filtered_df[filtered_df["payment_method"] == selected_payment]
if selected_sentiment != "All":
    filtered_df = filtered_df[filtered_df["sentiment"] == selected_sentiment]
if selected_state != "All":
    filtered_df = filtered_df[filtered_df["state"] == selected_state]
if selected_note_cat != "All":
    filtered_df = filtered_df[filtered_df["note_category"] == selected_note_cat]

# Apply amount range filter
filtered_df = filtered_df[
    (filtered_df["purchase_amount"] >= amount_range[0])
    & (filtered_df["purchase_amount"] <= amount_range[1])
]

# Show filtered results
st.write(f"Showing {len(filtered_df)} out of {len(df)} records")

# Display filtered data
st.dataframe(filtered_df, use_container_width=True)

# Show summary metrics for filtered data
if len(filtered_df) > 0:
    st.subheader("Filtered Data Summary")
    summary_col1, summary_col2, summary_col3, summary_col4 = st.columns(4)

    with summary_col1:
        st.metric("Filtered Records", len(filtered_df))
    with summary_col2:
        filtered_revenue = filtered_df["purchase_amount"].sum()
        if filtered_revenue >= 1_000_000:
            revenue_display = f"${filtered_revenue / 1_000_000:.1f}M"
        elif filtered_revenue >= 1_000:
            revenue_display = f"${filtered_revenue / 1_000:.0f}K"
        else:
            revenue_display = f"${filtered_revenue:,.0f}"
        st.metric("Total Revenue", revenue_display)
    with summary_col3:
        avg_amount = filtered_df["purchase_amount"].mean()
        st.metric("Average Amount", f"${avg_amount:,.0f}")
    with summary_col4:
        if len(filtered_df) > 0:
            positive_count = len(filtered_df[filtered_df["sentiment"] == "POSITIVE"])
            positive_rate = positive_count / len(filtered_df) * 100
            st.metric("Positive Sentiment", f"{positive_rate:.1f}%")
        else:
            st.metric("Positive Sentiment", "0%")
