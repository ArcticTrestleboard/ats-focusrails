import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Task } from '../lib/types';
import { TaskCard } from './TaskCard';
import { Plus, AlertCircle } from 'lucide-react';

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  sectionId: 'now' | 'today' | 'parking';
  maxTasks?: number;
  accentColor: 'lime' | 'indigo';
  onMoveTask: (taskId: string, targetSection: 'now' | 'today' | 'parking', targetIndex: number) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCompleteTask: (taskId: string) => void;
  onAddTask: (section: 'now' | 'today' | 'parking', title: string) => void;
  onOpenMeeting: () => void;
  nowTaskCount: number;
}

export function TaskSection({
  title,
  tasks,
  sectionId,
  maxTasks,
  accentColor,
  onMoveTask,
  onUpdateTask,
  onCompleteTask,
  onAddTask,
  onOpenMeeting,
  nowTaskCount
}: TaskSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const isFull = maxTasks !== undefined && tasks.length >= maxTasks;

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    canDrop: () => !isFull || sectionId !== 'now',
    drop: (item: { taskId: string }) => {
      onMoveTask(item.taskId, sectionId, tasks.length);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(sectionId, newTaskTitle);
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const titleColorClass = accentColor === 'lime'
    ? 'text-lime-700 dark:text-lime-400'
    : 'text-indigo-700 dark:text-indigo-400';

  return (
    <div
      ref={drop}
      className={`rounded-xl border-2 p-6 transition-all duration-200 ${
        accentColor === 'lime' ? 'border-lime-400' : 'border-indigo-200'
      } ${
        accentColor === 'lime' && 'dark:border-lime-500 dark:shadow-[0_0_20px_rgba(163,230,53,0.15)]'
      } ${
        accentColor === 'indigo' && 'dark:border-[rgba(148,163,184,0.35)]'
      } ${
        isOver && canDrop ? 'bg-gray-50 dark:bg-[#161827]' : 'bg-white dark:bg-[#111322]'
      } ${
        isOver && !canDrop ? 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={titleColorClass}>{title}</h2>
        {maxTasks !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-[#B7C0D8]">
              {tasks.length}/{maxTasks}
            </span>
            {isFull && (
              <AlertCircle className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            sectionId={sectionId}
            onMoveTask={onMoveTask}
            onUpdateTask={onUpdateTask}
            onCompleteTask={onCompleteTask}
            nowTaskCount={nowTaskCount}
          />
        ))}

        {isFull && sectionId === 'now' && (
          <div className="bg-gray-100 dark:bg-[#161827] rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-[rgba(148,163,184,0.35)] opacity-50">
            <p className="text-gray-400 dark:text-[#6E7690] text-center text-sm">NOW is full (max 3 items)</p>
          </div>
        )}
      </div>

      {/* Add Task - Only for Today and Parking Lot */}
      {sectionId !== 'now' && (
        <>
          {isAdding ? (
            <div className="bg-gray-50 dark:bg-[#161827] rounded-lg p-4 border border-gray-300 dark:border-[rgba(148,163,184,0.35)] transition-colors duration-200">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewTaskTitle('');
                  }
                }}
                onBlur={handleAddTask}
                placeholder="Task title..."
                className="w-full bg-white dark:bg-[#070815] px-3 py-2 border border-gray-300 dark:border-[rgba(148,163,184,0.35)] rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-gray-900 dark:text-[#F8FAFF] placeholder-gray-400 dark:placeholder-[#6E7690] transition-colors duration-200"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 dark:text-[#B7C0D8] hover:bg-gray-50 dark:hover:bg-[#161827] rounded-lg border border-dashed border-gray-300 dark:border-[rgba(148,163,184,0.35)] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add task</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
