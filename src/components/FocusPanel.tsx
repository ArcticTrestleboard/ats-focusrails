import { useState, useEffect, useRef } from 'react';
import { Task } from '../lib/types';
import { Play, Pause, RotateCcw, Check, ChevronDown, Minimize2, X, LayoutGrid, Users, Clock } from 'lucide-react';
import { UndoToast } from './UndoToast';
import { useTimerState } from '../hooks/useTimerState';

interface UndoAction {
  type: 'complete-board' | 'complete-focus';
  task: Task;
  sourceSection: 'now' | 'today' | 'parking';
  sourceIndex: number;
  previousActiveTaskId?: string | null;
  previousTimerSeconds?: number;
  previousIsRunning?: boolean;
}

interface FocusPanelProps {
  userId: string | undefined;
  nowTasks: Task[];
  activeTaskId: string | null;
  onSetActiveTask: (taskId: string | null) => void;
  onCompleteTask: (taskId: string, timerSeconds: number, isRunning: boolean) => void;
  onDemoteTask: (taskId: string) => void;
  onOpenBoard?: () => void;
  onOpenMeeting?: () => void;
  undoAction: UndoAction | null;
  onUndo: () => void;
  onDismissUndo: () => void;
}

export function FocusPanel({
  userId,
  nowTasks,
  activeTaskId,
  onSetActiveTask,
  onCompleteTask,
  onDemoteTask,
  onOpenBoard,
  onOpenMeeting,
  undoAction,
  onUndo,
  onDismissUndo
}: FocusPanelProps) {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const lastSavedSeconds = useRef<number>(25 * 60);

  const { updateTimerState, resetTimerState } = useTimerState(userId);

  const activeTask = nowTasks.find(t => t.id === activeTaskId);
  const isUnderTwoMinutes = timerSeconds < 120 && timerSeconds > 0;

  // When active task changes, load new task's timer state
  useEffect(() => {
    if (activeTask) {
      // Load this task's remaining time from database (or default to 25:00)
      const taskRemainingTime = activeTask.remainingTime ?? 25 * 60;
      setTimerSeconds(taskRemainingTime);
      lastSavedSeconds.current = taskRemainingTime;
      // Auto-pause when switching tasks
      setIsRunning(false);
    }
  }, [activeTaskId]);

  // Persist timer state to database when it changes significantly (every 5 seconds)
  useEffect(() => {
    if (!activeTask) return;

    const secondsChanged = Math.abs(timerSeconds - lastSavedSeconds.current);
    if (secondsChanged >= 5 || timerSeconds === 0) {
      const elapsedSeconds = (25 * 60) - timerSeconds;
      updateTimerState(activeTask.id, elapsedSeconds, isRunning);
      lastSavedSeconds.current = timerSeconds;
    }
  }, [timerSeconds, activeTask?.id]);

  // Persist is_active state when isRunning changes
  useEffect(() => {
    if (!activeTask) return;
    const elapsedSeconds = (25 * 60) - timerSeconds;
    updateTimerState(activeTask.id, elapsedSeconds, isRunning);
  }, [isRunning]);

  // Restore timer state when undo happens
  useEffect(() => {
    if (undoAction?.type === 'complete-focus' && activeTaskId === undoAction.task.id) {
      if (undoAction.previousTimerSeconds !== undefined) {
        setTimerSeconds(undoAction.previousTimerSeconds);
      }
      if (undoAction.previousIsRunning !== undefined) {
        setIsRunning(undoAction.previousIsRunning);
      }
    }
  }, [undoAction, activeTaskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

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

  const handleComplete = async () => {
    if (activeTask) {
      onCompleteTask(activeTask.id, timerSeconds, isRunning);
      // Reset timer state in database
      await resetTimerState(activeTask.id);
      setTimerSeconds(25 * 60);
      setIsRunning(false);
      lastSavedSeconds.current = 25 * 60;
    }
  };

  const handleReset = async () => {
    if (activeTask) {
      // Reset timer state in database
      await resetTimerState(activeTask.id);
    }
    setTimerSeconds(25 * 60);
    setIsRunning(false);
    lastSavedSeconds.current = 25 * 60;
  };

  const nextTasks = nowTasks.filter(t => t.id !== activeTaskId).slice(0, 2);

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white dark:bg-[#111322] rounded-xl border-2 border-indigo-200 dark:border-[rgba(148,163,184,0.35)] transition-all duration-200 ${
        isMinimized ? 'w-80' : 'w-96'
      }`}
      style={{ 
        zIndex: 9999,
        boxShadow: '0 18px 40px rgba(0, 0, 0, 0.15), 0 18px 40px rgba(0, 0, 0, 0.65)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[rgba(148,163,184,0.35)] bg-indigo-50 dark:bg-indigo-900/20 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-lime-500 dark:bg-lime-400 rounded-full"></div>
          <span className="text-indigo-900 dark:text-indigo-300">FocusRails</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
          </button>
          <button className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 rounded transition-colors">
            <X className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-6 space-y-6">
          {/* Focus Panel Undo Toast */}
          {undoAction?.type === 'complete-focus' && (
            <UndoToast
              message="Task marked done"
              onUndo={onUndo}
              onDismiss={onDismissUndo}
              position="panel"
            />
          )}

          {/* Active Task */}
          {activeTask ? (
            <div className="bg-lime-50 dark:bg-lime-900/20 border-2 border-lime-400 dark:border-lime-500 rounded-lg p-4 transition-colors duration-200">
              <p className="text-xs text-lime-700 dark:text-lime-400 mb-1">Active NOW</p>
              <p className="text-gray-900 dark:text-[#F8FAFF]">{activeTask.title}</p>
              {activeTask.note && (
                <p className="text-sm text-gray-600 dark:text-[#B7C0D8] mt-1">{activeTask.note}</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-[#161827] border-2 border-dashed border-gray-300 dark:border-[rgba(148,163,184,0.35)] rounded-lg p-6 text-center transition-colors duration-200">
              <p className="text-gray-500 dark:text-[#6E7690]">Choose your next NOW</p>
            </div>
          )}

          {/* Timer */}
          <div className="flex flex-col items-center">
            <div 
              className={`relative w-48 h-48 rounded-full flex items-center justify-center bg-white dark:bg-[#070815] transition-all duration-200 ${
                isRunning && isUnderTwoMinutes 
                  ? 'animate-pulse-lime' 
                  : !isRunning && timerSeconds < 25 * 60
                  ? 'animate-pulse-slow'
                  : ''
              }`}
              style={{
                border: isRunning && isUnderTwoMinutes 
                  ? '4px solid rgb(163, 230, 53)' 
                  : '4px solid rgb(79, 70, 229)',
                boxShadow: isRunning && isUnderTwoMinutes 
                  ? '0 0 20px rgba(163, 230, 53, 0.3)' 
                  : '0 0 10px rgba(99, 102, 241, 0.1)'
              }}
            >
              <div className="text-5xl tabular-nums text-gray-900 dark:text-[#F8FAFF]">
                {formatTime(timerSeconds)}
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={() => setIsRunning(!isRunning)}
                disabled={!activeTask}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  activeTask
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 dark:bg-[#161827] text-gray-400 dark:text-[#6E7690] cursor-not-allowed'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start</span>
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="p-3 bg-gray-100 dark:bg-[#161827] text-gray-700 dark:text-[#B7C0D8] rounded-lg hover:bg-gray-200 dark:hover:bg-[#1F2137] transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {activeTask && (
            <div className="flex gap-2">
              <button
                onClick={handleComplete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Complete</span>
              </button>
              <button
                onClick={() => onDemoteTask(activeTask.id)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#161827] text-gray-700 dark:text-[#B7C0D8] rounded-lg hover:bg-gray-200 dark:hover:bg-[#1F2137] transition-colors"
              >
                Move to Today
              </button>
            </div>
          )}

          {/* Next Up */}
          {nextTasks.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-500 dark:text-[#B7C0D8] mb-2">Next up</h4>
              <div className="space-y-2">
                {nextTasks.map(task => {
                  const hasPartialTime = task.remainingTime !== undefined && task.remainingTime < 25 * 60;
                  return (
                    <button
                      key={task.id}
                      onClick={() => onSetActiveTask(task.id)}
                      className="w-full text-left bg-gray-50 dark:bg-[#161827] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-[rgba(148,163,184,0.35)] hover:border-indigo-300 dark:hover:border-indigo-600 rounded-lg overflow-hidden transition-all duration-200"
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-[#F8FAFF]">{task.title}</p>
                            {task.note && (
                              <p className="text-xs text-gray-500 dark:text-[#B7C0D8] mt-1">{task.note}</p>
                            )}
                            {hasPartialTime && (
                              <p className="text-xs text-lime-700 dark:text-lime-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatFocusedTime(task.remainingTime!)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Subtle progress bar at bottom */}
                      {hasPartialTime && (
                        <div className="w-full bg-gray-200 dark:bg-[#0A0B12] h-0.5">
                          <div
                            className="bg-lime-500 dark:bg-lime-400 h-0.5 transition-all"
                            style={{ width: `${getProgressPercentage(task.remainingTime!)}%` }}
                          ></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No NOW tasks */}
          {nowTasks.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-[#6E7690]">
                Drag tasks to NOW on the board to get started
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-gray-200 dark:border-[rgba(148,163,184,0.35)] flex gap-2">
            {onOpenBoard && (
              <button
                onClick={onOpenBoard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#161827] text-gray-700 dark:text-[#B7C0D8] rounded-lg hover:bg-gray-200 dark:hover:bg-[#1F2137] transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Open Board</span>
              </button>
            )}
            {onOpenMeeting && (
              <button
                onClick={onOpenMeeting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#161827] text-gray-700 dark:text-[#B7C0D8] rounded-lg hover:bg-gray-200 dark:hover:bg-[#1F2137] transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Meeting Mode</span>
              </button>
            )}
          </div>
        </div>
      )}

      {isMinimized && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-[#B7C0D8] truncate">
              {activeTask ? activeTask.title : 'No active task'}
            </p>
          </div>
          <div className="text-3xl tabular-nums text-gray-900 dark:text-[#F8FAFF] text-center">
            {formatTime(timerSeconds)}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-lime {
          0%, 100% {
            border-color: rgb(163, 230, 53);
            box-shadow: 0 0 0 0 rgba(163, 230, 53, 0.4);
          }
          50% {
            border-color: rgb(190, 242, 100);
            box-shadow: 0 0 0 8px rgba(163, 230, 53, 0);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            border-color: rgb(199, 210, 254);
            opacity: 1;
          }
          50% {
            border-color: rgb(165, 180, 252);
            opacity: 0.7;
          }
        }
        .animate-pulse-lime {
          animation: pulse-lime 1.5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
