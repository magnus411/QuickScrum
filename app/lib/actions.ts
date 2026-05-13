"use server";

import { revalidatePath } from "next/cache";
import {
  createTask,
  updateTask,
  deleteTask,
  moveTaskToSprint,
  createSprint,
  updateSprint,
  deleteSprint,
  activateSprint,
  getActiveSprint,
  getAllSprints,
  getTasksBySprint,
  getAllTasks,
  getSprintStats,
  getAllTaskHistoryForSprint,
  getTaskById,
  getTaskLogs,
  addTaskLog,
} from "./db";
import { TaskStatus, TeamMember, Priority } from "./types";
import { sendAssignmentEmail, sendLogEmail } from "./email";

// Auth actions
export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { login } = await import("./auth");
  const password = formData.get("password") as string;
  const success = await login(password);
  if (success) {
    return { success: true };
  }
  return { success: false, error: "Invalid password" };
}

// Data queries (server functions)
export async function getBoardData() {
  const sprint = getActiveSprint();
  const tasks = sprint ? getTasksBySprint(sprint.id) : [];
  const sprints = getAllSprints();
  return { sprint: sprint ?? null, tasks, sprints };
}

export async function getBurndownData() {
  const sprint = getActiveSprint();
  if (!sprint) return null;
  const tasks = getTasksBySprint(sprint.id);
  const history = getAllTaskHistoryForSprint(sprint.id);
  const stats = getSprintStats(sprint.id);
  return { sprint, tasks, history, stats };
}

export async function getSprintsData() {
  const sprints = getAllSprints();
  const active = getActiveSprint();
  const allTasks = getAllTasks();
  return { sprints, activeSprint: active, allTasks };
}

export async function getBacklogData() {
  const tasks = getAllTasks().filter((t) => t.sprintId === null);
  const sprints = getAllSprints();
  return { tasks, sprints };
}

export async function getVelocityData() {
  const sprints = getAllSprints().filter((s) => s.status === "completed");
  const allTasks = getAllTasks();

  const data = sprints.map((sprint) => {
    const tasks = allTasks.filter((t) => t.sprintId === sprint.id);
    const committed = tasks.reduce((sum, t) => sum + t.points, 0);
    const completed = tasks
      .filter((t) => t.status === "done")
      .reduce((sum, t) => sum + t.points, 0);
    return {
      sprint: sprint.name,
      committed,
      completed,
      tasks: tasks.length,
    };
  });

  const avg = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + d.completed, 0) / data.length)
    : 0;

  return { data, average: avg };
}

// Task actions
export async function createTaskAction(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const assignee = formData.get("assignee") as TeamMember | null;
  const points = parseInt(formData.get("points") as string) || 0;
  const sprintId = formData.get("sprintId") ? parseInt(formData.get("sprintId") as string) : null;
  const priority = (formData.get("priority") as Priority) || "medium";
  const status = (formData.get("status") as TaskStatus) || "backlog";

  const task = createTask({
    title,
    description,
    status,
    assignee: assignee || null,
    points,
    sprintId,
    priority,
  });

  if (task.assignee) {
    await sendAssignmentEmail({
      taskId: task.id,
      taskTitle: task.title,
      assignee: task.assignee,
    });
  }

  revalidatePath("/board");
  revalidatePath("/backlog");
  revalidatePath("/");
  revalidatePath("/burndown");
  revalidatePath("/velocity");
  revalidatePath("/sprints");
}

export async function updateTaskAction(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const assignee = formData.get("assignee") as TeamMember | null;
  const points = parseInt(formData.get("points") as string) || 0;
  const priority = (formData.get("priority") as Priority) || "medium";
  const status = formData.get("status") as TaskStatus | undefined;
  const sprintId = formData.get("sprintId");

  const oldTask = getTaskById(id);

  const updates: any = { title, description, assignee: assignee || null, points, priority };
  if (status) updates.status = status;

  updateTask(id, updates);

  if (sprintId !== undefined) {
    const newSprintId = sprintId ? parseInt(sprintId as string) : null;
    moveTaskToSprint(id, newSprintId);
  }

  // Notify on new assignment
  if (assignee && oldTask && oldTask.assignee !== assignee) {
    await sendAssignmentEmail({
      taskId: id,
      taskTitle: title,
      assignee,
    });
  }

  revalidatePath("/board");
  revalidatePath("/backlog");
  revalidatePath("/");
  revalidatePath("/burndown");
  revalidatePath("/velocity");
  revalidatePath("/sprints");
}

export async function moveTaskStatusAction(taskId: number, status: TaskStatus) {
  updateTask(taskId, { status });
  revalidatePath("/board");
  revalidatePath("/");
  revalidatePath("/burndown");
}

export async function deleteTaskAction(taskId: number) {
  deleteTask(taskId);
  revalidatePath("/board");
  revalidatePath("/backlog");
  revalidatePath("/");
  revalidatePath("/burndown");
  revalidatePath("/velocity");
  revalidatePath("/sprints");
}

export async function carryOverTaskAction(taskId: number, newSprintId: number) {
  moveTaskToSprint(taskId, newSprintId);
  updateTask(taskId, { status: "todo" });
  revalidatePath("/board");
  revalidatePath("/sprints");
  revalidatePath("/");
}

export async function moveToSuperBacklogAction(taskId: number) {
  moveTaskToSprint(taskId, null);
  updateTask(taskId, { status: "backlog" });
  revalidatePath("/board");
  revalidatePath("/backlog");
  revalidatePath("/");
}

export async function assignTaskToSprintAction(taskId: number, sprintId: number | null) {
  moveTaskToSprint(taskId, sprintId);
  revalidatePath("/board");
  revalidatePath("/backlog");
  revalidatePath("/");
}

export async function bulkCarryOverAction(sprintId: number, taskIds: number[]) {
  for (const taskId of taskIds) {
    moveTaskToSprint(taskId, sprintId);
    updateTask(taskId, { status: "todo" });
  }
  revalidatePath("/board");
  revalidatePath("/sprints");
  revalidatePath("/");
  revalidatePath("/backlog");
}

export async function bulkMoveToBacklogAction(taskIds: number[]) {
  for (const taskId of taskIds) {
    moveTaskToSprint(taskId, null);
    updateTask(taskId, { status: "backlog" });
  }
  revalidatePath("/board");
  revalidatePath("/sprints");
  revalidatePath("/");
  revalidatePath("/backlog");
}

// Task log actions
export async function getTaskLogsAction(taskId: number) {
  return getTaskLogs(taskId);
}

export async function addTaskLogAction(taskId: number, message: string) {
  const log = addTaskLog(taskId, message);
  const task = getTaskById(taskId);

  // Notify assignee if different from nobody
  if (task?.assignee) {
    await sendLogEmail({
      taskId,
      taskTitle: task.title,
      logMessage: message,
      author: "QuickScrum", // We don't track who wrote the log, so generic
      notifyee: task.assignee,
    });
  }

  revalidatePath("/board");
  revalidatePath("/backlog");
  revalidatePath("/sprints");
  return log;
}

// Sprint actions
export async function createSprintAction(formData: FormData) {
  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const goal = formData.get("goal") as string;

  createSprint({
    name,
    startDate,
    endDate,
    goal,
    status: "planning",
  });

  revalidatePath("/sprints");
  revalidatePath("/");
  revalidatePath("/velocity");
}

export async function updateSprintAction(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const goal = formData.get("goal") as string;

  updateSprint(id, { name, startDate, endDate, goal });
  revalidatePath("/sprints");
  revalidatePath("/");
}

export async function activateSprintAction(sprintId: number) {
  activateSprint(sprintId);
  revalidatePath("/sprints");
  revalidatePath("/board");
  revalidatePath("/");
  revalidatePath("/burndown");
}

export async function completeSprintAction(sprintId: number) {
  updateSprint(sprintId, { status: "completed" });
  revalidatePath("/sprints");
  revalidatePath("/board");
  revalidatePath("/");
  revalidatePath("/velocity");
}

export async function deleteSprintAction(sprintId: number) {
  deleteSprint(sprintId);
  revalidatePath("/sprints");
  revalidatePath("/");
  revalidatePath("/velocity");
}
