import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'setup'
  const [form, setForm] = useState({ username: '', password: '', setupKey: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const path = mode === 'login' ? '/api/admin/login' : '/api/admin/setup-first-admin';
      const body =
        mode === 'login'
          ? { username: form.username, password: form.password }
          : { username: form.username, password: form.password, setupKey: form.setupKey };

      const { data } = await api.post(path, body);
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.admin.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-mark">L</div>
        <h2 style={{ margin: '0 0 4px' }}>{mode === 'login' ? 'Admin sign in' : 'Create the first admin'}</h2>
        <p className="text-soft" style={{ marginTop: 0, marginBottom: 20, fontSize: 13.5 }}>
          {mode === 'login'
            ? 'Sign in to manage users, transactions and coupons.'
            : 'Use the setup key from your backend .env file to create your admin account.'}
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => update('username', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
          </div>

          {mode === 'setup' && (
            <div className="field">
              <label>Setup key</label>
              <input
                type="password"
                value={form.setupKey}
                onChange={(e) => update('setupKey', e.target.value)}
                required
              />
            </div>
          )}

          <button className="btn primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 6 }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create admin account'}
          </button>
        </form>

        <button
          className="btn"
          style={{ width: '100%', marginTop: 10, background: 'transparent', border: 'none', color: '#5c6270' }}
          onClick={() => setMode(mode === 'login' ? 'setup' : 'login')}
        >
          {mode === 'login' ? "First time here? Create an admin account" : 'Back to sign in'}
        </button>
      </div>
    </div>
  );
}
