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


### Metrics
col1, col2, col3 = st.columns(3)
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

### Charts
col1, col2 = st.columns(2)

with col1:
    st.subheader("Revenue by Customer Segment")
    segment_revenue = (
        df.groupby("customer_segment")["purchase_amount"].sum().reset_index()
    )
    st.bar_chart(segment_revenue.set_index("customer_segment")["purchase_amount"])


with col2:
    st.subheader("Payment Method Distribution")
    payment_counts = df["payment_method"].value_counts()
    st.altair_chart(
        alt.Chart(payment_counts.reset_index())
        .mark_bar()
        .encode(x=alt.X("payment_method", sort=None), y=alt.Y("count")),
        use_container_width=True,
    )

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

with filter_col3:
    # State filter
    states = ["All"] + sorted(df["state"].unique().tolist())
    selected_state = st.selectbox("State", states)

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
if selected_state != "All":
    filtered_df = filtered_df[filtered_df["state"] == selected_state]

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
    summary_col1, summary_col2, summary_col3 = st.columns(3)

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
