import { Task } from '../lib/types';
import { TaskSection } from './TaskSection';
import { ThemeToggle } from './ThemeToggle';
import { User, Undo2 } from 'lucide-react';

interface TodayBoardProps {
  nowTasks: Task[];
  todayTasks: Task[];
  parkingLotTasks: Task[];
  completedTasks: Task[];
  onMoveTask: (taskId: string, targetSection: 'now' | 'today' | 'parking', targetIndex: number) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCompleteTask: (taskId: string) => void;
  onAddTask: (section: 'now' | 'today' | 'parking', title: string) => void;
  onOpenMeeting: () => void;
  hasUndo?: boolean;
  onUndo?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function TodayBoard({
  nowTasks,
  todayTasks,
  parkingLotTasks,
  completedTasks,
  onMoveTask,
  onUpdateTask,
  onCompleteTask,
  onAddTask,
  onOpenMeeting,
  hasUndo,
  onUndo,
  isDarkMode,
  onToggleTheme
}: TodayBoardProps) {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#070815] transition-colors duration-200">
      {/* Minimal Top Bar */}
      <header className="h-14 border-b border-gray-200 dark:border-[rgba(148,163,184,0.35)] flex items-center justify-between px-6 bg-white dark:bg-[#070815] transition-colors duration-200">
        <h1 className="text-indigo-600 dark:text-indigo-500">FocusRails</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onUndo}
            disabled={!hasUndo}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              hasUndo
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#161827] dark:hover:bg-[#1F2137] dark:text-[#F8FAFF]'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-[#111322] dark:text-[#6E7690]'
            }`}
          >
            <Undo2 className="w-4 h-4" />
            <span className="text-sm">Undo</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs ml-1 dark:bg-[#070815] dark:border-[rgba(148,163,184,0.35)] dark:text-[#B7C0D8]">⌘Z</kbd>
          </button>
          {isDarkMode !== undefined && onToggleTheme && (
            <ThemeToggle
              isDark={isDarkMode}
              onToggle={onToggleTheme}
            />
          )}
          <button className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Single Vertical Column */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-[#070815] transition-colors duration-200">
        <div className="max-w-2xl mx-auto py-8 px-6 space-y-8">
          {/* NOW Section */}
          <TaskSection
            title="NOW"
            tasks={nowTasks}
            sectionId="now"
            maxTasks={3}
            accentColor="lime"
            onMoveTask={onMoveTask}
            onUpdateTask={onUpdateTask}
            onCompleteTask={onCompleteTask}
            onAddTask={onAddTask}
            onOpenMeeting={onOpenMeeting}
            nowTaskCount={nowTasks.length}
          />

          {/* Today Section */}
          <TaskSection
            title="Today"
            tasks={todayTasks}
            sectionId="today"
            accentColor="indigo"
            onMoveTask={onMoveTask}
            onUpdateTask={onUpdateTask}
            onCompleteTask={onCompleteTask}
            onAddTask={onAddTask}
            onOpenMeeting={onOpenMeeting}
            nowTaskCount={nowTasks.length}
          />

          {/* Parking Lot Section */}
          <TaskSection
            title="Parking Lot"
            tasks={parkingLotTasks}
            sectionId="parking"
            accentColor="indigo"
            onMoveTask={onMoveTask}
            onUpdateTask={onUpdateTask}
            onCompleteTask={onCompleteTask}
            onAddTask={onAddTask}
            onOpenMeeting={onOpenMeeting}
            nowTaskCount={nowTasks.length}
          />

          {/* Done Today */}
          {completedTasks.length > 0 && (
            <div className="pt-8 border-t border-gray-200 dark:border-[rgba(148,163,184,0.35)]">
              <h3 className="text-gray-400 dark:text-[#6E7690] mb-4">Done today</h3>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-lg p-4 opacity-60 dark:bg-[#161827]"
                  >
                    <p className="line-through text-gray-500 dark:text-[#6E7690]">{task.title}</p>
                    {task.note && (
                      <p className="text-sm text-gray-400 dark:text-[#6E7690] mt-1 line-through">{task.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}