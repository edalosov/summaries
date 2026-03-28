import { useState, useEffect } from 'react';
import TextInput from './components/TextInput';
import SummaryOutput from './components/SummaryOutput';
import HistorySidebar from './components/HistorySidebar';
import { summarizeText, getHistory, getHistoryItem, deleteHistoryItem } from './api';
import './App.css';

export default function App() {
  const [currentSummary, setCurrentSummary] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHistory().then((data) => setHistory(data.summaries)).catch(() => {});
  }, []);

  const handleSubmit = async (text, contentType) => {
    setIsLoading(true);
    setError(null);
    setCurrentSummary(null);
    setActiveId(null);

    try {
      const result = await summarizeText(text, contentType);
      setCurrentSummary(result.summary);
      setActiveId(result.id);
      const updated = await getHistory();
      setHistory(updated.summaries);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (id) => {
    try {
      const record = await getHistoryItem(id);
      setCurrentSummary(record.summary);
      setActiveId(record.id);
      setError(null);
    } catch {
      setError('Failed to load summary.');
    }
  };

  const handleDelete = async (id) => {
    await deleteHistoryItem(id);
    setHistory((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) {
      setCurrentSummary(null);
      setActiveId(null);
    }
  };

  return (
    <div className="app">
      <HistorySidebar
        history={history}
        activeId={activeId}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />
      <main className="main-panel">
        <h1 className="app-title">Text Summarizer</h1>
        <TextInput onSubmit={handleSubmit} isLoading={isLoading} />
        {error && <div className="error-banner">{error}</div>}
        <SummaryOutput summary={currentSummary} isLoading={isLoading} />
      </main>
    </div>
  );
}
