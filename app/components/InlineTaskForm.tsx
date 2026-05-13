"use client";

import { useState, useEffect } from "react";
import { Task, TeamMember, Priority, TaskStatus, TEAM_MEMBERS, Sprint } from "@/app/lib/types";
import { createTaskAction, updateTaskAction } from "@/app/lib/actions";
import { X, Save, Plus, Pencil } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface InlineTaskFormProps {
  task?: Task | null;
  sprintId?: number | null;
  sprints?: Sprint[];
  onDone: () => void;
  onCancel: () => void;
}

export default function InlineTaskForm({ task, sprintId, sprints = [], onDone, onCancel }: InlineTaskFormProps) {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignee, setAssignee] = useState<TeamMember | "">(task?.assignee || "");
  const [points, setPoints] = useState(task?.points || 0);
  const [priority, setPriority] = useState<Priority>(task?.priority || "medium");
  const [status, setStatus] = useState<TaskStatus>(task?.status || "todo");
  const [selectedSprintId, setSelectedSprintId] = useState<string>(
    task?.sprintId?.toString() ?? (sprintId !== undefined && sprintId !== null ? sprintId.toString() : "")
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset form when task changes
  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setAssignee(task?.assignee || "");
    setPoints(task?.points || 0);
    setPriority(task?.priority || "medium");
    setStatus(task?.status || "todo");
    setSelectedSprintId(
      task?.sprintId?.toString() ?? (sprintId !== undefined && sprintId !== null ? sprintId.toString() : "")
    );
    setError("");
  }, [task, sprintId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
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

    // Reset for next add
    if (!isEditing) {
      setTitle("");
      setDescription("");
      setAssignee("");
      setPoints(0);
      setPriority("medium");
      setStatus("todo");
    }

    setSaving(false);
    setError("");
    onDone();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          {isEditing ? <Pencil className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
        </div>
        <h3 className="text-sm font-bold text-gray-900">
          {isEditing ? `Editing: ${task?.title}` : "New Task"}
        </h3>
        <button
          onClick={onCancel}
          className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-medium"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="md:col-span-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
              placeholder="Add details..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Assignee</label>
            <div className="flex gap-2">
              {TEAM_MEMBERS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAssignee(assignee === m ? "" : m)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-sm font-bold transition-all border-2",
                    assignee === m
                      ? "text-white shadow-md scale-110"
                      : "bg-gray-50 text-gray-300 border-transparent hover:border-gray-200"
                  )}
                  style={assignee === m ? { backgroundColor: getMemberColor(m), borderColor: getMemberColor(m) } : {}}
                  title={m}
                >
                  {m[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Points</label>
              <input
                type="number"
                min={0}
                max={100}
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Med</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
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
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sprint</label>
              <select
                value={selectedSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
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
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

function getMemberColor(member: TeamMember): string {
  const colors: Record<string, string> = {
    Magnus: "#3b82f6",
    Endre: "#10b981",
    Gustav: "#f59e0b",
    Selma: "#ec4899",
  };
  return colors[member] || "#6b7280";
}
