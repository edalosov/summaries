import { useState } from 'react';

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'book_transcript', label: 'Book Transcript' },
  { value: 'article', label: 'Article' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'artist_commons', label: 'Artist Commons' },
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
      <div className="content-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`content-tab ${contentType === tab.value ? 'active' : ''}`}
            onClick={() => setContentType(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={contentType === 'artist_commons'
          ? 'Paste a voice call transcript here...'
          : 'Paste an article, book excerpt, or any text to summarize...'}
        rows={10}
        className="text-input-area"
      />
      <div className="text-input-footer">
        <span className="char-count">{text.length} characters</span>
        <button
          type="submit"
          disabled={isLoading || text.trim().length < 50}
          className="submit-btn"
        >
          {isLoading ? 'Summarizing...' : 'Summarize'}
        </button>
      </div>
    </form>
  );
}
