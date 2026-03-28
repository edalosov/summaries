const BASE = '/api';

export async function summarizeText(text, contentType) {
  const res = await fetch(`${BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, content_type: contentType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${BASE}/history`);
  return res.json();
}

export async function getHistoryItem(id) {
  const res = await fetch(`${BASE}/history/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function deleteHistoryItem(id) {
  await fetch(`${BASE}/history/${id}`, { method: 'DELETE' });
}
