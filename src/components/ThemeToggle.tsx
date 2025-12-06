import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200
        ${isDark 
          ? 'bg-[#111322] border-[rgba(148,163,184,0.6)] text-[#F8FAFF] hover:bg-[#161827]' 
          : 'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50'
        }
      `}
    >
      {isDark ? (
        <>
          <Moon className="w-4 h-4 fill-current" />
          <span className="text-sm">Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 fill-current" />
          <span className="text-sm">Light</span>
        </>
      )}
    </button>
  );
}
