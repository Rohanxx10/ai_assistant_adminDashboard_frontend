import { useEffect, useState } from 'react';
import api from '../api/client';

export default function SearchHistory() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await api.get('/api/search-history');
      setHistory(data.history);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load search history');
    }
  }

  if (error) return <div className="error-banner">{error}</div>;
  if (!history) return <div className="spinner-row">Loading search history…</div>;

  const filtered = history.filter((h) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      h.query.toLowerCase().includes(q) ||
      (h.answer || '').toLowerCase().includes(q) ||
      (h.app_users?.full_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Search history</h1>
          <div className="page-subtitle">What every user has asked the AI assistant, and the answer it gave.</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by user, query, or answer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">No search history matches.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Query</th>
                <th>Answer</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{h.app_users?.full_name || '—'}</div>
                    <div className="text-faint">{h.app_users?.email}</div>
                  </td>
                  <td style={{ maxWidth: 260 }}>{h.query}</td>
                  <td
                    className="text-soft"
                    style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {h.answer || '—'}
                  </td>
                  <td className="text-faint">{new Date(h.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
