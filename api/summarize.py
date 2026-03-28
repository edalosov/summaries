from http.server import BaseHTTPRequestHandler
import json
import os
import anthropic

SYSTEM_PROMPT = """You are a precise text summarization engine. You produce structured JSON summaries that preserve ALL essential information. You never omit important details for the sake of brevity — a longer, complete summary is always preferred over a short, lossy one.

You MUST respond with valid JSON matching this exact schema, and nothing else:

{
  "title": "<A concise descriptive title for the text>",
  "body": "<A thorough multi-paragraph summary with key quotes embedded inline. Use \\n\\n to separate paragraphs.>",
  "takeaways": ["<takeaway1>", "<takeaway2>", ...]
}

Rules:
1. VOICE: Write the body in the same voice, tone, and style as the original author. The summary should read as if the author is directly conveying the information to the reader. Do NOT write as a third-person analyst — never use phrases like "The author argues...", "The text discusses...", "This piece explores...". Instead, present the ideas directly, the way the original text does.
2. QUOTES: Embed exact verbatim quotes from the original text naturally into the body using the markers [QUOTE]exact words here[/QUOTE]. You MUST use exactly these markers — [QUOTE] to open and [/QUOTE] to close. Do NOT use guillemets, angle brackets, or any other format. IMPORTANT: Any trailing punctuation (periods, commas, etc.) that follows a quote must go INSIDE the [/QUOTE] marker, not after it. For example: [QUOTE]exact words here.[/QUOTE] NOT [QUOTE]exact words here[/QUOTE]. Weave quotes into the flow of the text like a well-written article would. Target approximately 10% of the total body length in quotes. For a 1000-word text, include roughly 100 words of quotes spread across multiple selections.
3. COMPLETENESS: The body must retain ALL essential information. Err on the side of being too thorough rather than too brief. A longer, complete summary is always preferred.
4. takeaways should contain 3-7 actionable or notable conclusions.
6. Respond ONLY with the JSON object. No markdown fencing, no preamble, no explanation."""


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON body."})
            return

        text = (data.get("text") or "").strip()
        if len(text) < 50:
            self._send_json(400, {"error": "Text is required and must be at least 50 characters."})
            return

        content_type = data.get("content_type", "general")

        try:
            summary = self._generate_summary(text, content_type)
            self._send_json(200, {"summary": summary})
        except Exception as e:
            self._send_json(502, {"error": f"Summarization failed: {str(e)}"})

    def _generate_summary(self, text, content_type):
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
            lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            raw = "\n".join(lines)

        summary = json.loads(raw)

        required_keys = {"title", "body", "takeaways"}
        missing = required_keys - set(summary.keys())
        if missing:
            raise ValueError(f"Summary missing required keys: {missing}")

        return summary

    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
