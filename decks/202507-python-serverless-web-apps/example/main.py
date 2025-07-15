import argparse
import logging
import pandas as pd
from transformers import pipeline
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


def process_unstructured_data_with_local_llm(df):
    """Process text data using AI/LLM with local transformers"""

    # Initialize sentiment analysis pipeline
    sentiment_analyzer = pipeline(
        "sentiment-analysis",
        model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
    )

    # Initialize text classification pipeline
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

    # 1. Sentiment analysis on customer feedback
    logger.info("Processing sentiment analysis with local LLM...")
    df["sentiment"] = pd.Series(dtype="string")
    df["sentiment_score"] = pd.Series(dtype="float")
    for idx, row in df.iterrows():
        text = row["customer_feedback"]
        result = sentiment_analyzer(text)[0]
        df.loc[idx, "sentiment"] = result["label"]
        df.loc[idx, "sentiment_score"] = result["score"]

    # 2. Classify sales notes into categories
    note_categories = [
        "technical_issue",
        "pricing_negotiation",
        "customer_relationship",
        "product_feedback",
    ]

    logger.info("Processing note classification with local LLM...")
    df["note_category"] = pd.Series(dtype="string")
    df["note_confidence"] = pd.Series(dtype="float")
    for idx, row in df.iterrows():
        text = row["sales_note"]
        result = classifier(text, note_categories)
        df.loc[idx, "note_category"] = result["labels"][0]
        df.loc[idx, "note_confidence"] = result["scores"][0]

    # 3. Extract key issues from feedback
    def extract_issues(text):
        issue_keywords = [
            "delay",
            "problem",
            "difficult",
            "improve",
            "issue",
            "slow",
            "complicated",
        ]
        issues = [word for word in issue_keywords if word in text.lower()]
        return ", ".join(issues) if issues else "none"

    df["identified_issues"] = df["customer_feedback"].apply(extract_issues)

    return df


def process_unstructured_data_with_llm_api(df):
    """Process text data using Pydantic AI for typed results"""
    from typing import Literal
    from pydantic import BaseModel
    from pydantic_ai import Agent

    class SentimentResult(BaseModel):
        sentiment: Literal["POSITIVE", "NEGATIVE"]
        confidence: float


    class NoteCategory(BaseModel):
        category: Literal["technical_issue", "pricing_negotiation", "customer_relationship", "product_feedback"]
        confidence: float

    sentiment_agent = Agent(
        'anthropic:claude-3-haiku-20240307',
        output_type=SentimentResult,
        output_retries=3,
        system_prompt="You are a sentiment analysis expert. Analyze the sentiment of customer feedback and return the sentiment (POSITIVE or NEGATIVE) with a confidence score between 0 and 1."
    )

    note_classification_agent = Agent(
        'anthropic:claude-3-haiku-20240307',
        output_type=NoteCategory,
        output_retries=3,
        system_prompt="You are a text classifier. Classify sales notes into one of these categories: technical_issue, pricing_negotiation, customer_relationship, or product_feedback. Return the category with a confidence score between 0 and 1."
    )

    # Process sentiment analysis using Pydantic AI
    logger.info("Processing sentiment analysis with LLM API...")
    df["sentiment"] = pd.Series(dtype="string")
    df["sentiment_score"] = pd.Series(dtype="float")

    for idx, row in df.iterrows():
        text = row["customer_feedback"]

        result = sentiment_agent.run_sync(f"Analyze the sentiment of this customer feedback: {text}")
        df.loc[idx, "sentiment"] = result.output.sentiment
        df.loc[idx, "sentiment_score"] = result.output.confidence

    # For note categorization, use Pydantic AI
    logger.info("Processing note classification with LLM API...")
    df["note_category"] = pd.Series(dtype="string")
    df["note_confidence"] = pd.Series(dtype="float")

    for idx, row in df.iterrows():
        text = row["sales_note"]

        result = note_classification_agent.run_sync(f"Classify this sales note: {text}")
        df.loc[idx, "note_category"] = result.output.category
        df.loc[idx, "note_confidence"] = result.output.confidence

    # Extract issues (same logic as local)
    def extract_issues(text):
        issue_keywords = ["delay", "problem", "difficult", "improve", "issue", "slow", "complicated"]
        issues = [word for word in issue_keywords if word in text.lower()]
        return ", ".join(issues) if issues else "none"

    df["identified_issues"] = df["customer_feedback"].apply(extract_issues)

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


def process_sales_data(df, use_local_llm=True):
    """
    Process sales data with different LLM processing methods.

    Args:
        df: Input DataFrame
        use_local_llm: Whether to use local LLM
    """
    logger.info("Processing structured data...")
    df = process_data(df)

    if use_local_llm:
        logger.info("Processing unstructured data with local LLM...")
        df = process_unstructured_data_with_local_llm(df)
    else:
        logger.info("Processing unstructured data with LLM API...")
        df = process_unstructured_data_with_llm_api(df)

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
        "--use-local-llm",
        action="store_true",
        help="Use local LLM"
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

    df = process_sales_data(df, use_local_llm=args.use_local_llm)

    df.to_csv(args.output, index=False)

    print("\n=== PROCESSING SUMMARY ===")
    print(f"Total orders processed: {len(df)}")
    print(f"Revenue categories: {df['revenue_category'].value_counts().to_dict()}")
    print(f"Sentiment distribution: {df['sentiment'].value_counts().to_dict()}")
    print(f"Note categories: {df['note_category'].value_counts().to_dict()}")

    print("\n=== SAMPLE RESULTS ===")
    sample_cols = [
        "order_id",
        "revenue_category",
        "sentiment",
        "note_category",
        "identified_issues",
    ]
    print(df[sample_cols].head())


if __name__ == "__main__":
    cli()
