export default function SummaryOutput({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="summary-output loading-state">
        <div className="spinner" />
        <p>Generating summary...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="summary-output empty-state">
        <h3>Your summary will appear here</h3>
        <p>Paste some text above and click "Summarize" to get started.</p>
      </div>
    );
  }

  const isArtistCommons = summary._type === 'artist_commons';

  const handleCopy = async () => {
    const text = isArtistCommons ? formatArtistCommons(summary) : formatAsText(summary);
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="summary-output">
      <div className="summary-header">
        <h2>{summary.title}</h2>
        <button onClick={handleCopy} className="copy-btn" title="Copy to clipboard">
          Copy
        </button>
      </div>

      {isArtistCommons && (
        <section className="summary-section">
          <h3>Core Quotes</h3>
          <div className="core-quotes">
            {summary.core_quotes.map((q, i) => (
              <div key={i} className="core-quote-block">
                <blockquote className="core-quote-text">"{q.quote}"</blockquote>
                <p className="core-quote-context">{q.context}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="summary-section">
        {isArtistCommons && <h3>Detailed Summary</h3>}
        <div className="body-content">
          {summary.body.split('\n\n').map((para, i) => (
            <p key={i}>{renderWithQuotes(para)}</p>
          ))}
        </div>
      </section>

      {!isArtistCommons && summary.takeaways && (
        <section className="summary-section">
          <h3>Takeaways</h3>
          <ol className="takeaways">
            {summary.takeaways.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function renderWithQuotes(text) {
  const parts = text.split(/\[QUOTE\]|\[\/QUOTE\]/);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="inline-quote">"{part}"</span>
      : i > 0 ? part.replace(/^[.\s,;:]+/, '') : part
  );
}

function formatAsText(summary) {
  let text = `# ${summary.title}\n\n`;
  const body = summary.body
    .replace(/\[QUOTE\]/g, '"')
    .replace(/\[\/QUOTE\]/g, '"');
  text += `${body}\n\n`;
  text += `## Takeaways\n`;
  summary.takeaways.forEach((t, i) => {
    text += `${i + 1}. ${t}\n`;
  });
  return text;
}

function formatArtistCommons(summary) {
  let text = `# ${summary.title}\n\n`;
  text += `## Core Quotes\n\n`;
  summary.core_quotes.forEach((q, i) => {
    text += `> "${q.quote}"\n\n${q.context}\n\n`;
  });
  text += `## Detailed Summary\n\n`;
  const body = summary.body
    .replace(/\[QUOTE\]/g, '"')
    .replace(/\[\/QUOTE\]/g, '"');
  text += `${body}\n`;
  return text;
}
