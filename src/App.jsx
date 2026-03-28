import { useState, useEffect } from 'react';
import TextInput from './components/TextInput';
import SummaryOutput from './components/SummaryOutput';
import HistorySidebar from './components/HistorySidebar';
import { summarizeText } from './api';
import { saveToHistory, getHistory, getHistoryItem, deleteHistoryItem } from './historyStore';
import './App.css';

export default function App() {
  const [currentSummary, setCurrentSummary] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleSubmit = async (text, contentType) => {
    setIsLoading(true);
    setError(null);
    setCurrentSummary(null);
    setActiveId(null);

    try {
      const result = await summarizeText(text, contentType);
      const record = saveToHistory(text, contentType, result.summary);
      setCurrentSummary(result.summary);
      setActiveId(record.id);
      setHistory(getHistory());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (id) => {
    const record = getHistoryItem(id);
    if (record) {
      setCurrentSummary(record.summary);
      setActiveId(record.id);
      setError(null);
    }
  };

  const handleDelete = (id) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
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
