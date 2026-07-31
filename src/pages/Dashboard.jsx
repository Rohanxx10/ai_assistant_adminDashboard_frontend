import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await api.get('/api/admin/dashboard');
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load dashboard');
    }
  }

  if (error) return <div className="error-banner">{error}</div>;
  if (!stats) return <div className="spinner-row">Loading overview…</div>;

  const chartData = [
    { name: 'Pending', value: stats.pendingTransactions },
    { name: 'Approved', value: stats.approvedTransactions },
    { name: 'Rejected', value: stats.rejectedTransactions },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <div className="page-subtitle">A snapshot of enrollment, activity, and payments.</div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total users" value={stats.totalUsers} hint="All registrations" />
        <StatCard
          label={<><span className="dot online" /> Online now</>}
          value={stats.onlineUsers}
          hint="Active in the last 5 min"
        />
        <StatCard label="Activated" value={stats.activatedUsers} hint="App is runnable for these users" />
        <StatCard label="Pending review" value={stats.pendingTransactions} hint="Transactions awaiting you" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <h3>Transactions by status</h3>
          </div>
          <div style={{ padding: '16px 10px 6px', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5c6270' }} axisLine={{ stroke: '#e2e5ea' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5c6270' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e5ea', fontSize: 12.5 }}
                  cursor={{ fill: '#eef0f3' }}
                />
                <Bar dataKey="value" fill="#0f6e5c" radius={[6, 6, 0, 0]} maxBarSize={54} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent search activity</h3>
          </div>
          {stats.recentSearches.length === 0 ? (
            <div className="empty-state">No searches logged yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Query</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSearches.map((s) => (
                  <tr key={s.id}>
                    <td>{s.app_users?.full_name || '—'}</td>
                    <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.query}
                    </td>
                    <td className="text-faint">{new Date(s.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent transactions</h3>
        </div>
        {stats.recentTransactions.length === 0 ? (
          <div className="empty-state">No transactions submitted yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Transaction no.</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.app_users?.full_name || '—'}</td>
                  <td className="mono">{t.transaction_no}</td>
                  <td className="mono">₹{Number(t.final_amount).toFixed(2)}</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="text-faint">{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
