import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Users() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load users');
    }
  }

  async function toggleRunnable(user) {
    setBusyId(user.id);
    try {
      await api.patch(`/api/admin/users/${user.id}`, { runnable: !user.runnable });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update user');
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(user) {
    setBusyId(user.id);
    try {
      await api.patch(`/api/admin/users/${user.id}`, { isActive: !user.is_active });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update user');
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <div className="error-banner">{error}</div>;
  if (!users) return <div className="spinner-row">Loading users…</div>;

  const filtered = users
    .filter((u) => {
      if (filter === 'online') return u.online;
      if (filter === 'runnable') return u.runnable;
      if (filter === 'locked') return !u.runnable;
      return true;
    })
    .filter((u) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <div className="page-subtitle">Everyone who registered on the desktop app, and who's online now.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="all">All users</option>
          <option value="online">Online now</option>
          <option value="runnable">Activated (runnable)</option>
          <option value="locked">Locked</option>
        </select>
        <div className="text-faint" style={{ marginLeft: 'auto' }}>
          {filtered.length} of {users.length}
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">No users match this filter.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>App access</th>
                <th>Last seen</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Link to={`/users/${u.id}`} style={{ fontWeight: 600, textDecoration: 'none' }}>
                      {u.full_name}
                    </Link>
                  </td>
                  <td className="text-soft">{u.email}</td>
                  <td>
                    <span className={`dot ${u.online ? 'online' : 'offline'}`} style={{ marginRight: 6 }} />
                    {u.online ? 'Online' : 'Offline'}
                  </td>
                  <td>
                    <StatusBadge status={!u.is_active ? 'inactive' : u.runnable ? 'approved' : 'pending'} />
                  </td>
                  <td className="text-faint">{u.last_seen_at ? new Date(u.last_seen_at).toLocaleString() : 'Never'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className={`btn sm ${u.runnable ? 'ghost-danger' : 'ghost-ok'}`}
                        disabled={busyId === u.id}
                        onClick={() => toggleRunnable(u)}
                      >
                        {u.runnable ? 'Lock app' : 'Unlock app'}
                      </button>
                      <button className="btn sm" disabled={busyId === u.id} onClick={() => toggleActive(u)}>
                        {u.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
