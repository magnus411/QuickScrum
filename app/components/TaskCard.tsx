"use client";

import { Task, Priority, MEMBER_COLORS } from "@/app/lib/types";
import MemberAvatar from "./MemberAvatar";
import { Calendar, Clock, AlertCircle, GripVertical, Pencil, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  onMove?: (taskId: number, direction: "left" | "right") => void;
  compact?: boolean;
}

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-green-700", bg: "bg-green-50" },
  medium: { label: "Med", color: "text-amber-700", bg: "bg-amber-50" },
  high: { label: "High", color: "text-red-700", bg: "bg-red-50" },
};

export default function TaskCard({ task, onEdit, onDelete, onMove, compact = false }: TaskCardProps) {
  const priority = priorityConfig[task.priority];

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{task.title}</h4>
          {task.points > 0 && (
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">
              {task.points}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <MemberAvatar member={task.assignee} size="sm" />
          <div className="flex items-center gap-1">
            <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", priority.bg, priority.color)}>
              {priority.label}
            </span>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                title="Edit"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{task.title}</h4>
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <MemberAvatar member={task.assignee} size="sm" />
          {task.points > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />
              {task.points}p
            </span>
          )}
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", priority.bg, priority.color)}>
          {priority.label}
        </span>
      </div>
    </div>
  );
}
