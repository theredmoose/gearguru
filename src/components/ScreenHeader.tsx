import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <div className="px-5 py-3 flex items-center justify-between bg-white border-b border-slate-100 shadow-sm">
      <div className="w-10 flex items-center justify-start">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 bg-slate-50 border border-slate-100 rounded-2xl text-emerald-700 shadow-sm hover:bg-white transition-all"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>
      <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">
        {title}
      </h1>
      <div className="w-10 flex items-center justify-end">
        {right}
      </div>
    </div>
  );
}
