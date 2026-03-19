import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/api';

interface AdminLog {
  _id: string;
  adminId: { name: string; email: string };
  action: string;
  targetType?: string;
  details?: string;
  createdAt: string;
}

const actionStyle: Record<string, string> = {
  ban_user:    'bg-amber-100 text-amber-700',
  unban_user:  'bg-emerald-100 text-emerald-700',
  delete_user: 'bg-rose-100 text-rose-700',
  delete_post: 'bg-rose-100 text-rose-700',
  delete_poll: 'bg-rose-100 text-rose-700',
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/logs').then(({ data }) => { setLogs(data); setLoading(false); });
  }, []);

  return (
    <DashboardLayout title="Admin Logs" subtitle="Complete history of all admin actions">
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Admin</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Details</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${actionStyle[log.action] || 'bg-slate-100 text-slate-600'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700 hidden md:table-cell">{log.adminId?.name || 'Admin'}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 max-w-xs truncate hidden lg:table-cell">{log.details || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="text-center text-slate-400 py-12 text-sm">No admin actions logged yet.</p>}
        </div>
      )}
    </DashboardLayout>
  );
}
