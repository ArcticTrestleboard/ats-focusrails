import { useEffect } from 'react';
import { Undo2 } from 'lucide-react';

interface UndoToastProps {
  message?: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
  position?: 'bottom' | 'panel';
}

export function UndoToast({ 
  message = 'Task marked done', 
  onUndo, 
  onDismiss, 
  duration = 12000,
  position = 'bottom'
}: UndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (position === 'panel') {
    return (
      <div className="bg-gray-900 text-white rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg text-sm">
        <span>{message}</span>
        <button
          onClick={onUndo}
          className="flex items-center gap-1 text-lime-400 hover:text-lime-300 transition-colors"
        >
          <Undo2 className="w-3 h-3" />
          <span>Undo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-lg px-6 py-4 flex items-center gap-4 shadow-2xl animate-slide-up z-50">
      <span>{message}</span>
      <button
        onClick={onUndo}
        className="flex items-center gap-2 text-lime-400 hover:text-lime-300 transition-colors"
      >
        <Undo2 className="w-4 h-4" />
        <span>Undo</span>
      </button>
      <style>{`
        @keyframes slide-up {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
