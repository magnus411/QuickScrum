"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Task, COLUMNS, TEAM_MEMBERS, TaskStatus, Sprint, Priority, MEMBER_COLORS } from "@/app/lib/types";
import { moveTaskStatusAction, deleteTaskAction } from "@/app/lib/actions";
import TaskCard from "@/app/components/TaskCard";
import ConfirmModal from "@/app/components/ConfirmModal";
import InlineTaskForm from "@/app/components/InlineTaskForm";
import { Plus, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface BoardClientProps {
  sprint: { id: number; name: string; goal: string } | null;
  initialTasks: Task[];
  sprints: Sprint[];
}

const priorityConfig: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  low: { label: "Low", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  medium: { label: "Med", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  high: { label: "High", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

export default function BoardClient({ sprint, initialTasks, sprints }: BoardClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set());
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filteredTasks = tasks.filter((t) => {
    if (selectedMembers.size > 0 && (!t.assignee || !selectedMembers.has(t.assignee))) return false;
    if (selectedPriorities.size > 0 && !selectedPriorities.has(t.priority)) return false;
    return true;
  });

  function toggleMember(member: string) {
    const next = new Set(selectedMembers);
    if (next.has(member)) next.delete(member);
    else next.add(member);
    setSelectedMembers(next);
  }

  function togglePriority(priority: string) {
    const next = new Set(selectedPriorities);
    if (next.has(priority)) next.delete(priority);
    else next.add(priority);
    setSelectedPriorities(next);
  }

  function clearFilters() {
    setSelectedMembers(new Set());
    setSelectedPriorities(new Set());
  }

  function handleMove(taskId: number, newStatus: TaskStatus) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    startTransition(() => {
      moveTaskStatusAction(taskId, newStatus);
    });
  }

  function handleArrowMove(taskId: number, direction: "left" | "right") {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const colIndex = COLUMNS.findIndex((c) => c.id === task.status);
    const newIndex = direction === "left" ? colIndex - 1 : colIndex + 1;
    if (newIndex < 0 || newIndex >= COLUMNS.length) return;

    handleMove(taskId, COLUMNS[newIndex].id);
  }

  function handleDelete(taskId: number) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDeletingTaskId(null);
    startTransition(() => {
      deleteTaskAction(taskId);
    });
  }

  function handleFormDone() {
    setShowForm(false);
    setEditingTask(null);
    router.refresh();
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingTask(null);
  }

  function startAdd() {
    setEditingTask(null);
    setShowForm(true);
  }

  function startEdit(task: Task) {
    setEditingTask(task);
    setShowForm(true);
  }

  function onDragStart(e: React.DragEvent, taskId: number) {
    setDraggingTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    const el = e.currentTarget as HTMLElement;
    if (el) {
      e.dataTransfer.setDragImage(el, 20, 20);
    }
  }

  function onDragOver(e: React.DragEvent, columnId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  }

  function onDragLeave() {
    setDragOverColumn(null);
  }

  function onDrop(e: React.DragEvent, columnId: TaskStatus) {
    e.preventDefault();
    if (draggingTaskId !== null) {
      handleMove(draggingTaskId, columnId);
    }
    setDraggingTaskId(null);
    setDragOverColumn(null);
  }

  const hasFilters = selectedMembers.size > 0 || selectedPriorities.size > 0;

  if (!sprint) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Kanban Board</h1>
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Sprint</h2>
          <p className="text-gray-500 mb-6">Activate a sprint to see the board.</p>
          <a
            href="/sprints"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Sprints
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-500 mt-1">
            {sprint.name} {sprint.goal && <span className="text-gray-400">— {sprint.goal}</span>}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>

      {/* Inline Task Form */}
      {showForm && (
        <InlineTaskForm
          task={editingTask}
          sprintId={sprint.id}
          sprints={sprints}
          onDone={handleFormDone}
          onCancel={handleFormCancel}
        />
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Team</span>
            {TEAM_MEMBERS.map((member) => {
              const isActive = selectedMembers.has(member);
              return (
                <button
                  key={member}
                  onClick={() => toggleMember(member)}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2",
                    isActive
                      ? "text-white shadow-md scale-110"
                      : "bg-gray-50 text-gray-300 border-transparent hover:border-gray-200 hover:text-gray-500"
                  )}
                  style={isActive ? { backgroundColor: MEMBER_COLORS[member], borderColor: MEMBER_COLORS[member] } : {}}
                  title={member}
                >
                  {member[0]}
                </button>
              );
            })}
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Priority</span>
            {(["low", "medium", "high"] as Priority[]).map((p) => {
              const cfg = priorityConfig[p];
              const isActive = selectedPriorities.has(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                    isActive
                      ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                  )}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {hasFilters && (
            <>
              <div className="w-px h-8 bg-gray-200" />
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isDragOver = dragOverColumn === col.id;

          return (
            <div key={col.id} className="flex flex-col">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-t-xl bg-white border-t border-x border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <div
                className={cn(
                  "flex-1 border border-gray-200 rounded-b-xl p-3 space-y-3 min-h-[400px] transition-colors",
                  isDragOver ? "bg-blue-50/70 border-blue-300" : "bg-gray-100/50"
                )}
                onDragOver={(e) => onDragOver(e, col.id)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, col.id)}
              >
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "relative group cursor-grab active:cursor-grabbing",
                      draggingTaskId === task.id && "opacity-50"
                    )}
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                  >
                    <div className="absolute left-0 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <TaskCard
                      task={task}
                      onEdit={startEdit}
                      onDelete={(id) => setDeletingTaskId(id)}
                      compact
                    />
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5">
                      {col.id !== "backlog" && (
                        <button
                          onClick={() => handleArrowMove(task.id, "left")}
                          className="p-1 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 text-gray-500"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {col.id !== "done" && (
                        <button
                          onClick={() => handleArrowMove(task.id, "right")}
                          className="p-1 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 text-gray-500"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && !isDragOver && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {hasFilters ? "No tasks match filters" : "No tasks"}
                  </div>
                )}
                {isDragOver && (
                  <div className="border-2 border-dashed border-blue-300 rounded-xl py-6 text-center text-sm text-blue-400 font-medium">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deletingTaskId !== null && (
        <ConfirmModal
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={() => handleDelete(deletingTaskId)}
          onCancel={() => setDeletingTaskId(null)}
          confirmText="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}
