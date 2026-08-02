import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Transactions from './pages/Transactions';
import Coupons from './pages/Coupons';
import SearchHistory from './pages/SearchHistory';
import Notifications from './pages/Notifications';
import AppInfo from './pages/AppInfo';
import Pricing from './pages/Pricing';
import AiProviders from './pages/AiProviders';

function isAuthed() {
  return Boolean(localStorage.getItem('admin_token'));
}

function ProtectedShell({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={isAuthed() ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedShell><Dashboard /></ProtectedShell>} />
      <Route path="/users" element={<ProtectedShell><Users /></ProtectedShell>} />
      <Route path="/users/:id" element={<ProtectedShell><UserDetail /></ProtectedShell>} />
      <Route path="/transactions" element={<ProtectedShell><Transactions /></ProtectedShell>} />
      <Route path="/coupons" element={<ProtectedShell><Coupons /></ProtectedShell>} />
      <Route path="/search-history" element={<ProtectedShell><SearchHistory /></ProtectedShell>} />
      <Route path="/notifications" element={<ProtectedShell><Notifications /></ProtectedShell>} />
      <Route path="/app-info" element={<ProtectedShell><AppInfo /></ProtectedShell>} />
      <Route path="/pricing" element={<ProtectedShell><Pricing /></ProtectedShell>} />
      <Route path="/ai-providers" element={<ProtectedShell><AiProviders /></ProtectedShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
