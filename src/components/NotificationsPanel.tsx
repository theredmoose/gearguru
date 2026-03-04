import { X } from 'lucide-react';
import type { AppNotification } from '../types';
import { SECTION_HEADER_CLS, COLOR_PRIMARY } from '../constants/design';

interface Props {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onViewDismissed: () => void;
}

const TYPE_COLOR: Record<string, { bubble: string; dot: string }> = {
  replace:    { bubble: 'bg-red-50 border-red-100',    dot: 'bg-red-400' },
  service:    { bubble: 'bg-amber-50 border-amber-100', dot: 'bg-amber-400' },
  'old-gear': { bubble: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
};

const DEFAULT_COLOR = { bubble: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' };

export function NotificationsPanel({ notifications, onDismiss, onViewDismissed }: Props) {
  return (
    <div className="pb-2 flex flex-col gap-2.5">
      <h2 className={`${SECTION_HEADER_CLS} mb-3`} style={{ color: COLOR_PRIMARY }}>Alerts</h2>

      {notifications.length === 0 ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-3.5 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-white border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-sm leading-none text-[#008751] font-black">✓</span>
          </div>
          <div>
            <p className="text-sm font-black text-emerald-800">All clear</p>
            <p className="text-xs font-semibold text-emerald-600">No gear alerts for your family</p>
          </div>
        </div>
      ) : (
        <>
          {notifications.map((n) => {
            const { bubble, dot } = TYPE_COLOR[n.type] ?? DEFAULT_COLOR;
            return (
              <div
                key={n.id}
                className={`flex items-center gap-3 rounded-full px-4 py-3 border shadow-sm ${bubble}`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">{n.title}</p>
                  <p className="text-xs font-semibold text-slate-500 truncate">{n.body}</p>
                </div>
                <button
                  onClick={() => onDismiss(n.id)}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
                  aria-label={`Dismiss: ${n.title}`}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            );
          })}
          <button
            onClick={onViewDismissed}
            className="text-xs text-slate-400 font-semibold text-center mt-1 mb-1"
          >
            View dismissed
          </button>
        </>
      )}
    </div>
  );
}
