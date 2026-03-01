import { useState } from 'react';
import { Bell, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { AppNotification } from '../types';

interface Props {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onViewDismissed: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  replace:  'Replace',
  service:  'Service',
  'old-gear': 'Old Gear',
};

const TYPE_COLOR: Record<string, string> = {
  replace:    'bg-red-50 border-red-200 text-red-700',
  service:    'bg-amber-50 border-amber-200 text-amber-700',
  'old-gear': 'bg-slate-50 border-slate-200 text-slate-600',
};

export function NotificationsPanel({ notifications, onDismiss, onViewDismissed }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (notifications.length === 0) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      {/* Header row — click to collapse/expand */}
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse gear notifications' : 'Expand gear notifications'}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" aria-hidden="true" />
          <span className="text-xs font-bold text-amber-800">
            {notifications.length} gear notification{notifications.length > 1 ? 's' : ''}
          </span>
        </div>
        {expanded
          ? <ChevronUp   className="w-4 h-4 text-amber-600" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-amber-600" aria-hidden="true" />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-amber-100 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`inline-block text-[10px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border ${TYPE_COLOR[n.type] ?? 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                  <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                </div>
                <p className="text-[11px] text-slate-500">{n.body}</p>
              </div>
              <button
                onClick={() => onDismiss(n.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
                aria-label={`Dismiss notification: ${n.title}`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}

          <button
            onClick={onViewDismissed}
            className="text-xs text-amber-700 font-semibold underline text-left mt-0.5"
          >
            View dismissed notifications
          </button>
        </div>
      )}
    </div>
  );
}
