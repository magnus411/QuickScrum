"use client";

import { useState } from "react";
import { Task, Sprint } from "@/app/lib/types";
import { bulkCarryOverAction, bulkMoveToBacklogAction, completeSprintAction } from "@/app/lib/actions";
import MemberAvatar from "./MemberAvatar";
import { X, CheckSquare, Square, ArrowRight, Archive, Flag } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface CarryOverModalProps {
  sprint: Sprint;
  tasks: Task[];
  sprints: Sprint[];
  onClose: () => void;
}

export default function CarryOverModal({ sprint, tasks, sprints, onClose }: CarryOverModalProps) {
  const unfinishedTasks = tasks.filter((t) => t.status !== "done");
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(
    new Set(unfinishedTasks.map((t) => t.id))
  );
  const [targetSprintId, setTargetSprintId] = useState<string>("backlog");
  const [loading, setLoading] = useState(false);

  const toggleTask = (taskId: number) => {
    const next = new Set(selectedTaskIds);
    if (next.has(taskId)) {
      next.delete(taskId);
    } else {
      next.add(taskId);
    }
    setSelectedTaskIds(next);
  };

  const toggleAll = () => {
    if (selectedTaskIds.size === unfinishedTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(unfinishedTasks.map((t) => t.id)));
    }
  };

  async function handleComplete() {
    setLoading(true);
    const ids = Array.from(selectedTaskIds);

    if (ids.length > 0 && targetSprintId !== "backlog") {
      await bulkCarryOverAction(parseInt(targetSprintId), ids);
    } else if (ids.length > 0) {
      await bulkMoveToBacklogAction(ids);
    }

    await completeSprintAction(sprint.id);
    setLoading(false);
    onClose();
  }

  const otherSprints = sprints.filter((s) => s.id !== sprint.id && s.status !== "completed");

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Complete Sprint</h2>
            <p className="text-sm text-gray-500">{sprint.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-auto flex-1">
          {unfinishedTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">All tasks are done!</p>
              <p className="text-sm text-gray-400 mt-1">No tasks need to be carried over.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Unfinished tasks ({unfinishedTasks.length})
                </h3>
                <button
                  onClick={toggleAll}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  {selectedTaskIds.size === unfinishedTasks.length ? "Deselect all" : "Select all"}
                </button>
              </div>

              <div className="space-y-2 mb-6">
                {unfinishedTasks.map((task) => {
                  const isSelected = selectedTaskIds.has(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                        isSelected
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      )}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <p className="text-xs text-gray-400">{task.status.replace("_", " ")} • {task.points}pts</p>
                      </div>
                      <MemberAvatar member={task.assignee} size="sm" />
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Move selected tasks to
                </label>
                <select
                  value={targetSprintId}
                  onChange={(e) => setTargetSprintId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
                >
                  <option value="backlog">
                    Super Backlog (unassigned)
                  </option>
                  {otherSprints.map((s) => (
                    <option key={s.id} value={s.id.toString()}>
                      {s.name} {s.status === "active" ? "(Active)" : "(Planning)"}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? "Completing..." : (
              <>
                <Flag className="w-4 h-4" />
                Complete Sprint
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
