import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Notifications() {
  const [notifications, setNotifications] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ userId: '', title: '', message: '', type: 'general' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    load();
    loadUsers();
  }, []);

  async function load() {
    try {
      const { data } = await api.get('/api/notifications/admin/all');
      setNotifications(data.notifications);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load notifications');
    }
  }

  async function loadUsers() {
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data.users);
    } catch (err) {
      // non-fatal, dropdown just stays empty
    }
  }

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function send(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await api.post('/api/notifications/admin/send', {
        userId: form.userId || null,
        title: form.title,
        message: form.message,
        type: form.type,
      });
      setForm({ userId: '', title: '', message: '', type: 'general' });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send notification');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <div className="page-subtitle">
            The desktop app polls occasionally — this isn't a live push channel, so use it for the occasional
            update, not frequent messages. A welcome notification is sent automatically on registration.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h3>Send a notification</h3>
        </div>
        <form onSubmit={send} style={{ padding: 18 }}>
          {error && <div className="error-banner">{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Send to</label>
              <select value={form.userId} onChange={(e) => update('userId', e.target.value)}>
                <option value="">Everyone (broadcast)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} — {u.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)}>
                <option value="general">General</option>
                <option value="alert">Alert</option>
                <option value="promo">Promo</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea rows={3} value={form.message} onChange={(e) => update('message', e.target.value)} required />
          </div>
          <button className="btn primary" type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send notification'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Sent history</h3>
        </div>
        {!notifications ? (
          <div className="spinner-row">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">Nothing sent yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>To</th>
                <th>Title</th>
                <th>Message</th>
                <th>Type</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id}>
                  <td>{n.user_id ? n.app_users?.full_name || 'User' : <span className="badge neutral">Everyone</span>}</td>
                  <td style={{ fontWeight: 600 }}>{n.title}</td>
                  <td
                    className="text-soft"
                    style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {n.message}
                  </td>
                  <td>
                    <span className={`badge ${n.type === 'welcome' ? 'ok' : 'neutral'}`}>{n.type}</span>
                  </td>
                  <td className="text-faint">{new Date(n.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
