// @ts-nocheck
import React from 'react';
const { useState, useEffect } = React;
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/api';

type Section = 'marketplace' | 'notes' | 'rides' | 'studygroups' | 'activities' | 'polls';

const sections: { key: Section; label: string }[] = [
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'notes', label: 'Notes' },
  { key: 'rides', label: 'Rides' },
  { key: 'studygroups', label: 'Study Groups' },
  { key: 'activities', label: 'Activities' },
  { key: 'polls', label: 'Polls' },
];

function getTitle(item: any, section: Section) {
  if (section === 'marketplace') return item.title;
  if (section === 'notes') return `${item.title} — ${item.subject}`;
  if (section === 'rides') return `${item.from} → ${item.to}`;
  if (section === 'studygroups') return item.subject;
  if (section === 'activities') return item.title;
  if (section === 'polls') return item.question;
  return '';
}

export default function ContentModeration() {
  const [section, setSection] = useState<Section>('marketplace');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get(`/${section}`);
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [section]);

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this permanently?')) return;
    await api.delete(`/${section}/${id}`);
    load();
  };

  return (
    <DashboardLayout title="Content Moderation" subtitle="Review and remove posts across all sections">
      {/* Section tabs */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              section === s.key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Content</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Posted By</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any) => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-slate-800 max-w-xs truncate">{getTitle(item, section)}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    {item.status && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{item.status}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                    {item.userId?.name || 'Anonymous'}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => deleteItem(item._id)} className="text-xs px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors font-medium">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-center text-slate-400 py-12 text-sm">No content in this section.</p>}
        </div>
      )}
    </DashboardLayout>
  );
}
