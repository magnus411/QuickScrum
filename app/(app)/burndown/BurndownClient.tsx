"use client";

import { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Sprint, Task, TaskHistory } from "@/app/lib/types";
import { TrendingDown, Target, Calendar, Zap, CheckCircle2 } from "lucide-react";

interface BurndownData {
  sprint: Sprint;
  tasks: Task[];
  history: TaskHistory[];
  stats: { totalTasks: number; doneTasks: number; totalPoints: number; donePoints: number };
}

interface BurndownClientProps {
  data: BurndownData | null;
}

export default function BurndownClient({ data }: BurndownClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = useMemo(() => {
    if (!data) return [];

    const { sprint, tasks, history } = data;
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const days: Date[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0) || tasks.length * 3;
    const daysCount = days.length || 1;
    const idealBurnPerDay = totalPoints / (daysCount - 1 || 1);

    const taskDoneDates = new Map<number, string>();
    for (const h of history) {
      if (h.status === "done") {
        const existing = taskDoneDates.get(h.taskId);
        if (!existing || h.date < existing) {
          taskDoneDates.set(h.taskId, h.date);
        }
      }
    }

    return days.map((day, index) => {
      const dayStr = day.toISOString().split("T")[0];

      let pointsDoneByDay = 0;
      for (const task of tasks) {
        const doneDate = taskDoneDates.get(task.id);
        if (doneDate && doneDate.split("T")[0] <= dayStr) {
          pointsDoneByDay += task.points || 1;
        }
      }

      if (history.length === 0 && day.getTime() >= new Date().getTime()) {
        const doneTasks = tasks.filter((t) => t.status === "done");
        pointsDoneByDay = doneTasks.reduce((sum, t) => sum + (t.points || 1), 0);
      }

      const remaining = Math.max(0, totalPoints - pointsDoneByDay);
      const idealRemaining = Math.max(0, totalPoints - idealBurnPerDay * index);

      return {
        date: day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        rawDate: dayStr,
        ideal: Math.round(idealRemaining * 10) / 10,
        actual: Math.round(remaining * 10) / 10,
      };
    });
  }, [data]);

  const completionData = useMemo(() => {
    if (!data) return [];
    const { sprint, tasks, history } = data;
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const days: Date[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    const total = tasks.length;
    if (total === 0) return [];

    const taskDoneDates = new Map<number, string>();
    for (const h of history) {
      if (h.status === "done") {
        const existing = taskDoneDates.get(h.taskId);
        if (!existing || h.date < existing) {
          taskDoneDates.set(h.taskId, h.date);
        }
      }
    }

    return days.map((day) => {
      const dayStr = day.toISOString().split("T")[0];
      let doneCount = 0;
      for (const task of tasks) {
        const doneDate = taskDoneDates.get(task.id);
        if (doneDate && doneDate.split("T")[0] <= dayStr) {
          doneCount++;
        }
      }
      if (history.length === 0 && day.getTime() >= new Date().getTime()) {
        doneCount = tasks.filter((t) => t.status === "done").length;
      }
      return {
        date: day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        completed: Math.round((doneCount / total) * 100),
      };
    });
  }, [data]);

  if (!data) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Burndown Chart</h1>
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Sprint</h2>
          <p className="text-gray-500">Activate a sprint to see the burndown chart.</p>
        </div>
      </div>
    );
  }

  const { sprint, stats } = data;
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Burndown Chart</h1>
        <p className="text-gray-500 mt-1">
          {sprint.name} — Track your sprint progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Points</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalPoints}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Done Points</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.donePoints}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Completion</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Tasks Done</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.doneTasks}/{stats.totalTasks}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Sprint Burndown</h3>
        <div className="h-[400px] w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="ideal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorIdeal)" name="Ideal" />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fill="url(#colorActual)" name="Actual" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Task Completion Rate</h3>
        <div className="h-[300px] w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [`${value}%`, "Completed"]}
                />
                <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 2 }} name="Completion %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
