export type TeamMember = "Magnus" | "Endre" | "Gustav" | "Selma";

export const TEAM_MEMBERS: TeamMember[] = ["Magnus", "Endre", "Gustav", "Selma"];

export const MEMBER_COLORS: Record<TeamMember, string> = {
  Magnus: "#3b82f6",
  Endre: "#10b981",
  Gustav: "#f59e0b",
  Selma: "#ec4899",
};

export const MEMBER_AVATARS: Record<TeamMember, string> = {
  Magnus: "M",
  Endre: "E",
  Gustav: "G",
  Selma: "S",
};

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

export const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "todo", label: "To Do", color: "#3b82f6" },
  { id: "in_progress", label: "In Progress", color: "#f59e0b" },
  { id: "review", label: "Review", color: "#8b5cf6" },
  { id: "done", label: "Done", color: "#10b981" },
];

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: TeamMember | null;
  points: number;
  sprintId: number | null;
  createdAt: string;
  updatedAt: string;
  priority: Priority;
}

export type SprintStatus = "planning" | "active" | "completed";

export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  status: SprintStatus;
  createdAt: string;
}

export interface TaskHistory {
  id: number;
  taskId: number;
  status: TaskStatus;
  date: string;
}
