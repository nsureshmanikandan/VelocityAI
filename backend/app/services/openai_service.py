import os
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

def get_openai_client() -> AzureOpenAI:
    return AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
    )

SYSTEM_PROMPT = """You are a senior engineering productivity analyst specializing in AI tool adoption.
You analyze developer productivity metrics from before and after GitHub Copilot adoption.
Provide clear, actionable insights in markdown format with sections:
1. Key Productivity Gains
2. Copilot Adoption Analysis
3. Confidence & Learning Curve
4. Recommendations for the Team
Keep response focused and practical (under 400 words)."""

def stream_insights(metrics_json: str):
    client = get_openai_client()
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")

    stream = client.chat.completions.create(
        model=deployment,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze these productivity metrics:\n\n{metrics_json}"}
        ],
        stream=True,
        max_tokens=600,
    )
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
