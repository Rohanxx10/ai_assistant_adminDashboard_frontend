import { useEffect, useState } from 'react';
import api from '../api/client';

export default function AppInfo() {
  const [pages, setPages] = useState(null);
  const [error, setError] = useState('');
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [form, setForm] = useState({ slug: '', title: '', content: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await api.get('/api/app-info');
      setPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load app info pages');
    }
  }

  function edit(page) {
    setSelectedSlug(page.slug);
    setForm({ slug: page.slug, title: page.title, content: page.content });
  }

  function newPage() {
    setSelectedSlug(null);
    setForm({ slug: '', title: '', content: '' });
  }

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (selectedSlug) {
        await api.put(`/api/app-info/${selectedSlug}`, { title: form.title, content: form.content });
      } else {
        await api.post('/api/app-info', form);
      }
      newPage();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save page');
    } finally {
      setSaving(false);
    }
  }

  async function remove(slug) {
    if (!confirm(`Delete the "${slug}" page? This can't be undone.`)) return;
    try {
      await api.delete(`/api/app-info/${slug}`);
      if (selectedSlug === slug) newPage();
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete page');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">App info</h1>
          <div className="page-subtitle">
            Edit the "how to use the app" text and other help pages. Your desktop app can fetch these
            publicly at <code>GET /api/app-info</code> or <code>GET /api/app-info/&lt;slug&gt;</code> — no user login required.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <h3>Pages</h3>
            <button className="btn sm" onClick={newPage}>+ New page</button>
          </div>
          {!pages ? (
            <div className="spinner-row">Loading…</div>
          ) : pages.length === 0 ? (
            <div className="empty-state">No pages yet. Create one on the right.</div>
          ) : (
            <table>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.slug}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.title}</div>
                      <div className="mono text-faint">{p.slug}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn sm" onClick={() => edit(p)}>Edit</button>
                        <button className="btn sm ghost-danger" onClick={() => remove(p.slug)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>{selectedSlug ? `Editing "${selectedSlug}"` : 'New page'}</h3>
          </div>
          <form onSubmit={save} style={{ padding: 18 }}>
            {error && <div className="error-banner">{error}</div>}

            {!selectedSlug && (
              <div className="field">
                <label>Slug (used in the API URL, e.g. "how-to-use")</label>
                <input
                  type="text"
                  placeholder="how-to-use"
                  value={form.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  required
                />
              </div>
            )}

            <div className="field">
              <label>Title</label>
              <input
                type="text"
                placeholder="How to use this app"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Content</label>
              <textarea
                rows={10}
                placeholder="Write the instructions users will see…"
                value={form.content}
                onChange={(e) => update('content', e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : selectedSlug ? 'Save changes' : 'Create page'}
              </button>
              {selectedSlug && (
                <button type="button" className="btn" onClick={newPage}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
