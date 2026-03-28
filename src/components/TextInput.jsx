import { useState } from 'react';

const CONTENT_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'article', label: 'Article' },
  { value: 'book_excerpt', label: 'Book Excerpt' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'interview', label: 'Interview / Transcript' },
];

export default function TextInput({ onSubmit, isLoading }) {
  const [text, setText] = useState('');
  const [contentType, setContentType] = useState('general');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length >= 50 && !isLoading) {
      onSubmit(text.trim(), contentType);
    }
  };

  return (
    <form className="text-input" onSubmit={handleSubmit}>
      <div className="text-input-header">
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="content-type-select"
        >
          {CONTENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <span className="char-count">{text.length} characters</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste an article, book excerpt, or any text to summarize..."
        rows={10}
        className="text-input-area"
      />
      <button
        type="submit"
        disabled={isLoading || text.trim().length < 50}
        className="submit-btn"
      >
        {isLoading ? 'Summarizing...' : 'Summarize'}
      </button>
    </form>
  );
}
