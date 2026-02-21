import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <div className="px-4 py-3 flex items-center justify-between bg-blue-700 border-b border-blue-800 shadow-sm">
      <div className="w-10 flex items-center justify-start">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-blue-600 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
      <h1 className="text-base font-bold text-white uppercase tracking-wide">
        {title}
      </h1>
      <div className="w-10 flex items-center justify-end">
        {right}
      </div>
    </div>
  );
}
