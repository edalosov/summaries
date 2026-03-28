import json
import os
import anthropic

SYSTEM_PROMPT = """You are a precise text summarization engine. You produce structured JSON summaries that preserve ALL essential information. You never omit important details for the sake of brevity — a longer, complete summary is always preferred over a short, lossy one.

You MUST respond with valid JSON matching this exact schema, and nothing else:

{
  "title": "<A concise descriptive title for the text>",
  "key_themes": ["<theme1>", "<theme2>", ...],
  "detailed_summary": "<A thorough multi-paragraph summary that captures all essential information, arguments, evidence, and nuance. This should be as long as needed to be complete. Use \\n\\n to separate paragraphs.>",
  "key_quotes": [
    {"quote": "<exact verbatim quote from the text>", "context": "<one sentence on why this quote matters>"}
  ],
  "takeaways": ["<takeaway1>", "<takeaway2>", ...]
}

Rules:
1. The detailed_summary must retain ALL essential information. Err on the side of being too thorough rather than too brief.
2. key_quotes must be EXACT verbatim excerpts from the input text. Target approximately 10% of the total text length in quotes. For a 1000-word text, include roughly 100 words of quotes spread across multiple selections.
3. key_themes should contain 3-7 themes.
4. takeaways should contain 3-7 actionable or notable conclusions.
5. Respond ONLY with the JSON object. No markdown fencing, no preamble, no explanation."""


def generate_summary(text, content_type="general"):
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    user_message = f"""Content type: {content_type}

TEXT TO SUMMARIZE:
---
{text}
---

Summarize the above text following the system instructions exactly."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        temperature=0,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text

    # Strip markdown fencing if present
    if raw.startswith("```"):
        lines = raw.split("\n")
        lines = lines[1:]  # remove opening fence
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        raw = "\n".join(lines)

    summary = json.loads(raw)

    # Validate required keys
    required_keys = {"title", "key_themes", "detailed_summary", "key_quotes", "takeaways"}
    missing = required_keys - set(summary.keys())
    if missing:
        raise ValueError(f"Summary missing required keys: {missing}")

    return summary
