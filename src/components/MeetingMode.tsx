import { useState, useEffect } from 'react';
import { Task } from '../lib/types';
import { Plus, Trash2, Clock, ArrowLeft, Archive, Calendar } from 'lucide-react';

interface MeetingModeProps {
  items: MeetingItem[];
  onUpdateItems: (items: MeetingItem[]) => void;
  onEndMeeting: (todayItems: Task[], parkingItems: Task[]) => void;
  onBackToBoard: () => void;
}

export interface MeetingItem {
  id: string;
  title: string;
  note: string;
  routing: 'parking' | 'today';
}

export function MeetingMode({ items, onUpdateItems, onEndMeeting, onBackToBoard }: MeetingModeProps) {
  const [duration, setDuration] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addItem = () => {
    const newItem: MeetingItem = {
      id: Date.now().toString(),
      title: '',
      note: '',
      routing: 'parking' // Default to Parking Lot
    };
    onUpdateItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<MeetingItem>) => {
    onUpdateItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: string) => {
    onUpdateItems(items.filter(item => item.id !== id));
  };

  const handleEndMeeting = () => {
    // Split items by routing
    const todayTasks: Task[] = items
      .filter(item => item.routing === 'today' && item.title.trim())
      .map(item => ({
        id: Date.now().toString() + Math.random(),
        title: item.title,
        note: item.note,
        completed: false
      }));

    const parkingTasks: Task[] = items
      .filter(item => item.routing === 'parking' && item.title.trim())
      .map(item => ({
        id: Date.now().toString() + Math.random(),
        title: item.title,
        note: item.note,
        completed: false
      }));

    setShowConfirmation(true);

    setTimeout(() => {
      onEndMeeting(todayTasks, parkingTasks);
      setShowConfirmation(false);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#070815] transition-colors duration-200">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 dark:border-[rgba(148,163,184,0.35)] px-6 flex items-center justify-between bg-white dark:bg-[#070815] transition-colors duration-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToBoard}
            className="flex items-center gap-2 text-gray-600 dark:text-[#B7C0D8] hover:text-gray-900 dark:hover:text-[#F8FAFF] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Board</span>
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-[rgba(148,163,184,0.35)]" />
          <h1 className="text-gray-900 dark:text-[#F8FAFF]">Meeting Mode</h1>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-[#B7C0D8]">
          <Clock className="w-4 h-4" />
          <span className="tabular-nums">{formatDuration(duration)}</span>
        </div>
      </header>

      {/* Single Column List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-gray-50 dark:bg-[#111322] border border-gray-200 dark:border-[rgba(148,163,184,0.35)] rounded-lg p-4 space-y-3 transition-colors duration-200"
            >
              {/* Title and Delete */}
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    placeholder="Meeting item..."
                    className="w-full bg-white dark:bg-[#070815] px-3 py-2 border border-gray-300 dark:border-[rgba(148,163,184,0.35)] rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-gray-900 dark:text-[#F8FAFF] placeholder-gray-400 dark:placeholder-[#6E7690] transition-colors duration-200"
                    autoFocus={index === items.length - 1}
                  />
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-[#F97373] rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Note */}
              <textarea
                value={item.note}
                onChange={(e) => updateItem(item.id, { note: e.target.value })}
                placeholder="Optional note..."
                rows={2}
                className="w-full bg-white dark:bg-[#070815] px-3 py-2 text-sm border border-gray-300 dark:border-[rgba(148,163,184,0.35)] rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 resize-y text-gray-900 dark:text-[#F8FAFF] placeholder-gray-400 dark:placeholder-[#6E7690] transition-colors duration-200"
              />

              {/* Routing Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-[#B7C0D8]">Send to:</span>
                <div className="inline-flex bg-white dark:bg-[#070815] border border-gray-300 dark:border-[rgba(148,163,184,0.35)] rounded-lg p-1 transition-colors duration-200">
                  <button
                    onClick={() => updateItem(item.id, { routing: 'parking' })}
                    className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1.5 ${
                      item.routing === 'parking'
                        ? 'bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900'
                        : 'text-gray-600 dark:text-[#B7C0D8] hover:text-gray-900 dark:hover:text-[#F8FAFF]'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Parking Lot</span>
                  </button>
                  <button
                    onClick={() => updateItem(item.id, { routing: 'today' })}
                    className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1.5 ${
                      item.routing === 'today'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 dark:text-[#B7C0D8] hover:text-gray-900 dark:hover:text-[#F8FAFF]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Today</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-16 text-gray-400 dark:text-[#6E7690]">
              <p>No items yet. Add your first meeting item below.</p>
            </div>
          )}

          {/* Add Item Button */}
          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-[rgba(148,163,184,0.35)] text-gray-600 dark:text-[#B7C0D8] rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add item</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-20 border-t border-gray-200 dark:border-[rgba(148,163,184,0.35)] px-6 flex items-center justify-center bg-gray-50 dark:bg-[#0A0B12] transition-colors duration-200">
        <button
          onClick={handleEndMeeting}
          disabled={items.filter(i => i.title.trim()).length === 0}
          className="px-8 py-3 bg-lime-500 text-gray-900 rounded-lg hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          End meeting
        </button>
      </footer>

      {/* Confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none bg-black/10 dark:bg-black/30">
          <div className="bg-white dark:bg-[#111322] border-2 border-lime-500 px-8 py-6 rounded-lg shadow-2xl">
            <p className="text-lg text-gray-900 dark:text-[#F8FAFF]">Items sent to board</p>
          </div>
        </div>
      )}
    </div>
  );
}