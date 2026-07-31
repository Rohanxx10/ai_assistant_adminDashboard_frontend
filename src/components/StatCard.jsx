export default function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="text-faint" style={{ marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
