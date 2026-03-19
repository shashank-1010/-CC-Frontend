import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Notes from './pages/Notes';
import RideShare from './pages/RideShare';
import StudyGroups from './pages/StudyGroups';
import Activities from './pages/Activities';
import Polls from './pages/Polls';
import LostFound from './pages/LostFound'; // Add this import
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import ContentModeration from './pages/admin/ContentModeration';
import AdminLogs from './pages/admin/AdminLogs';
import Skills from './pages/Skills';

import Complaints from './pages/Complaints';
import ComplaintsManagement from './pages/admin/ComplaintsManagement';

function isLoggedIn() {
  return !!localStorage.getItem('cc_token');
}

function isAdmin() {
  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');
  return user?.role === 'admin';
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  if (isLoggedIn()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

        {/* Protected routes */}
        <Route path="/complaints" element={<PrivateRoute><Complaints /></PrivateRoute>} />
        <Route path="/admin/complaints" element={<AdminRoute><ComplaintsManagement /></AdminRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
        <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
        <Route path="/rides" element={<PrivateRoute><RideShare /></PrivateRoute>} />
        <Route path="/studygroups" element={<PrivateRoute><StudyGroups /></PrivateRoute>} />
        <Route path="/activities" element={<PrivateRoute><Activities /></PrivateRoute>} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/polls" element={<PrivateRoute><Polls /></PrivateRoute>} />
        <Route path="/lost-found" element={<PrivateRoute><LostFound /></PrivateRoute>} /> {/* Add this line */}
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UsersManagement /></AdminRoute>} />
        <Route path="/admin/moderation" element={<AdminRoute><ContentModeration /></AdminRoute>} />
        <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}