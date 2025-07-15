from transformers import pipeline

sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
)

text = "I love LLMs!"

result = sentiment_analyzer(text)

print(result)
