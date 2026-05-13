"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Line,
  ComposedChart,
} from "recharts";
import { TrendingUp, Target, Zap, BarChart3 } from "lucide-react";

interface VelocityData {
  sprint: string;
  committed: number;
  completed: number;
  tasks: number;
}

interface VelocityClientProps {
  data: VelocityData[];
  average: number;
}

export default function VelocityClient({ data, average }: VelocityClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalCommitted = data.reduce((sum, d) => sum + d.committed, 0);
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalTasks = data.reduce((sum, d) => sum + d.tasks, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Velocity</h1>
        <p className="text-gray-500 mt-1">Track story points across completed sprints</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Completed Sprints Yet</h2>
          <p className="text-gray-500">Complete a sprint to see velocity data.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Avg Velocity</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{average}</div>
              <p className="text-xs text-gray-400 mt-1">points / sprint</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Completed</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalCompleted}</div>
              <p className="text-xs text-gray-400 mt-1">points all time</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Committed</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalCommitted}</div>
              <p className="text-xs text-gray-400 mt-1">points planned</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Sprints</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{data.length}</div>
              <p className="text-xs text-gray-400 mt-1">{totalTasks} tasks total</p>
            </div>
          </div>

          {/* Main Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Sprint Velocity</h3>
            <div className="h-[400px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="sprint" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} />
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
                    <ReferenceLine y={average} stroke="#8b5cf6" strokeDasharray="5 5" label={{ value: `Avg: ${average}`, position: "right", fill: "#8b5cf6", fontSize: 12 }} />
                    <Bar dataKey="committed" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Committed" />
                    <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completed" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Completion Rate Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Completion Rate %</h3>
            <div className="h-[300px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.map(d => ({
                    ...d,
                    rate: d.committed > 0 ? Math.round((d.completed / d.committed) * 100) : 0
                  }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="sprint" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number) => [`${value}%`, "Completion Rate"]}
                    />
                    <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" />
                    <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} name="Completion %" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
