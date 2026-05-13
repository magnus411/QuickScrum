import Database from "better-sqlite3";
import { Task, Sprint, TaskHistory, TeamMember, TaskStatus, Priority, SprintStatus } from "./types";

const DB_PATH = process.env.DATABASE_URL?.replace("file:", "") || "./scrum.db";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema();
  }
  return db;
}

function initSchema() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS sprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      goal TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'planning',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'backlog',
      assignee TEXT,
      points INTEGER DEFAULT 0,
      sprintId INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      priority TEXT DEFAULT 'medium',
      FOREIGN KEY (sprintId) REFERENCES sprints(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS task_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER NOT NULL,
      status TEXT NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprintId);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_task_history_task ON task_history(taskId);
    CREATE INDEX IF NOT EXISTS idx_task_history_date ON task_history(date);
  `);
}

// Sprint operations
export function getAllSprints(): Sprint[] {
  const db = getDb();
  return db.prepare("SELECT * FROM sprints ORDER BY createdAt DESC").all() as Sprint[];
}

export function getActiveSprint(): Sprint | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM sprints WHERE status = 'active' ORDER BY createdAt DESC LIMIT 1").get() as Sprint | undefined;
}

export function getSprintById(id: number): Sprint | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM sprints WHERE id = ?").get(id) as Sprint | undefined;
}

export function createSprint(sprint: Omit<Sprint, "id" | "createdAt">): Sprint {
  const db = getDb();
  const result = db.prepare(
    "INSERT INTO sprints (name, startDate, endDate, goal, status) VALUES (?, ?, ?, ?, ?)"
  ).run(sprint.name, sprint.startDate, sprint.endDate, sprint.goal, sprint.status);
  return getSprintById(Number(result.lastInsertRowid))!;
}

export function updateSprint(id: number, updates: Partial<Sprint>): void {
  const db = getDb();
  const fields = Object.keys(updates).filter(k => k !== "id" && k !== "createdAt");
  if (fields.length === 0) return;
  const setClause = fields.map(f => `${f} = ?`).join(", ");
  const values = fields.map(f => (updates as any)[f]);
  db.prepare(`UPDATE sprints SET ${setClause} WHERE id = ?`).run(...values, id);
}

export function deleteSprint(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM sprints WHERE id = ?").run(id);
}

export function activateSprint(id: number): void {
  const db = getDb();
  db.prepare("UPDATE sprints SET status = 'completed' WHERE status = 'active'").run();
  db.prepare("UPDATE sprints SET status = 'active' WHERE id = ?").run(id);
}

// Task operations
export function getAllTasks(): Task[] {
  const db = getDb();
  return db.prepare("SELECT * FROM tasks ORDER BY updatedAt DESC").all() as Task[];
}

export function getTasksBySprint(sprintId: number | null): Task[] {
  const db = getDb();
  if (sprintId === null) {
    return db.prepare("SELECT * FROM tasks WHERE sprintId IS NULL ORDER BY updatedAt DESC").all() as Task[];
  }
  return db.prepare("SELECT * FROM tasks WHERE sprintId = ? ORDER BY updatedAt DESC").all(sprintId) as Task[];
}

export function getTasksByStatus(status: TaskStatus, sprintId?: number): Task[] {
  const db = getDb();
  if (sprintId !== undefined) {
    return db.prepare("SELECT * FROM tasks WHERE status = ? AND sprintId = ? ORDER BY updatedAt DESC").all(status, sprintId) as Task[];
  }
  return db.prepare("SELECT * FROM tasks WHERE status = ? ORDER BY updatedAt DESC").all(status) as Task[];
}

export function getTaskById(id: number): Task | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
}

export function createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(
    "INSERT INTO tasks (title, description, status, assignee, points, sprintId, createdAt, updatedAt, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(task.title, task.description, task.status, task.assignee, task.points, task.sprintId, now, now, task.priority);
  const newTask = getTaskById(Number(result.lastInsertRowid))!;
  db.prepare("INSERT INTO task_history (taskId, status, date) VALUES (?, ?, ?)").run(newTask.id, newTask.status, now);
  return newTask;
}

export function updateTask(id: number, updates: Partial<Task>): Task {
  const db = getDb();
  const fields = Object.keys(updates).filter(k => k !== "id" && k !== "createdAt");
  if (fields.length === 0) return getTaskById(id)!;
  const setClause = fields.map(f => `${f} = ?`).join(", ");
  const values = fields.map(f => (updates as any)[f]);
  db.prepare(`UPDATE tasks SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
  const task = getTaskById(id)!;
  if (updates.status) {
    db.prepare("INSERT INTO task_history (taskId, status, date) VALUES (?, ?, ?)").run(id, updates.status, new Date().toISOString());
  }
  return task;
}

export function deleteTask(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
}

export function moveTaskToSprint(taskId: number, sprintId: number | null): void {
  const db = getDb();
  db.prepare("UPDATE tasks SET sprintId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(sprintId, taskId);
}

// Task history for burndown
export function getTaskHistory(taskId: number): TaskHistory[] {
  const db = getDb();
  return db.prepare("SELECT * FROM task_history WHERE taskId = ? ORDER BY date ASC").all(taskId) as TaskHistory[];
}

export function getAllTaskHistoryForSprint(sprintId: number): TaskHistory[] {
  const db = getDb();
  return db.prepare(`
    SELECT th.* FROM task_history th
    JOIN tasks t ON th.taskId = t.id
    WHERE t.sprintId = ?
    ORDER BY th.date ASC
  `).all(sprintId) as TaskHistory[];
}

// Stats
export function getSprintStats(sprintId: number) {
  const db = getDb();
  const total = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE sprintId = ?").get(sprintId) as { count: number };
  const done = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE sprintId = ? AND status = 'done'").get(sprintId) as { count: number };
  const totalPoints = db.prepare("SELECT COALESCE(SUM(points), 0) as sum FROM tasks WHERE sprintId = ?").get(sprintId) as { sum: number };
  const donePoints = db.prepare("SELECT COALESCE(SUM(points), 0) as sum FROM tasks WHERE sprintId = ? AND status = 'done'").get(sprintId) as { sum: number };
  return {
    totalTasks: total.count,
    doneTasks: done.count,
    totalPoints: totalPoints.sum,
    donePoints: donePoints.sum,
  };
}
