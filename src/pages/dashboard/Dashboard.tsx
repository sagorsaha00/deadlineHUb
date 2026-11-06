import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  taskService,
  activityService,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ExternalLink,
  ClipboardCheck,
  Check,
  RotateCcw,
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  PlayCircle,
  ListTodo,
} from "lucide-react";
import { TaskCard } from "../../components/tasks/TaskCard";
import { TaskModal } from "../tasks/TaskModal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { formatRelative, getInitials } from "../../utils/formatters";
import { StatusBadge, PriorityBadge } from "../../components/common/Badge";
import { LiveCountdown } from "../../components/common/LiveCountdown";

export const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 1. Dedicated PostgreSQL Aggregate Statistics Query
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["tasks", "dashboard-stats"],
    queryFn: () => taskService.getDashboardStats(),
  });

  // 2. Tasks list query for task cards
  const { data: allTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "dashboard"],
    queryFn: () => taskService.getTasks({ limit: 10 }),
  });

  // 3. Upcoming deadlines
  const { data: upcomingData } = useQuery({
    queryKey: ["tasks", "upcoming"],
    queryFn: () => taskService.getUpcomingDeadlines(),
  });

  // 4. Tasks assigned to current user
  const { data: assignedData } = useQuery({
    queryKey: ["tasks", "assigned-to-me"],
    queryFn: () => taskService.getAssignedToMe(),
  });

  // 5. Activity history
  const { data: activityData } = useQuery({
    queryKey: ["activity", "recent"],
    queryFn: () => activityService.getRecentActivity(),
  });

  const stats = statsData?.data;
  const totalTasks = stats?.totalTasks ?? 0;
  const todoCount = stats?.todoCount ?? 0;
  const inProgressCount = stats?.inProgressCount ?? 0;
  const inReviewCount = stats?.inReviewCount ?? 0;
  const completedCount = stats?.completedCount ?? 0;
  const overdueCount = stats?.overdueCount ?? 0;
  const remainingCount = stats?.remainingCount ?? 0;
  const completionProgress = stats?.completionProgress ?? 0;
  const deadlines = stats?.deadlines ?? {
    dueToday: 0,
    dueTomorrow: 0,
    dueIn7Days: 0,
    overdue: 0,
    completed: 0,
  };
  const teamProgress = stats?.teamProgress ?? [];

  const tasks = allTasksData?.data?.tasks || [];
  const upcomingTasks = upcomingData?.data || [];
  const assignedTasks = assignedData?.data || [];
  const activities = activityData?.data || [];

  const inReviewTasks = tasks.filter((t) => t.status === "IN_REVIEW");

  const handleAdminApprove = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      await taskService.completeTask(taskId);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to approve task");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdminRequestChanges = async (taskId: string) => {
    const reason = prompt("Enter revision details or reason for requesting changes:");
    if (reason === null) return;
    try {
      setActionLoading(taskId);
      await taskService.requestChanges(taskId, reason);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to request changes");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMemberSubmitReview = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      await taskService.submitForReview(taskId);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit for review");
    } finally {
      setActionLoading(null);
    }
  };

  if (tasksLoading && statsLoading) {
    return <LoadingSpinner size="lg" label="Loading dashboard metrics..." className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? "Administrator command center: real-time database statistics, review queue & workload"
              : "Your personal assignment board: track deadlines and submit deliverables"}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        )}
      </div>

      {/* Primary Status Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Tasks / Assigned */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {isAdmin ? "Total Tasks" : "Assigned"}
            </span>
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{totalTasks}</div>
          <p className="text-[10px] text-slate-400 mt-1">
            {isAdmin ? "Database total" : "Your active pool"}
          </p>
        </div>

        {/* TODO */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">To Do</span>
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
              <ListTodo className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-700 tracking-tight">{todoCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Not yet started</p>
        </div>

        {/* In Progress */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">In Progress</span>
            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
              <PlayCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 tracking-tight">{inProgressCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Under active work</p>
        </div>

        {/* In Review */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">In Review</span>
            <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ClipboardCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 tracking-tight">{inReviewCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting sign-off</p>
        </div>

        {/* Completed */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Completed</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">{completedCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Delivered successfully</p>
        </div>

        {/* Overdue */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Overdue</span>
            <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 tracking-tight">{overdueCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Passed deadline</p>
        </div>
      </div>

      {/* Completion Progress & Deadlines Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Completion Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-semibold text-slate-900">
                  {isAdmin ? "Overall Project Completion Progress" : "Personal Task Progress"}
                </h2>
              </div>
              <span className="text-sm font-bold text-slate-900">{completionProgress}%</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Calculated dynamically from real database records (Completed ÷ Total × 100)
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-3 transition-all duration-500 rounded-l-full"
                style={{ width: `${completionProgress}%` }}
                title={`Completed: ${completionProgress}%`}
              />
              <div
                className="bg-blue-400 h-3 transition-all duration-500"
                style={{
                  width: `${totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0}%`,
                }}
                title={`In Progress: ${inProgressCount}`}
              />
              <div
                className="bg-indigo-400 h-3 transition-all duration-500"
                style={{
                  width: `${totalTasks > 0 ? (inReviewCount / totalTasks) * 100 : 0}%`,
                }}
                title={`In Review: ${inReviewCount}`}
              />
            </div>
          </div>

          {/* Detailed Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Completed</div>
              <div className="text-base font-bold text-emerald-600">{completedCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Remaining</div>
              <div className="text-base font-bold text-slate-800">{remainingCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="text-[10px] uppercase font-semibold text-slate-500">In Progress</div>
              <div className="text-base font-bold text-blue-600">{inProgressCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="text-[10px] uppercase font-semibold text-slate-500">In Review</div>
              <div className="text-base font-bold text-indigo-600">{inReviewCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Overdue</div>
              <div className="text-base font-bold text-rose-600">{overdueCount}</div>
            </div>
          </div>
        </div>

        {/* Deadlines Overview Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-semibold text-slate-900">Deadline Schedule</h2>
              </div>
              <Link to="/deadlines" className="text-[11px] font-semibold text-blue-600 hover:underline">
                View all &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-3">Timeframe breakdown based on due dates</p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-100 bg-amber-50/50">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-900">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Due Today</span>
              </div>
              <span className="text-xs font-bold text-amber-700 px-2 py-0.5 rounded-md bg-white border border-amber-200">
                {deadlines.dueToday}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-100 bg-blue-50/50">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-900">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Due Tomorrow</span>
              </div>
              <span className="text-xs font-bold text-blue-700 px-2 py-0.5 rounded-md bg-white border border-blue-200">
                {deadlines.dueTomorrow}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Due within 7 Days</span>
              </div>
              <span className="text-xs font-bold text-slate-700 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                {deadlines.dueIn7Days}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-rose-100 bg-rose-50/50">
              <div className="flex items-center gap-2 text-xs font-medium text-rose-900">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Overdue (Unresolved)</span>
              </div>
              <span className="text-xs font-bold text-rose-700 px-2 py-0.5 rounded-md bg-white border border-rose-200">
                {deadlines.overdue}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Review Queue Widget */}
      {isAdmin && inReviewTasks.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-indigo-950">
                Review Queue ({inReviewTasks.length})
              </h2>
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">
              Tasks submitted for your review and approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inReviewTasks.map((t) => (
              <div
                key={t.id}
                className="bg-white p-3.5 rounded-lg border border-indigo-100 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Link
                      to={`/tasks/${t.id}`}
                      className="font-semibold text-xs text-slate-900 hover:text-blue-600 line-clamp-1"
                    >
                      {t.title}
                    </Link>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Submitted by: <strong className="text-slate-800">{t.assignedName}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Link
                    to={`/tasks/${t.id}`}
                    className="text-[11px] text-indigo-600 hover:underline font-medium"
                  >
                    Inspect details &rarr;
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAdminRequestChanges(t.id)}
                      disabled={actionLoading === t.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleAdminApprove(t.id)}
                      disabled={actionLoading === t.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3 h-3" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin: Team Progress Breakdown Table */}
      {isAdmin && teamProgress.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Team Workload & Progress</h2>
                <p className="text-[11px] text-slate-500">Individual member assignment status from database</p>
              </div>
            </div>
            <Link to="/team" className="text-xs font-semibold text-slate-900 hover:text-blue-600">
              Manage Team &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium">
                  <th className="pb-2.5 font-medium">Member</th>
                  <th className="pb-2.5 font-medium text-center">Assigned</th>
                  <th className="pb-2.5 font-medium text-center">In Progress</th>
                  <th className="pb-2.5 font-medium text-center">In Review</th>
                  <th className="pb-2.5 font-medium text-center">Completed</th>
                  <th className="pb-2.5 font-medium text-center">Overdue</th>
                  <th className="pb-2.5 font-medium text-right">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamProgress.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{member.name}</div>
                          <div className="text-[10px] text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center font-semibold text-slate-700">{member.totalAssigned}</td>
                    <td className="py-3 text-center font-medium text-blue-600">{member.inProgress}</td>
                    <td className="py-3 text-center font-medium text-indigo-600">{member.inReview}</td>
                    <td className="py-3 text-center font-medium text-emerald-600">{member.completed}</td>
                    <td className="py-3 text-center font-medium text-rose-600">
                      {member.overdue > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                          {member.overdue}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${member.completionPercentage}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[11px] text-slate-800 w-8 text-right">
                          {member.completionPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Grid: Upcoming Deadlines & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Upcoming Deadlines & Recent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Upcoming Deadlines</h2>
                <p className="text-[11px] text-slate-500">Live countdown to critical deliverables</p>
              </div>
              <Link
                to="/deadlines"
                className="text-xs font-semibold text-slate-900 hover:text-blue-600 inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {upcomingTasks.length === 0 ? (
              <EmptyState
                title="No upcoming deadlines"
                description="All current deadlines are either completed or past."
              />
            ) : (
              <div className="space-y-3">
                {upcomingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="font-semibold text-xs text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {task.title}
                        </Link>
                        {task.jiraUrl && (
                          <a
                            href={task.jiraUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-blue-600 hover:text-blue-800"
                            title="Open Jira Ticket"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Assigned: {task.assignedName}</span>
                        <span>•</span>
                        <PriorityBadge priority={task.priority} />
                        <span>•</span>
                        <StatusBadge status={task.status} />
                      </div>
                    </div>

                    <div className="shrink-0">
                      <LiveCountdown
                        deadline={task.deadline}
                        isCompleted={task.status === "COMPLETED"}
                        compact={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Added Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {isAdmin ? "Recent Team Tasks" : "Active Assignments"}
              </h2>
              <Link
                to={isAdmin ? "/tasks" : "/assigned-to-me"}
                className="text-xs font-semibold text-slate-900 hover:text-blue-600 inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {(isAdmin ? tasks : assignedTasks).length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <EmptyState
                  title={isAdmin ? "No tasks created yet" : "No tasks assigned to you"}
                  description={
                    isAdmin
                      ? "Create your first task to start assigning work and monitoring deadlines."
                      : "When an administrator assigns tasks to your account, they will appear here."
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(isAdmin ? tasks : assignedTasks).slice(0, 4).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onRefresh={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Member Actions & Activity History */}
        <div className="space-y-6">
          {!isAdmin ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">My Deliverables</h2>
                <Link
                  to="/assigned-to-me"
                  className="text-xs font-semibold text-slate-900 hover:text-blue-600"
                >
                  View ({assignedTasks.length})
                </Link>
              </div>

              {assignedTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No tasks assigned to you</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {assignedTasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="text-xs font-medium text-slate-900 hover:text-blue-600 line-clamp-1 block"
                        >
                          {task.title}
                        </Link>
                        <StatusBadge status={task.status} />
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <LiveCountdown
                          deadline={task.deadline}
                          isCompleted={task.status === "COMPLETED"}
                          compact={true}
                          showIcon={false}
                        />

                        {task.status !== "COMPLETED" && task.status !== "IN_REVIEW" && (
                          <button
                            onClick={() => handleMemberSubmitReview(task.id)}
                            disabled={actionLoading === task.id}
                            className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Submit for Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">Active Team Overview</h2>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                  {teamProgress.length} Members
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Track workload distribution, assign tasks, and verify deadlines across all team members in real-time.
              </p>
              <Link
                to="/team"
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Inspect full team roster &rarr;
              </Link>
            </div>
          )}

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent Activity</h2>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                      {getInitials(act.user?.name || "System")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 leading-snug">
                        <span className="font-semibold text-slate-900">
                          {act.user?.name || "User"}
                        </span>{" "}
                        <span className="text-slate-500 font-normal">{act.description}</span>
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {formatRelative(act.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};
