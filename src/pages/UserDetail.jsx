import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function UserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      const { data } = await api.get(`/api/admin/users/${id}`);
      setData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load user');
    }
  }

  async function toggleRunnable() {
    try {
      await api.patch(`/api/admin/users/${id}`, { runnable: !data.user.runnable });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update user');
    }
  }

  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return <div className="spinner-row">Loading user…</div>;

  const { user, transactions, searchHistory } = data;

  return (
    <div>
      <Link to="/users" className="text-faint" style={{ textDecoration: 'none' }}>
        ← Back to users
      </Link>

      <div className="page-header" style={{ marginTop: 10 }}>
        <div>
          <h1 className="page-title">{user.full_name}</h1>
          <div className="page-subtitle">{user.email} </div>
        </div>
        <button className={`btn ${user.runnable ? 'ghost-danger' : 'ghost-ok'}`} onClick={toggleRunnable}>
          {user.runnable ? 'Lock this user\'s app' : 'Unlock this user\'s app'}
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">App access</div>
          <div style={{ marginTop: 8 }}>
            <StatusBadge status={!user.is_active ? 'inactive' : user.runnable ? 'approved' : 'pending'} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Registered</div>
          <div className="text-soft" style={{ marginTop: 8 }}>{new Date(user.created_at).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last seen</div>
          <div className="text-soft" style={{ marginTop: 8 }}>
            {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never'}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h3>Transactions</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="empty-state">No transactions submitted yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Transaction no.</th>
                <th>UPI ID</th>
                <th>Amount</th>
                <th>Coupon</th>
                <th>Status</th>
                <th>Proof</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="mono">{t.transaction_no}</td>
                  <td className="mono text-soft">{t.upi_id || '—'}</td>
                  <td className="mono">₹{Number(t.final_amount).toFixed(2)}</td>
                  <td>{t.coupon_code || '—'}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    {t.screenshot_url ? (
                      <img
                        src={t.screenshot_url}
                        alt="UPI screenshot"
                        className="screenshot-thumb"
                        onClick={() => setScreenshot(t.screenshot_url)}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="text-faint">{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Search history</h3>
        </div>
        {searchHistory.length === 0 ? (
          <div className="empty-state">No searches logged yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Query</th>
                <th>Answer</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {searchHistory.map((h) => (
                <tr key={h.id}>
                  <td style={{ maxWidth: 260 }}>{h.query}</td>
                  <td className="text-soft" style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.answer || '—'}
                  </td>
                  <td className="text-faint">{new Date(h.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {screenshot && (
        <Modal onClose={() => setScreenshot(null)}>
          <img src={screenshot} alt="UPI screenshot full size" style={{ width: '100%', borderRadius: 8 }} />
        </Modal>
      )}
    </div>
  );
}
