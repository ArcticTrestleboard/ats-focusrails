import { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from '../lib/types';
import { Check, Clock, Zap, Calendar, Archive } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  sectionId: 'now' | 'today' | 'parking';
  onMoveTask: (taskId: string, targetSection: 'now' | 'today' | 'parking', targetIndex: number) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCompleteTask: (taskId: string) => void;
  nowTaskCount: number;
}

export function TaskCard({
  task,
  index,
  sectionId,
  onMoveTask,
  onUpdateTask,
  onCompleteTask,
  nowTaskCount
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editNote, setEditNote] = useState(task.note);

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { taskId: task.id, sectionId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { taskId: string; sectionId: string }) => {
      if (item.taskId !== task.id) {
        onMoveTask(item.taskId, sectionId, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdateTask(task.id, { 
        title: editTitle.trim(), 
        note: editNote.trim() 
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditNote(task.note);
    setIsEditing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFocusedTime = (remainingSeconds: number) => {
    const totalSeconds = 25 * 60;
    const elapsedSeconds = totalSeconds - remainingSeconds;
    const mins = Math.floor(elapsedSeconds / 60);
    if (mins === 0) return 'Just started';
    return `${mins} min focused`;
  };

  const getProgressPercentage = (remainingSeconds: number) => {
    const totalSeconds = 25 * 60;
    const elapsedSeconds = totalSeconds - remainingSeconds;
    return (elapsedSeconds / totalSeconds) * 100;
  };

  const hasPartialTime = task.remainingTime !== undefined && task.remainingTime < 25 * 60;

  const handleQuickMove = (e: React.MouseEvent, targetSection: 'now' | 'today' | 'parking') => {
    e.stopPropagation();
    // Move to the end of the target section
    onMoveTask(task.id, targetSection, 9999);
  };

  const nowIsFull = nowTaskCount >= 3 && sectionId !== 'now';

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`bg-gray-50 dark:bg-[#161827] rounded-lg border border-gray-200 dark:border-[rgba(148,163,184,0.35)] hover:border-gray-300 dark:hover:border-[rgba(148,163,184,0.5)] transition-all duration-200 group ${
        isEditing ? 'ring-2 ring-indigo-500 dark:ring-indigo-600' : ''
      }`}
    >
      {isEditing ? (
        <div className="p-4 space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === 'Escape') handleCancel();
            }}
            className="w-full px-2 py-1 border border-gray-300 dark:border-[rgba(148,163,184,0.35)] rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-[#070815] text-gray-900 dark:text-[#F8FAFF] transition-colors duration-200"
            autoFocus
          />
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel();
            }}
            placeholder="Optional note..."
            rows={2}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-[rgba(148,163,184,0.35)] rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 resize-none bg-white dark:bg-[#070815] text-gray-900 dark:text-[#F8FAFF] placeholder-gray-400 dark:placeholder-[#6E7690] transition-colors duration-200"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-200 dark:bg-[#111322] text-gray-700 dark:text-[#B7C0D8] rounded text-sm hover:bg-gray-300 dark:hover:bg-[#161827] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 group cursor-move relative">
            <div className="flex items-start gap-3">
              <button
                onClick={() => onCompleteTask(task.id)}
                className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-2 border-gray-400 dark:border-[#6E7690] hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center group/check"
              >
                <Check className="w-3 h-3 text-green-600 dark:text-green-400 opacity-0 group-hover/check:opacity-100 transition-opacity" />
              </button>
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <p className="text-gray-900 dark:text-[#F8FAFF]">{task.title}</p>
                {task.note && (
                  <p className="text-sm text-gray-500 dark:text-[#B7C0D8] mt-1">{task.note}</p>
                )}
                {hasPartialTime && sectionId === 'now' && (
                  <p className="text-xs text-lime-700 dark:text-lime-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatFocusedTime(task.remainingTime!)}
                  </p>
                )}
              </div>
            </div>

            {/* Quick-move buttons */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {/* NOW cards - To Today */}
              {sectionId === 'now' && (
                <button
                  onClick={(e) => handleQuickMove(e, 'today')}
                  className="p-1 bg-white dark:bg-[#111322] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded border border-gray-300 dark:border-[rgba(148,163,184,0.35)] hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                  title="To Today"
                >
                  <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-[#B7C0D8]" />
                </button>
              )}

              {/* Today cards - To NOW and To Parking Lot */}
              {sectionId === 'today' && (
                <>
                  <button
                    onClick={(e) => handleQuickMove(e, 'now')}
                    disabled={nowIsFull}
                    className={`p-1 rounded border transition-colors ${
                      nowIsFull
                        ? 'bg-gray-50 dark:bg-[#0A0B12] border-gray-200 dark:border-[rgba(148,163,184,0.2)] cursor-not-allowed'
                        : 'bg-white dark:bg-[#111322] hover:bg-lime-50 dark:hover:bg-lime-900/20 border-gray-300 dark:border-[rgba(148,163,184,0.35)] hover:border-lime-400 dark:hover:border-lime-600'
                    }`}
                    title={nowIsFull ? 'NOW is full (max 3)' : 'To NOW'}
                  >
                    <Zap className={`w-3.5 h-3.5 ${nowIsFull ? 'text-gray-400 dark:text-[#6E7690]' : 'text-gray-500 dark:text-[#B7C0D8]'}`} />
                  </button>
                  <button
                    onClick={(e) => handleQuickMove(e, 'parking')}
                    className="p-1 bg-white dark:bg-[#111322] hover:bg-gray-50 dark:hover:bg-[#161827] rounded border border-gray-300 dark:border-[rgba(148,163,184,0.35)] hover:border-gray-400 dark:hover:border-[rgba(148,163,184,0.5)] transition-colors"
                    title="To Parking Lot"
                  >
                    <Archive className="w-3.5 h-3.5 text-gray-500 dark:text-[#B7C0D8]" />
                  </button>
                </>
              )}

              {/* Parking Lot cards - To Today and To NOW */}
              {sectionId === 'parking' && (
                <>
                  <button
                    onClick={(e) => handleQuickMove(e, 'today')}
                    className="p-1 bg-white dark:bg-[#111322] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded border border-gray-300 dark:border-[rgba(148,163,184,0.35)] hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                    title="To Today"
                  >
                    <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-[#B7C0D8]" />
                  </button>
                  <button
                    onClick={(e) => handleQuickMove(e, 'now')}
                    disabled={nowIsFull}
                    className={`p-1 rounded border transition-colors ${
                      nowIsFull
                        ? 'bg-gray-50 dark:bg-[#0A0B12] border-gray-200 dark:border-[rgba(148,163,184,0.2)] cursor-not-allowed'
                        : 'bg-white dark:bg-[#111322] hover:bg-lime-50 dark:hover:bg-lime-900/20 border-gray-300 dark:border-[rgba(148,163,184,0.35)] hover:border-lime-400 dark:hover:border-lime-600'
                    }`}
                    title={nowIsFull ? 'NOW is full (max 3)' : 'To NOW'}
                  >
                    <Zap className={`w-3.5 h-3.5 ${nowIsFull ? 'text-gray-400 dark:text-[#6E7690]' : 'text-gray-500 dark:text-[#B7C0D8]'}`} />
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Progress bar at bottom for NOW tasks with partial time */}
          {hasPartialTime && sectionId === 'now' && (
            <div className="w-full bg-gray-100 dark:bg-[#0A0B12] h-1">
              <div
                key={`progress-${task.id}-${task.remainingTime}`}
                className="bg-lime-500 dark:bg-lime-400 h-1 transition-all"
                style={{ width: `${getProgressPercentage(task.remainingTime!)}%` }}
              ></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}