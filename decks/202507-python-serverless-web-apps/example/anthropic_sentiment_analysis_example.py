from anthropic import Anthropic

client = Anthropic()

text = "I love LLMs!"

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=100,
    messages=[{
        "role": "user",
        "content": f"Analyze the sentiment of this text: '{text}'. Respond with just: positive, negative, or neutral."
    }]
)

result = response.content[0].text.strip()

print(result)
