import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TodayBoard } from "./components/TodayBoard";
import { FocusPanel } from "./components/FocusPanel";
import { MeetingMode, MeetingItem } from "./components/MeetingMode";
import { UndoToast } from "./components/UndoToast";
import { OAuthLogin } from "./components/auth/OAuthLogin";
import { useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import type { Task } from "./lib/types";
import "./styles/globals.css";

interface UndoAction {
  type: "complete-board" | "complete-focus";
  task: Task;
  sourceSection: "now" | "today" | "parking";
  sourceIndex: number;
  previousActiveTaskId?: string | null;
  previousTimerSeconds?: number;
  previousIsRunning?: boolean;
}

export default function App() {
  // Authentication
  const { user, loading: authLoading, error: authError } = useAuth();

  // Tasks data
  const {
    nowTasks,
    todayTasks,
    parkingLotTasks,
    loading: tasksLoading,
    addTask: addTaskToDb,
    updateTask: updateTaskInDb,
    moveTask: moveTaskInDb,
    completeTask: completeTaskInDb,
    refetch: refetchTasks,
  } = useTasks(user?.id);

  // Local UI state
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "meeting">("board");
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Meeting mode state (temporary, not persisted)
  const [meetingItems, setMeetingItems] = useState<MeetingItem[]>([]);

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Convert list type between UI and database format
  const mapListType = (section: "now" | "today" | "parking"): "now" | "today" | "parking_lot" => {
    if (section === "parking") return "parking_lot";
    return section;
  };

  const reverseMapListType = (listType: "now" | "today" | "parking_lot"): "now" | "today" | "parking" => {
    if (listType === "parking_lot") return "parking";
    return listType;
  };

  // Undo functionality
  const handleUndo = async () => {
    if (!undoAction) return;

    // Restore task to database
    try {
      await updateTaskInDb(undoAction.task.id, {
        is_completed: false,
        list_type: mapListType(undoAction.sourceSection),
        position: undoAction.sourceIndex,
      });

      // Remove from local completed list
      setCompletedTasks((prev) => prev.filter((t) => t.id !== undoAction.task.id));

      // Restore active task if needed
      if (undoAction.type === "complete-focus") {
        setActiveTaskId(undoAction.task.id);
      }

      // Clear undo state
      setUndoAction(null);
      setShowUndoToast(false);
    } catch (error) {
      console.error("Error undoing task completion:", error);
    }
  };

  // Keyboard shortcut for undo (Ctrl+Z / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoAction]);

  // Move task between lists
  const moveTask = async (
    taskId: string,
    targetSection: "now" | "today" | "parking",
    targetIndex: number
  ) => {
    // Find the task to check NOW limit
    const task = [...nowTasks, ...todayTasks, ...parkingLotTasks].find((t) => t.id === taskId);
    if (!task) return;

    const currentListType = task.list_type;
    const targetListType = mapListType(targetSection);

    // Check NOW limit
    if (
      targetSection === "now" &&
      nowTasks.length >= 3 &&
      currentListType !== "now"
    ) {
      return; // Don't allow adding to NOW if at limit
    }

    // Get source and target lists
    const sourceList =
      currentListType === "now"
        ? nowTasks
        : currentListType === "today"
        ? todayTasks
        : parkingLotTasks;

    const targetList =
      targetSection === "now"
        ? nowTasks
        : targetSection === "today"
        ? todayTasks
        : parkingLotTasks;

    // If targetIndex is 9999 (from quick move buttons), use end of list
    // Otherwise use the provided index (from drag and drop)
    const finalIndex = targetIndex === 9999 ? targetList.length : targetIndex;

    // Check if moving within the same list (reordering)
    const isSameList = currentListType === targetListType;

    if (isSameList) {
      // Reordering within the same list
      const currentIndex = sourceList.findIndex((t) => t.id === taskId);
      if (currentIndex === -1 || currentIndex === finalIndex) return;

      // Create a new array with the item moved
      const reorderedList = [...sourceList];
      const [movedItem] = reorderedList.splice(currentIndex, 1);
      reorderedList.splice(finalIndex, 0, movedItem);

      // Update positions for all items in the list
      const updates = reorderedList.map((item, index) => ({
        id: item.id,
        position: index,
      }));

      // Update all positions in the database
      for (const update of updates) {
        await updateTaskInDb(update.id, { position: update.position });
      }
    } else {
      // Moving to a different list
      await moveTaskInDb(taskId, targetListType, finalIndex);
    }

    // Refetch tasks to update UI (in case realtime isn't working)
    await refetchTasks();
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTaskInDb(taskId, updates);
  };

  // Complete task from board
  const completeTaskFromBoard = async (taskId: string) => {
    const task = [...nowTasks, ...todayTasks, ...parkingLotTasks].find(
      (t) => t.id === taskId
    );
    if (!task) return;

    const sourceSection = reverseMapListType(task.list_type);
    const sourceIndex = task.position;

    // Add to local completed list immediately for UI feedback
    setCompletedTasks((prev) => [...prev, { ...task, is_completed: true }]);

    // Mark complete in database
    await completeTaskInDb(taskId);

    // Set undo action
    setUndoAction({
      type: "complete-board",
      task,
      sourceSection,
      sourceIndex,
    });
    setShowUndoToast(true);

    // Clear active task if it was the completed one
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  // Complete task from focus panel
  const completeTaskFromFocus = async (
    taskId: string,
    timerSeconds: number,
    isRunning: boolean
  ) => {
    const task = nowTasks.find((t) => t.id === taskId);
    if (!task) return;

    const sourceIndex = task.position;

    // Add to local completed list
    setCompletedTasks((prev) => [...prev, { ...task, is_completed: true }]);

    // Mark complete in database
    await completeTaskInDb(taskId);

    // Set undo action with timer state
    setUndoAction({
      type: "complete-focus",
      task,
      sourceSection: "now",
      sourceIndex,
      previousActiveTaskId: taskId,
      previousTimerSeconds: timerSeconds,
      previousIsRunning: isRunning,
    });
    setShowUndoToast(true);
    setActiveTaskId(null);
  };

  // Add task
  const addTask = async (section: "now" | "today" | "parking", title: string) => {
    const listType = mapListType(section);

    // Check NOW limit
    if (section === "now" && nowTasks.length >= 3) {
      return;
    }

    // Get current list to determine position
    const currentList =
      section === "now"
        ? nowTasks
        : section === "today"
        ? todayTasks
        : parkingLotTasks;

    // Use max position + 1 to ensure new task goes to the end
    const position = currentList.length > 0
      ? Math.max(...currentList.map(t => t.position)) + 1
      : 0;

    await addTaskToDb(title, listType, "", position);

    // Refetch tasks to update UI (in case realtime isn't working)
    await refetchTasks();
  };

  // Demote task from NOW to Today
  const handleDemoteTask = async (taskId: string) => {
    const task = nowTasks.find((t) => t.id === taskId);
    if (!task) return;

    await moveTaskInDb(taskId, "today", 0); // Move to top of Today

    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  // End meeting and route items to board
  const handleEndMeeting = async (todayItems: Task[], parkingItems: Task[]) => {
    // Add meeting items to database
    let todayPosition = todayTasks.length > 0
      ? Math.max(...todayTasks.map(t => t.position)) + 1
      : 0;
    for (const item of todayItems) {
      await addTaskToDb(item.title, "today", item.note, todayPosition);
      todayPosition++;
    }

    let parkingPosition = parkingLotTasks.length > 0
      ? Math.max(...parkingLotTasks.map(t => t.position)) + 1
      : 0;
    for (const item of parkingItems) {
      await addTaskToDb(item.title, "parking_lot", item.note, parkingPosition);
      parkingPosition++;
    }

    // Refetch tasks to update UI (in case realtime isn't working)
    await refetchTasks();

    // Clear meeting items
    setMeetingItems([]);

    // Return to board
    setViewMode("board");
  };

  // Show auth screens if not logged in
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <OAuthLogin
        initialError={authError?.message}
      />
    );
  }

  // Show loading state while tasks are loading
  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your board...</p>
        </div>
      </div>
    );
  }

  // Main app
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-white dark:bg-[#070815] transition-colors duration-200">
        {viewMode === "board" ? (
          <>
            <TodayBoard
              nowTasks={nowTasks}
              todayTasks={todayTasks}
              parkingLotTasks={parkingLotTasks}
              completedTasks={completedTasks}
              onMoveTask={moveTask}
              onUpdateTask={updateTask}
              onCompleteTask={completeTaskFromBoard}
              onAddTask={addTask}
              onOpenMeeting={() => setViewMode("meeting")}
              hasUndo={undoAction !== null}
              onUndo={handleUndo}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
            <FocusPanel
              userId={user?.id}
              nowTasks={nowTasks}
              activeTaskId={activeTaskId}
              onSetActiveTask={setActiveTaskId}
              onCompleteTask={completeTaskFromFocus}
              onDemoteTask={handleDemoteTask}
              onOpenBoard={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenMeeting={() => setViewMode("meeting")}
              undoAction={undoAction}
              onUndo={handleUndo}
              onDismissUndo={() => {
                setShowUndoToast(false);
              }}
            />

            {/* Board Undo Toast */}
            {showUndoToast && undoAction?.type === "complete-board" && (
              <UndoToast
                message="Task marked done"
                onUndo={handleUndo}
                onDismiss={() => {
                  setShowUndoToast(false);
                }}
                position="bottom"
              />
            )}
          </>
        ) : (
          <MeetingMode
            items={meetingItems}
            onUpdateItems={setMeetingItems}
            onEndMeeting={handleEndMeeting}
            onBackToBoard={() => setViewMode("board")}
          />
        )}
      </div>
    </DndProvider>
  );
}
