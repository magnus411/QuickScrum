"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Task, Sprint, TEAM_MEMBERS } from "@/app/lib/types";
import { deleteTaskAction, assignTaskToSprintAction } from "@/app/lib/actions";
import TaskModal from "@/app/components/TaskModal";
import ConfirmModal from "@/app/components/ConfirmModal";
import MemberAvatar from "@/app/components/MemberAvatar";
import { Plus, Archive, ArrowRight, Filter } from "lucide-react";

interface BacklogClientProps {
  tasks: Task[];
  sprints: Sprint[];
}

export default function BacklogClient({ tasks, sprints }: BacklogClientProps) {
  const router = useRouter();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [movingTaskId, setMovingTaskId] = useState<number | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string>("all");

  const filteredTasks = filterAssignee === "all"
    ? tasks
    : tasks.filter((t) => t.assignee === filterAssignee);

  function handleDelete(taskId: number) {
    setDeletingTaskId(null);
    router.refresh();
    deleteTaskAction(taskId);
  }

  async function handleMoveToSprint(taskId: number, sprintId: number) {
    setMovingTaskId(null);
    await assignTaskToSprintAction(taskId, sprintId);
    router.refresh();
  }

  const activeSprint = sprints.find((s) => s.status === "active");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Backlog</h1>
          <p className="text-gray-500 mt-1">
            Tasks not assigned to any sprint — {tasks.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="text-sm border-none outline-none bg-transparent text-gray-700"
            >
              <option value="all">All Members</option>
              {TEAM_MEMBERS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Backlog is Empty</h2>
          <p className="text-gray-500">Create tasks here and assign them to sprints when ready.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">{task.title}</h4>
                {task.points > 0 && (
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {task.points}p
                  </span>
                )}
              </div>
              {task.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
              )}
              <div className="flex items-center justify-between">
                <MemberAvatar member={task.assignee} size="sm" />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingTaskId(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 text-xs"
                  >
                    Delete
                  </button>
                  {activeSprint && (
                    <button
                      onClick={() => setMovingTaskId(task.id)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      To Sprint
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          sprintId={null}
          sprints={sprints}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); router.refresh(); }}
          defaultStatus="backlog"
        />
      )}

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

      {movingTaskId !== null && activeSprint && (
        <ConfirmModal
          title="Move to Sprint"
          message={`Move this task to the active sprint "${activeSprint.name}"?`}
          onConfirm={() => handleMoveToSprint(movingTaskId, activeSprint.id)}
          onCancel={() => setMovingTaskId(null)}
          confirmText="Move"
          variant="info"
        />
      )}
    </div>
  );
}
