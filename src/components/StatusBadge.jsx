export default function StatusBadge({ status }) {
  const map = {
    approved: { cls: 'ok', label: 'Approved' },
    pending: { cls: 'warn', label: 'Pending' },
    rejected: { cls: 'danger', label: 'Rejected' },
    active: { cls: 'ok', label: 'Active' },
    inactive: { cls: 'neutral', label: 'Disabled' },
    online: { cls: 'ok', label: 'Online' },
    offline: { cls: 'neutral', label: 'Offline' },
  };
  const entry = map[status] || { cls: 'neutral', label: status };
  return <span className={`badge ${entry.cls}`}>{entry.label}</span>;
}
