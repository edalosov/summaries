export async function summarizeText(text, contentType) {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, content_type: contentType }),
  });
  if (!res.ok) {
    if (res.status === 504) {
      throw new Error('The request timed out. Try with a shorter text.');
    }
    const err = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}
