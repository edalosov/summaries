const STORAGE_KEY = 'summaries_history';
const MAX_HISTORY = 20;

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function saveToHistory(inputText, contentType, summary) {
  const record = {
    id: Date.now(),
    input_text: inputText,
    input_preview: inputText.slice(0, 120).replace(/\n/g, ' '),
    content_type: contentType,
    summary,
    created_at: new Date().toISOString(),
  };

  const entries = readStore();
  entries.unshift(record);
  writeStore(entries.slice(0, MAX_HISTORY));
  return record;
}

export function getHistory() {
  return readStore().map(({ id, input_preview, content_type, summary, created_at }) => ({
    id,
    input_preview,
    content_type,
    title: summary?.title || 'Untitled',
    created_at,
  }));
}

export function getHistoryItem(id) {
  return readStore().find((item) => item.id === id) || null;
}

export function deleteHistoryItem(id) {
  writeStore(readStore().filter((item) => item.id !== id));
}
