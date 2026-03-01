import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <div className="px-6 py-5 flex items-center justify-between bg-white border-b border-slate-100 shadow-sm">
      <div className="w-11 flex items-center justify-start">
        {onBack && (
          <button
            onClick={onBack}
            className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-emerald-700 shadow-sm hover:bg-white transition-all"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>
      <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
        {title}
      </h1>
      <div className="w-11 flex items-center justify-end">
        {right}
      </div>
    </div>
  );
}
