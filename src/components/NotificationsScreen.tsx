import { ScreenHeader } from './ScreenHeader';
import type { AppNotification } from '../types';

interface Props {
  notifications: AppNotification[];
  onUndismiss: (id: string) => void;
  onBack: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  replace:    'bg-red-50 border-red-200 text-red-600',
  service:    'bg-amber-50 border-amber-200 text-amber-700',
  'old-gear': 'bg-slate-100 border-slate-200 text-slate-500',
};

const TYPE_LABEL: Record<string, string> = {
  replace:    'Replace',
  service:    'Service',
  'old-gear': 'Old Gear',
};

export function NotificationsScreen({ notifications, onUndismiss, onBack }: Props) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ScreenHeader title="Dismissed Notifications" onBack={onBack} />

      <div className="flex-1 overflow-y-auto bg-white px-6 py-6">
        {notifications.length === 0 ? (
          <p className="empty-state">No dismissed notifications.</p>
        ) : (
          <>
            <p className="text-[11px] text-slate-400 mb-4">
              These notifications have been dismissed. Restore them to show them on the home screen again.
            </p>
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`inline-block text-[10px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border ${TYPE_COLOR[n.type] ?? 'bg-slate-100 border-slate-200 text-slate-500'}`}
                        >
                          {TYPE_LABEL[n.type] ?? n.type}
                        </span>
                        <p className="text-sm font-semibold text-slate-500 truncate">{n.title}</p>
                      </div>
                      <p className="text-xs text-slate-400">{n.body}</p>
                    </div>
                    <button
                      onClick={() => onUndismiss(n.id)}
                      className="flex-shrink-0 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                      aria-label={`Restore notification: ${n.title}`}
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
