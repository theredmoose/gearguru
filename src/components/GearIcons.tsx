// Sport gear SVG icons — extracted from v3 sample design

interface IconProps {
  className?: string;
}

export function SkiIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="skiGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <path d="M22 58 L42 6 C43 4 45 2 41 2" fill="none" stroke="url(#skiGradRed)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M42 58 L22 6 C21 4 19 2 23 2" fill="none" stroke="url(#skiGradRed)" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="29" y="29" width="6" height="6" rx="1" fill="#1e293b" transform="rotate(45 32 32)" />
    </svg>
  );
}

export function BootIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <path d="M26 8 L42 10 C45 10.5 46 13 46 16 L44 44 L54 54 C56 56 54 60 50 60 L20 60 C16 60 16 56 18 52 L22 14 C22.5 10 23 8 26 8 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="28" y="16" width="16" height="2.5" rx="1" fill="#ef4444" />
      <rect x="26" y="24" width="18" height="2.5" rx="1" fill="#ef4444" />
      <rect x="28" y="38" width="14" height="2.5" rx="1" fill="#ef4444" />
      <rect x="30" y="46" width="14" height="2.5" rx="1" fill="#ef4444" />
      <path d="M23 11 L45 13" stroke="#0f172a" strokeWidth="3" />
      <path d="M18 54 L52 54 L49 60 L20 60 Z" fill="#0f172a" />
    </svg>
  );
}

export function PoleIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <line x1="22" y1="6" x2="16" y2="58" stroke="#1e293b" strokeWidth="2" />
      <line x1="42" y1="6" x2="48" y2="58" stroke="#1e293b" strokeWidth="2" />
      <path d="M19 6 Q22 4 25 6 L23 18 Q20 20 17 18 Z" fill="#eab308" />
      <path d="M39 6 Q42 4 45 6 L43 18 Q40 20 37 18 Z" fill="#eab308" />
      <ellipse cx="17" cy="52" rx="5" ry="2" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      <ellipse cx="47" cy="52" rx="5" ry="2" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
    </svg>
  );
}

export function HelmetIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <path d="M10 32 C10 12 22 8 32 8 C42 8 54 12 54 32 L54 48 C54 52 50 54 46 54 L18 54 C14 54 10 52 10 48 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" />
      <path d="M14 26 Q32 22 50 26 L50 36 Q32 32 14 36 Z" fill="#000000" />
      <path d="M16 28 Q32 25 48 28" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
      <path d="M18 29 Q25 28 28 30" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M10 38 Q7 42 10 48 L14 48 Q17 42 14 38 Z" fill="#1e3a8a" />
      <path d="M54 38 Q57 42 54 48 L50 48 Q47 42 50 38 Z" fill="#1e3a8a" />
      <rect x="22" y="14" width="4" height="2" rx="1" fill="white" fillOpacity="0.4" />
      <rect x="38" y="14" width="4" height="2" rx="1" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

export function SnowboardIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      {/* Board */}
      <path d="M18 10 Q14 10 12 16 L10 48 Q10 54 16 54 L48 54 Q54 54 54 48 L52 16 Q50 10 46 10 Z" fill="url(#boardGrad)" stroke="#3b0764" strokeWidth="1.5" />
      {/* Bindings */}
      <rect x="20" y="22" width="24" height="8" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
      <rect x="20" y="36" width="24" height="8" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
      {/* Center stripe */}
      <line x1="32" y1="12" x2="32" y2="52" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  );
}

export function SkateIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      {/* Boot */}
      <path d="M20 8 L38 10 C41 10.5 42 13 42 16 L40 38 L50 46 C52 48 50 52 46 52 L18 52 C14 52 14 48 16 44 L18 14 C18.5 10 19 8 20 8 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      {/* Boot toe box */}
      <path d="M38 40 L50 46 C52 48 50 52 46 52 L18 52" fill="#0f172a" stroke="none" />
      {/* Blade holder */}
      <rect x="14" y="50" width="36" height="4" rx="2" fill="#94a3b8" />
      {/* Blade */}
      <line x1="12" y1="54" x2="52" y2="54" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      {/* Ankle support straps */}
      <rect x="22" y="20" width="18" height="2.5" rx="1" fill="#3b82f6" />
      <rect x="20" y="30" width="20" height="2.5" rx="1" fill="#3b82f6" />
    </svg>
  );
}

// Map from GearType to icon component
export function GearTypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'ski':
      return <SkiIcon className={className} />;
    case 'boot':
      return <BootIcon className={className} />;
    case 'pole':
      return <PoleIcon className={className} />;
    case 'helmet':
      return <HelmetIcon className={className} />;
    case 'snowboard':
      return <SnowboardIcon className={className} />;
    case 'skate':
      return <SkateIcon className={className} />;
    default:
      return <HelmetIcon className={className} />;
  }
}
