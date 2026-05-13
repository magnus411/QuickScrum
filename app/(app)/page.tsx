import {
  getActiveSprint,
  getTasksBySprint,
  getAllSprints,
  getSprintStats,
} from "@/app/lib/db";
import { COLUMNS, TEAM_MEMBERS, MEMBER_COLORS } from "@/app/lib/types";
import MemberAvatar from "@/app/components/MemberAvatar";
import {
  Timer,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";

export default async function DashboardPage() {
  const activeSprint = getActiveSprint();
  const allSprints = getAllSprints();
  const tasks = activeSprint ? getTasksBySprint(activeSprint.id) : [];
  const stats = activeSprint ? getSprintStats(activeSprint.id) : null;

  const statusCounts = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const assigneeCounts = TEAM_MEMBERS.reduce(
    (acc, member) => {
      acc[member] = tasks.filter((t) => t.assignee === member).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const completionRate =
    stats && stats.totalTasks > 0
      ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your team's progress</p>
      </div>

      {activeSprint ? (
        <>
          {/* Sprint Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-blue-200" />
                  <span className="text-sm font-medium text-blue-100 uppercase tracking-wider">
                    Active Sprint
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{activeSprint.name}</h2>
                <p className="text-blue-100 mt-1 text-sm">
                  {activeSprint.goal || "No goal set"}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(
                      activeSprint.startDate,
                    ).toLocaleDateString()} -{" "}
                    {new Date(activeSprint.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{completionRate}%</div>
                <div className="text-sm text-blue-200">Completion</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Total Tasks
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalTasks || 0}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Completed
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.doneTasks || 0}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Story Points
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.donePoints || 0}/{stats?.totalPoints || 0}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Team Size
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {TEAM_MEMBERS.length}
              </div>
            </div>
          </div>

          {/* Status Distribution & Team Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-5">
                Status Distribution
              </h3>
              <div className="space-y-4">
                {COLUMNS.map((col) => {
                  const count = statusCounts[col.id] || 0;
                  const percent =
                    tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  return (
                    <div key={col.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">
                          {col.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: col.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-5">
                Team Workload
              </h3>
              <div className="space-y-4">
                {TEAM_MEMBERS.map((member) => {
                  const count = assigneeCounts[member] || 0;
                  const maxTasks = Math.max(
                    ...Object.values(assigneeCounts),
                    1,
                  );
                  const percent = (count / maxTasks) * 100;
                  return (
                    <div key={member} className="flex items-center gap-4">
                      <MemberAvatar member={member} size="md" showName />
                      <div className="flex-1">
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full transition-all"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: MEMBER_COLORS[member],
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Timer className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Active Sprint
          </h2>
          <p className="text-gray-500 mb-6">
            Create and activate a sprint to start tracking progress.
          </p>
          <a
            href="/sprints"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Sprints
          </a>
        </div>
      )}
    </div>
  );
}
