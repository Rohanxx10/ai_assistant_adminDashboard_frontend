import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Coupons() {
  const [coupons, setCoupons] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ code: '', discountPercent: '', maxUses: '', expiresAt: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await api.get('/api/coupons');
      setCoupons(data.coupons);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load coupons');
    }
  }

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function createCoupon(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/api/coupons', {
        code: form.code,
        discountPercent: Number(form.discountPercent),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
      setForm({ code: '', discountPercent: '', maxUses: '', expiresAt: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create coupon');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(coupon) {
    try {
      await api.patch(`/api/coupons/${coupon.id}`, { active: !coupon.active });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update coupon');
    }
  }

  async function remove(coupon) {
    if (!confirm(`Delete coupon ${coupon.code}? This can't be undone.`)) return;
    try {
      await api.delete(`/api/coupons/${coupon.id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete coupon');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Coupons</h1>
          <div className="page-subtitle">Create discount codes — set 100% to make the app free for a user.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h3>New coupon</h3>
        </div>
        <form onSubmit={createCoupon} style={{ padding: 18 }}>
          {error && <div className="error-banner">{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div className="field">
              <label>Code</label>
              <input
                type="text"
                placeholder="WELCOME100"
                value={form.code}
                onChange={(e) => update('code', e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="field">
              <label>Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 100"
                value={form.discountPercent}
                onChange={(e) => update('discountPercent', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Max uses (optional)</label>
              <input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={form.maxUses}
                onChange={(e) => update('maxUses', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Expires (optional)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => update('expiresAt', e.target.value)}
              />
            </div>
          </div>
          <button className="btn primary" type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create coupon'}
          </button>
        </form>
      </div>

      <div className="card">
        {!coupons ? (
          <div className="spinner-row">Loading coupons…</div>
        ) : coupons.length === 0 ? (
          <div className="empty-state">No coupons yet. Create your first one above.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Used</th>
                <th>Expires</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="mono" style={{ fontWeight: 600 }}>{c.code}</td>
                  <td>{c.discount_percent}% {Number(c.discount_percent) >= 100 && <span className="badge ok">Free</span>}</td>
                  <td>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                  <td className="text-faint">{c.expires_at ? new Date(c.expires_at).toLocaleString() : 'Never'}</td>
                  <td>
                    <span className={`badge ${c.active ? 'ok' : 'neutral'}`}>{c.active ? 'Active' : 'Disabled'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn sm" onClick={() => toggleActive(c)}>
                        {c.active ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn sm ghost-danger" onClick={() => remove(c)}>
                        Delete
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
