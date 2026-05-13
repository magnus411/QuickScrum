"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprint, SprintStatus, Task } from "@/app/lib/types";
import {
  activateSprintAction,
  deleteSprintAction,
} from "@/app/lib/actions";
import SprintModal from "@/app/components/SprintModal";
import ConfirmModal from "@/app/components/ConfirmModal";
import CarryOverModal from "@/app/components/CarryOverModal";
import TaskModal from "@/app/components/TaskModal";
import MemberAvatar from "@/app/components/MemberAvatar";
import {
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Pencil,
  Calendar,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

interface SprintsClientProps {
  sprints: Sprint[];
  activeSprint: Sprint | undefined;
  allTasks: Task[];
}

const statusStyles: Record<SprintStatus, { label: string; bg: string; text: string; icon: any }> = {
  planning: { label: "Planning", bg: "bg-gray-100", text: "text-gray-600", icon: Clock },
  active: { label: "Active", bg: "bg-blue-50", text: "text-blue-600", icon: Play },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-600", icon: CheckCircle2 },
};

export default function SprintsClient({ sprints, activeSprint, allTasks }: SprintsClientProps) {
  const router = useRouter();
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [deletingSprintId, setDeletingSprintId] = useState<number | null>(null);
  const [completingSprint, setCompletingSprint] = useState<Sprint | null>(null);
  const [activatingSprintId, setActivatingSprintId] = useState<number | null>(null);
  const [expandedSprintId, setExpandedSprintId] = useState<number | null>(null);
  const [addingTaskToSprint, setAddingTaskToSprint] = useState<Sprint | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  function handleSprintCreatedOrUpdated() {
    setShowSprintModal(false);
    setEditingSprint(null);
    router.refresh();
  }

  async function handleActivate(sprintId: number) {
    await activateSprintAction(sprintId);
    setActivatingSprintId(null);
    router.refresh();
  }

  async function handleDelete(sprintId: number) {
    await deleteSprintAction(sprintId);
    setDeletingSprintId(null);
    router.refresh();
  }

  const completingSprintTasks = completingSprint
    ? allTasks.filter((t) => t.sprintId === completingSprint.id)
    : [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sprints</h1>
          <p className="text-gray-500 mt-1">Manage your team&apos;s sprints</p>
        </div>
        <button
          onClick={() => { setEditingSprint(null); setShowSprintModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Sprint
        </button>
      </div>

      {activeSprint && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-5 h-5 text-blue-200" />
                <span className="text-sm font-medium text-blue-100 uppercase tracking-wider">Currently Active</span>
              </div>
              <h2 className="text-2xl font-bold">{activeSprint.name}</h2>
              <p className="text-blue-100 mt-1">{activeSprint.goal || "No goal set"}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCompletingSprint(activeSprint)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-colors backdrop-blur-sm"
            >
              Complete Sprint
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sprints.map((sprint) => {
          const status = statusStyles[sprint.status];
          const StatusIcon = status.icon;
          const isActive = sprint.status === "active";
          const isExpanded = expandedSprintId === sprint.id;
          const sprintTasks = allTasks.filter((t) => t.sprintId === sprint.id);
          const doneCount = sprintTasks.filter((t) => t.status === "done").length;

          return (
            <div
              key={sprint.id}
              className={cn(
                "bg-white rounded-2xl border shadow-sm transition-all",
                isActive ? "border-blue-200 shadow-md" : "border-gray-100 hover:shadow-md"
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{sprint.name}</h3>
                      <span className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold", status.bg, status.text)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </div>
                    {sprint.goal && (
                      <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        {sprint.goal}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>{sprintTasks.length} tasks ({doneCount} done)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedSprintId(isExpanded ? null : sprint.id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Tasks
                    </button>
                    {sprint.status === "planning" && (
                      <button
                        onClick={() => setActivatingSprintId(sprint.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Activate
                      </button>
                    )}
                    {sprint.status === "active" && (
                      <button
                        onClick={() => setCompletingSprint(sprint)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingSprint(sprint); setShowSprintModal(true); }}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSprintId(sprint.id)}
                      className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Tasks in this sprint</h4>
                    <button
                      onClick={() => { setAddingTaskToSprint(sprint); setEditingTask(null); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>
                  </div>

                  {sprintTasks.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">No tasks yet. Add some!</p>
                  ) : (
                    <div className="space-y-2">
                      {sprintTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => { setAddingTaskToSprint(sprint); setEditingTask(task); }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all"
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            task.status === "done" ? "bg-green-500" :
                            task.status === "in_progress" ? "bg-amber-500" :
                            task.status === "review" ? "bg-purple-500" :
                            task.status === "todo" ? "bg-blue-500" : "bg-gray-400"
                          )} />
                          <span className={cn(
                            "text-sm flex-1 truncate",
                            task.status === "done" ? "text-gray-400 line-through" : "text-gray-700"
                          )}>
                            {task.title}
                          </span>
                          {task.points > 0 && (
                            <span className="text-xs text-gray-400">{task.points}p</span>
                          )}
                          <MemberAvatar member={task.assignee} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {sprints.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Sprints Yet</h2>
            <p className="text-gray-500 mb-6">Create your first sprint to get started.</p>
            <button
              onClick={() => { setEditingSprint(null); setShowSprintModal(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Sprint
            </button>
          </div>
        )}
      </div>

      {showSprintModal && (
        <SprintModal
          sprint={editingSprint}
          onClose={handleSprintCreatedOrUpdated}
        />
      )}

      {deletingSprintId !== null && (
        <ConfirmModal
          title="Delete Sprint"
          message="Are you sure you want to delete this sprint? Tasks in this sprint will become unassigned."
          onConfirm={() => handleDelete(deletingSprintId)}
          onCancel={() => setDeletingSprintId(null)}
          confirmText="Delete"
          variant="danger"
        />
      )}

      {activatingSprintId !== null && (
        <ConfirmModal
          title="Activate Sprint"
          message="Activating this sprint will complete any currently active sprint. Are you sure?"
          onConfirm={() => handleActivate(activatingSprintId)}
          onCancel={() => setActivatingSprintId(null)}
          confirmText="Activate"
          variant="info"
        />
      )}

      {completingSprint && (
        <CarryOverModal
          sprint={completingSprint}
          tasks={completingSprintTasks}
          sprints={sprints}
          onClose={() => { setCompletingSprint(null); router.refresh(); }}
        />
      )}

      {addingTaskToSprint && (
        <TaskModal
          task={editingTask}
          sprintId={addingTaskToSprint.id}
          sprints={sprints}
          onClose={() => { setAddingTaskToSprint(null); setEditingTask(null); router.refresh(); }}
          defaultStatus="todo"
        />
      )}
    </div>
  );
}
