import argparse
import logging
import pandas as pd
import re

logger = logging.getLogger(__name__)


def process_data(df):
    # 1. Calculate sales metrics
    df["revenue_category"] = df["purchase_amount"].apply(
        lambda x: "High" if x > 50000 else "Medium" if x > 10000 else "Low"
    )

    # 2. Standardize payment methods
    payment_mapping = {
        "Credit Card": "Card",
        "Bank Transfer": "Transfer",
        "Wire Transfer": "Transfer",
        "PayPal": "Digital",
    }
    df["payment_type"] = df["payment_method"].map(payment_mapping)

    # 3. Extract state from address
    df["state"] = df["delivery_address_area"].str.extract(r"([A-Z]{2})$")

    # 4. Categorize customer segments
    df["segment_priority"] = df["customer_segment"].map(
        {"Enterprise": 1, "SMB": 2, "Individual": 3}
    )

    return df

def anonymize_data(df):
    """Apply privacy protection measures"""

    # 1. Mask specific locations (keep only state)
    df["delivery_area_masked"] = df["delivery_address_area"].str.extract(r"([A-Z]{2})$")

    # 2. Remove sensitive information from notes
    def clean_sensitive_info(text):
        # Remove specific company names, numbers, and personal details
        text = re.sub(r"\b[A-Z][a-z]+ \d+\b", "[COMPANY_ID]", text)
        text = re.sub(r"\$\d+", "[AMOUNT]", text)
        text = re.sub(r"\d{2,}%", "[PERCENTAGE]", text)
        return text

    df["sales_note_cleaned"] = df["sales_note"].apply(clean_sensitive_info)

    # 3. Generalize customer feedback
    def generalize_feedback(text):
        # Remove specific product names and replace with generic terms
        text = re.sub(r"\b[A-Z][a-z]+\s+(team|service|support)\b", "[DEPARTMENT]", text)
        return text

    df["feedback_generalized"] = df["customer_feedback"].apply(generalize_feedback)

    return df


def process_sales_data(df):
    """
    Process sales data with different LLM processing methods.

    Args:
        df: Input DataFrame
    """
    logger.info("Processing structured data...")
    df = process_data(df)

    logger.info("Applying privacy protection...")
    df = anonymize_data(df)

    return df


def cli():
    parser = argparse.ArgumentParser(description="Process sales data")
    parser.add_argument(
        "--input", type=str, default="sales_data.csv", help="Input CSV file"
    )
    parser.add_argument(
        "--output", type=str, default="processed_sales_data.csv", help="Output CSV file"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Verbose output"
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO if args.verbose else logging.WARNING)

    logger.info(f"Loading sales data from {args.input}")
    df = pd.read_csv(args.input)

    df = process_sales_data(df)

    df.to_csv(args.output, index=False)

    print("\n=== PROCESSING SUMMARY ===")
    print(f"Total orders processed: {len(df)}")
    print(f"Revenue categories: {df['revenue_category'].value_counts().to_dict()}")
    print(f"Top 10 states by revenue: {df.groupby('state')['purchase_amount'].sum().sort_values(ascending=False).head(10).to_dict()}")

    print("\n=== SAMPLE RESULTS ===")
    sample_cols = [
        "order_id",
        "revenue_category",
        "delivery_area_masked",
        "sales_note_cleaned",
        "feedback_generalized",
    ]
    print(df[sample_cols].head())


if __name__ == "__main__":
    cli()
