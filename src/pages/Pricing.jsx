import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Pricing() {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ amount: '', currency: 'INR', label: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await api.get('/api/price');
      setPrice(data);
      setForm({ amount: data.amount, currency: data.currency, label: data.label });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load price');
    }
  }

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/api/price', {
        amount: Number(form.amount),
        currency: form.currency,
        label: form.label,
      });
      setPrice(data.price);
      setSuccess('Price updated. The desktop app will pick this up next time it calls GET /api/price.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update price');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pricing</h1>
          <div className="page-subtitle">
            Set the amount your desktop app shows before a user pays. Fetched publicly at{' '}
            <code>GET /api/price</code> — no login required.
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Current price</div>
          <div className="stat-value">
            {price ? `${price.currency} ${Number(price.amount).toFixed(2)}` : '—'}
          </div>
          {price && <div className="text-faint" style={{ marginTop: 4 }}>{price.label}</div>}
        </div>
        <div className="stat-card">
          <div className="stat-label">Last updated</div>
          <div className="text-soft" style={{ marginTop: 8 }}>
            {price?.updated_at ? new Date(price.updated_at).toLocaleString() : '—'}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Update price</h3>
        </div>
        <form onSubmit={save} style={{ padding: 18, maxWidth: 420 }}>
          {error && <div className="error-banner">{error}</div>}
          {success && (
            <div
              style={{
                background: '#e5f6ec',
                color: '#0f7a4a',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {success}
            </div>
          )}

          <div className="field">
            <label>Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Currency</label>
            <select value={form.currency} onChange={(e) => update('currency', e.target.value)}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="field">
            <label>Label (shown alongside the price)</label>
            <input
              type="text"
              placeholder="App activation"
              value={form.label}
              onChange={(e) => update('label', e.target.value)}
              required
            />
          </div>

          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save price'}
          </button>
        </form>
      </div>
    </div>
  );
}
