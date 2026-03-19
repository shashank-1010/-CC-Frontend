interface PostCardProps {
  title: string;
  description?: string;
  status: string;
  meta?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  extra?: React.ReactNode;
}

const statusConfig: Record<string, { cls: string; label: string }> = {
  available:  { cls: 'bg-emerald-100 text-emerald-700', label: 'Available' },
  active:     { cls: 'bg-emerald-100 text-emerald-700', label: 'Active' },
  open:       { cls: 'bg-emerald-100 text-emerald-700', label: 'Open' },
  public:     { cls: 'bg-emerald-100 text-emerald-700', label: 'Public' },
  reserved:   { cls: 'bg-amber-100 text-amber-700',     label: 'Reserved' },
  full:       { cls: 'bg-amber-100 text-amber-700',     label: 'Full' },
  pending:    { cls: 'bg-amber-100 text-amber-700',     label: 'Pending' },
  sold:       { cls: 'bg-slate-100 text-slate-600',     label: 'Sold' },
  cancelled:  { cls: 'bg-rose-100 text-rose-700',       label: 'Cancelled' },
  closed:     { cls: 'bg-rose-100 text-rose-700',       label: 'Closed' },
  removed:    { cls: 'bg-rose-100 text-rose-700',       label: 'Removed' },
  archived:   { cls: 'bg-slate-100 text-slate-600',     label: 'Archived' },
  completed:  { cls: 'bg-slate-100 text-slate-600',     label: 'Completed' },
};

export default function PostCard({ title, description, status, meta, onEdit, onDelete, extra }: PostCardProps) {
  const s = statusConfig[status] || { cls: 'bg-slate-100 text-slate-600', label: status };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug">{title}</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${s.cls}`}>{s.label}</span>
      </div>
      {description && <p className="text-slate-500 text-sm line-clamp-2 mb-3">{description}</p>}
      {meta && <div className="text-xs text-slate-400 mb-3">{meta}</div>}
      {extra && <div className="mb-3">{extra}</div>}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          {onEdit && (
            <button onClick={onEdit} className="flex-1 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="flex-1 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
