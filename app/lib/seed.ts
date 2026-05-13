"use server";

import { getDb } from "./db";

export async function seedDatabase() {
  const db = getDb();

  // Check if we already have data
  const sprintCount = db.prepare("SELECT COUNT(*) as count FROM sprints").get() as { count: number };
  if (sprintCount.count > 0) return;

  const now = new Date();
  // Start from today, end 6 days later
  const weekStart = new Date(now);
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 6);

  // Create initial sprint
  const sprintResult = db.prepare(
    "INSERT INTO sprints (name, startDate, endDate, goal, status) VALUES (?, ?, ?, ?, ?)"
  ).run(
    `Sprint 1 - ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    weekStart.toISOString().split("T")[0],
    weekEnd.toISOString().split("T")[0],
    "Set up project foundation and core features",
    "active"
  );

  const sprintId = Number(sprintResult.lastInsertRowid);

  // Create sample tasks
  const tasks = [
    { title: "Set up project repo", description: "Initialize git and folder structure", status: "done", assignee: "Magnus", points: 3, priority: "high" },
    { title: "Design database schema", description: "Plan tables for sprints and tasks", status: "done", assignee: "Endre", points: 5, priority: "high" },
    { title: "Build login page", description: "Static password auth with cookie", status: "in_progress", assignee: "Gustav", points: 3, priority: "medium" },
    { title: "Create Kanban board", description: "Drag and drop board with 5 columns", status: "in_progress", assignee: "Selma", points: 8, priority: "high" },
    { title: "Build burndown chart", description: "Visualize sprint progress over time", status: "todo", assignee: "Magnus", points: 5, priority: "medium" },
    { title: "Sprint management page", description: "Create, activate, complete sprints", status: "todo", assignee: "Endre", points: 5, priority: "medium" },
    { title: "Super backlog", description: "Store unassigned tasks for future sprints", status: "backlog", assignee: null, points: 3, priority: "low" },
    { title: "Team avatars", description: "Color-coded icons for each team member", status: "review", assignee: "Selma", points: 2, priority: "low" },
  ];

  for (const task of tasks) {
    db.prepare(
      "INSERT INTO tasks (title, description, status, assignee, points, sprintId, priority, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
    ).run(task.title, task.description, task.status, task.assignee, task.points, sprintId, task.priority);
  }

  // Add some backlog tasks without sprint
  const backlogTasks = [
    { title: "Mobile responsive design", description: "Make board work on phones", assignee: "Gustav", points: 5, priority: "medium" },
    { title: "Email notifications", description: "Notify on task assignments", assignee: null, points: 8, priority: "low" },
  ];

  for (const task of backlogTasks) {
    db.prepare(
      "INSERT INTO tasks (title, description, status, assignee, points, sprintId, priority, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NULL, ?, datetime('now'), datetime('now'))"
    ).run(task.title, task.description, "backlog", task.assignee, task.points, task.priority);
  }
}
