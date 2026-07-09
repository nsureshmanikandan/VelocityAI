import os
import json
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

SYSTEM_PROMPT = """You are a senior engineering productivity analyst specializing in AI tool adoption.
You analyze developer productivity metrics from before and after GitHub Copilot adoption.
Provide clear, actionable insights in markdown format with sections:
1. Key Productivity Gains
2. Copilot Adoption Analysis
3. Confidence & Learning Curve
4. Recommendations for the Team
Keep response focused and practical (under 400 words)."""

def stream_insights(metrics_json: str):
    endpoint   = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
    api_key    = os.getenv("AZURE_OPENAI_API_KEY")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01")

    url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version={api_version}"

    resp = requests.post(
        url,
        headers={"api-key": api_key, "Content-Type": "application/json"},
        json={
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze these productivity metrics:\n\n{metrics_json}"},
            ],
            "max_tokens": 600,
        },
        timeout=60,
    )
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    # Yield word by word so the frontend renders progressively
    import time
    for word in content.split(" "):
        yield word + " "
        time.sleep(0.02)
