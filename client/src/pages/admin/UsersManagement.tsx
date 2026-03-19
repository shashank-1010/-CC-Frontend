import React from 'react';
const { useState, useEffect } = React;
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/admin/users');
    setUsers(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const ban = async (id: string) => { await api.patch(`/admin/users/${id}/ban`); load(); };
  const unban = async (id: string) => { await api.patch(`/admin/users/${id}/unban`); load(); };
  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  return (
    <DashboardLayout title="User Management" subtitle="Manage all registered users">
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{u.name}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 hidden md:table-cell">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isBanned ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.role !== 'admin' && (
                      <div className="flex gap-2">
                        {u.isBanned
                          ? <button onClick={() => unban(u._id)} className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors font-medium">Unban</button>
                          : <button onClick={() => ban(u._id)} className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors font-medium">Ban</button>
                        }
                        <button onClick={() => deleteUser(u._id)} className="text-xs px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors font-medium">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-slate-400 py-12 text-sm">No users found.</p>}
        </div>
      )}
    </DashboardLayout>
  );
}
