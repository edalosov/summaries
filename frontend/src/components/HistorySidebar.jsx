export default function HistorySidebar({ history, activeId, onSelect, onDelete }) {
  return (
    <aside className="history-sidebar">
      <h2>Recent ({history.length})</h2>
      {history.length === 0 && (
        <p className="history-empty">No summaries yet.</p>
      )}
      <ul className="history-list">
        {history.map((item) => (
          <li
            key={item.id}
            className={`history-item ${item.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <div className="history-item-content">
              <span className="history-title">{item.title}</span>
              <span className="history-meta">
                <span className="history-type">{item.content_type}</span>
                <span className="history-date">{formatDate(item.created_at)}</span>
              </span>
            </div>
            <button
              className="history-delete"
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              title="Delete"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}
