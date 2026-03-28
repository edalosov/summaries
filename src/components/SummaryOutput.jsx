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

  const handleCopy = async () => {
    const text = formatAsText(summary);
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

      <section className="summary-section">
        <h3>Key Themes</h3>
        <div className="themes">
          {summary.key_themes.map((theme, i) => (
            <span key={i} className="theme-pill">{theme}</span>
          ))}
        </div>
      </section>

      <section className="summary-section">
        <div className="body-content">
          {summary.body.split('\n\n').map((para, i) => (
            <p key={i}>{renderWithQuotes(para)}</p>
          ))}
        </div>
      </section>

      <section className="summary-section">
        <h3>Takeaways</h3>
        <ol className="takeaways">
          {summary.takeaways.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function renderWithQuotes(text) {
  const parts = text.split(/«quote»|«\/quote»/);
  // Odd-indexed parts are inside quote markers
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="inline-quote">"{part}"</span>
      : part
  );
}

function formatAsText(summary) {
  let text = `# ${summary.title}\n\n`;
  text += `## Key Themes\n${summary.key_themes.join(', ')}\n\n`;
  const body = summary.body
    .replace(/«quote»/g, '"')
    .replace(/«\/quote»/g, '"');
  text += `${body}\n\n`;
  text += `## Takeaways\n`;
  summary.takeaways.forEach((t, i) => {
    text += `${i + 1}. ${t}\n`;
  });
  return text;
}
