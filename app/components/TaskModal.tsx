"use client";

import { useState, useEffect } from "react";
import { Task, TeamMember, Priority, TaskStatus, TEAM_MEMBERS, Sprint, TaskLog } from "@/app/lib/types";
import { createTaskAction, updateTaskAction, deleteTaskAction, getTaskLogsAction, addTaskLogAction } from "@/app/lib/actions";
import { X, Save, Trash2, Send, MessageSquare } from "lucide-react";

interface TaskModalProps {
  task?: Task | null;
  sprintId?: number | null;
  sprints?: Sprint[];
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export default function TaskModal({ task, sprintId, sprints = [], onClose, defaultStatus = "backlog" }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignee, setAssignee] = useState<TeamMember | "">(task?.assignee || "");
  const [points, setPoints] = useState(task?.points || 0);
  const [priority, setPriority] = useState<Priority>(task?.priority || "medium");
  const [status, setStatus] = useState<TaskStatus>(task?.status || defaultStatus);
  const [selectedSprintId, setSelectedSprintId] = useState<string>(
    task?.sprintId?.toString() ?? (sprintId !== undefined && sprintId !== null ? sprintId.toString() : "")
  );
  const [error, setError] = useState("");

  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [logText, setLogText] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    if (isEditing && task) {
      getTaskLogsAction(task.id).then(setLogs);
    }
  }, [isEditing, task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const formData = new FormData();
    if (isEditing && task) {
      formData.append("id", task.id.toString());
    }
    formData.append("title", title);
    formData.append("description", description);
    formData.append("assignee", assignee);
    formData.append("points", points.toString());
    formData.append("priority", priority);
    formData.append("status", status);

    if (selectedSprintId && selectedSprintId !== "") {
      formData.append("sprintId", selectedSprintId);
    }

    if (isEditing) {
      await updateTaskAction(formData);
    } else {
      await createTaskAction(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm("Are you sure you want to delete this task? This cannot be undone.")) return;
    await deleteTaskAction(task.id);
    onClose();
  }

  async function handleAddLog() {
    if (!task || !logText.trim()) return;
    setSavingLog(true);
    const newLog = await addTaskLogAction(task.id, logText.trim());
    setLogs((prev) => [newLog, ...prev]);
    setLogText("");
    setSavingLog(false);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm min-h-[80px] resize-none"
                placeholder="Add details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value as TeamMember)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
                >
                  <option value="">Unassigned</option>
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {sprints.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sprint</label>
                <select
                  value={selectedSprintId}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
                >
                  <option value="">Backlog (no sprint)</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id.toString()}>
                      {s.name} {s.status === "active" ? "(Active)" : s.status === "completed" ? "(Done)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <div className="flex justify-end gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>

          {/* Logs Section */}
          {isEditing && task && (
            <div className="px-6 pb-6 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Activity Log</h3>
                <span className="text-xs text-gray-400">{logs.length}</span>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddLog();
                    }
                  }}
                  placeholder="Add a log entry..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddLog}
                  disabled={savingLog || !logText.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1 text-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {savingLog ? "..." : "Add"}
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No logs yet.</p>
                )}
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-transparent border border-blue-100/50"
                  >
                    <p className="text-sm text-gray-700">{log.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
