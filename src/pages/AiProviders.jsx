import { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';

const emptyForm = { name: '', endpoint: '', apiKey: '', model: '', requestLimit: '', isActive: true };

export default function AiProviders() {
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [usageProvider, setUsageProvider] = useState(null);
  const [usageRows, setUsageRows] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await api.get('/api/ai-config/admin/providers');
      setProviders(data.providers);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load providers');
    }
  }

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      endpoint: p.endpoint,
      apiKey: p.api_key,
      model: p.model,
      requestLimit: p.request_limit ?? '',
      isActive: p.is_active,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        endpoint: form.endpoint,
        apiKey: form.apiKey,
        model: form.model,
        requestLimit: form.requestLimit === '' ? null : Number(form.requestLimit),
        isActive: form.isActive,
      };
      if (editingId) {
        await api.patch(`/api/ai-config/admin/providers/${editingId}`, payload);
      } else {
        await api.post('/api/ai-config/admin/providers', payload);
      }
      cancelEdit();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save provider');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p) {
    try {
      await api.patch(`/api/ai-config/admin/providers/${p.id}`, { isActive: !p.is_active });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update provider');
    }
  }

  async function remove(p) {
    if (!confirm(`Delete provider "${p.name}"? This can't be undone.`)) return;
    try {
      await api.delete(`/api/ai-config/admin/providers/${p.id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete provider');
    }
  }

  async function viewUsage(p) {
    setUsageProvider(p);
    setUsageRows(null);
    try {
      const { data } = await api.get(`/api/ai-config/admin/providers/${p.id}/usage`);
      setUsageRows(data.usage);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not load usage');
    }
  }

  async function toggleBlock(row) {
    try {
      await api.patch(`/api/ai-config/admin/providers/${usageProvider.id}/usage/${row.user_id}`, {
        blocked: !row.blocked,
      });
      await viewUsage(usageProvider);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update usage');
    }
  }

  async function resetUsage(row) {
    try {
      await api.patch(`/api/ai-config/admin/providers/${usageProvider.id}/usage/${row.user_id}`, {
        resetCount: true,
      });
      await viewUsage(usageProvider);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not reset usage');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI providers</h1>
          <div className="page-subtitle">
            The desktop app fetches the active provider's endpoint, API key, and model from{' '}
            <code>GET /api/ai-config</code>. Set a per-user request limit to cap usage — going over it
            disables that provider for that one user only, everyone else keeps working.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h3>{editingId ? 'Edit provider' : 'New provider'}</h3>
        </div>
        <form onSubmit={save} style={{ padding: 18 }}>
          {error && <div className="error-banner">{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Name</label>
              <input type="text" placeholder="OpenAI GPT-4o" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </div>
            <div className="field">
              <label>Model</label>
              <input type="text" placeholder="gpt-4o-mini" value={form.model} onChange={(e) => update('model', e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label>Endpoint URL</label>
            <input
              type="text"
              placeholder="https://api.openai.com/v1/chat/completions"
              value={form.endpoint}
              onChange={(e) => update('endpoint', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>API key</label>
            <input
              type="text"
              className="mono"
              placeholder="sk-..."
              value={form.apiKey}
              onChange={(e) => update('apiKey', e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Per-user request limit (blank = unlimited)</label>
              <input
                type="number"
                min="0"
                placeholder="Unlimited"
                value={form.requestLimit}
                onChange={(e) => update('requestLimit', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.isActive ? 'active' : 'inactive'} onChange={(e) => update('isActive', e.target.value === 'active')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create provider'}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        {!providers ? (
          <div className="spinner-row">Loading providers…</div>
        ) : providers.length === 0 ? (
          <div className="empty-state">No AI providers configured yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Model</th>
                <th>Endpoint</th>
                <th>Per-user limit</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="mono">{p.model}</td>
                  <td className="text-faint mono" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.endpoint}
                  </td>
                  <td>{p.request_limit === null ? 'Unlimited' : p.request_limit}</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'ok' : 'neutral'}`}>{p.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn sm" onClick={() => viewUsage(p)}>Usage</button>
                      <button className="btn sm" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn sm" onClick={() => toggleActive(p)}>
                        {p.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn sm ghost-danger" onClick={() => remove(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {usageProvider && (
        <Modal onClose={() => setUsageProvider(null)}>
          <h3 style={{ marginTop: 0 }}>Usage — {usageProvider.name}</h3>
          {!usageRows ? (
            <div className="spinner-row">Loading…</div>
          ) : usageRows.length === 0 ? (
            <div className="empty-state">No usage yet for this provider.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Used</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usageRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.app_users?.full_name}</div>
                      <div className="text-faint">{row.app_users?.email}</div>
                    </td>
                    <td className="mono">
                      {row.used_count}
                      {usageProvider.request_limit !== null ? ` / ${usageProvider.request_limit}` : ''}
                    </td>
                    <td>
                      <span className={`badge ${row.blocked ? 'danger' : 'ok'}`}>{row.blocked ? 'Blocked' : 'Allowed'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn sm" onClick={() => resetUsage(row)}>Reset</button>
                        <button className={`btn sm ${row.blocked ? 'ghost-ok' : 'ghost-danger'}`} onClick={() => toggleBlock(row)}>
                          {row.blocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </div>
  );
}
