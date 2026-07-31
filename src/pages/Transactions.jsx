import { useEffect, useState } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function Transactions() {
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('pending');
  const [screenshot, setScreenshot] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    load();
  }, [status]);

  async function load() {
    try {
      const q = status === 'all' ? '' : `?status=${status}`;
      const { data } = await api.get(`/api/transactions${q}`);
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load transactions');
    }
  }

  async function review(id, newStatus) {
    setBusyId(id);
    try {
      await api.patch(`/api/transactions/${id}`, { status: newStatus });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update transaction');
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <div className="page-subtitle">Review UPI payment proofs and unlock user accounts.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['pending', 'approved', 'rejected', 'all'].map((s) => (
          <button
            key={s}
            className="btn sm"
            style={status === s ? { background: '#14532d', color: '#fff', borderColor: '#14532d' } : {}}
            onClick={() => setStatus(s)}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {!transactions ? (
          <div className="spinner-row">Loading transactions…</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">No {status !== 'all' ? status : ''} transactions.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Transaction no.</th>
                <th>UPI ID</th>
                <th>Amount</th>
                <th>Coupon</th>
                <th>Proof</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.app_users?.full_name || '—'}</div>
                    <div className="text-faint">{t.app_users?.email}</div>
                  </td>
                  <td className="mono">{t.transaction_no}</td>
                  <td className="mono text-soft">{t.upi_id || '—'}</td>
                  <td className="mono">
                    ₹{Number(t.final_amount).toFixed(2)}
                    {t.discount_percent > 0 && (
                      <div className="text-faint">{t.discount_percent}% off ₹{Number(t.amount).toFixed(2)}</div>
                    )}
                  </td>
                  <td>{t.coupon_code || '—'}</td>
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
                  <td><StatusBadge status={t.status} /></td>
                  <td className="text-faint">{new Date(t.created_at).toLocaleString()}</td>
                  <td>
                    {t.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn sm ghost-ok"
                          disabled={busyId === t.id}
                          onClick={() => review(t.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn sm ghost-danger"
                          disabled={busyId === t.id}
                          onClick={() => review(t.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
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
