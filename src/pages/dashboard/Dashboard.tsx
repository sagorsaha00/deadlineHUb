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

  // Queries for real backend data
  const { data: allTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "dashboard"],
    queryFn: () => taskService.getTasks({ limit: 50 }),
  });

  const { data: upcomingData } = useQuery({
    queryKey: ["tasks", "upcoming"],
    queryFn: () => taskService.getUpcomingDeadlines(),
  });

  const { data: assignedData } = useQuery({
    queryKey: ["tasks", "assigned-to-me"],
    queryFn: () => taskService.getAssignedToMe(),
  });

  const { data: activityData } = useQuery({
    queryKey: ["activity", "recent"],
    queryFn: () => activityService.getRecentActivity(),
  });

  const tasks = allTasksData?.data?.tasks || [];
  const upcomingTasks = upcomingData?.data || [];
  const assignedTasks = assignedData?.data || [];
  const activities = activityData?.data || [];

  // Summary Metrics
  const totalTasks = allTasksData?.data?.pagination?.totalCount ?? tasks.length;
  const inReviewTasks = tasks.filter((t) => t.status === "IN_REVIEW");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;
  const activeTasks = Math.max(0, totalTasks - completedTasks);

  // Member metrics
  const myAssignedCount = assignedTasks.length;
  const myInReviewCount = assignedTasks.filter((t) => t.status === "IN_REVIEW").length;
  const myOverdueCount = assignedTasks.filter((t) => t.isOverdue).length;
  const myCompletedCount = assignedTasks.filter((t) => t.status === "COMPLETED").length;

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

  if (tasksLoading) {
    return <LoadingSpinner size="lg" label="Loading dashboard..." className="h-96" />;
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
              ? "Administrator command center: review submissions, monitor deadlines & workload"
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

      {/* Summary Stat Cards */}
      {isAdmin ? (
        /* ADMIN STAT CARDS */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-600">Total Tasks</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <CheckSquare className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{totalTasks}</div>
            <p className="text-[11px] text-slate-400 mt-1">Across all team members</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-600">Awaiting Review</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ClipboardCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-600 tracking-tight">
              {inReviewTasks.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Submissions pending approval</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-600">Completed</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{completedTasks}</div>
            <p className="text-[11px] text-slate-400 mt-1">Delivered deliverables</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-600">Overdue</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600 tracking-tight">{overdueTasks}</div>
            <p className="text-[11px] text-slate-400 mt-1">Need immediate follow-up</p>
          </div>
        </div>
      ) : (
        /* MEMBER STAT CARDS */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-600">Assigned to Me</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{myAssignedCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Your total tasks</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-600">Under Review</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ClipboardCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-600 tracking-tight">{myInReviewCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Waiting for Admin sign-off</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-600">Completed</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{myCompletedCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Approved & closed</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-600">Overdue</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600 tracking-tight">{myOverdueCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Past deadline date</p>
          </div>
        </div>
      )}

      {/* ADMIN REVIEW QUEUE WIDGET */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(isAdmin ? tasks : assignedTasks).slice(0, 4).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onRefresh={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Tasks Assigned to Me (or Team Members) & Recent Activity */}
        <div className="space-y-6">
          {/* Member: My Tasks Action List / Admin: Quick Link */}
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
                <h2 className="text-sm font-semibold text-slate-900">Team Directory</h2>
                <Link
                  to="/team"
                  className="text-xs font-semibold text-slate-900 hover:text-blue-600"
                >
                  Manage Team &rarr;
                </Link>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track workload distribution, assign tasks, and verify deadlines across all team members.
              </p>
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
