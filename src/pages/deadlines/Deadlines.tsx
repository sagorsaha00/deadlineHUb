import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "../../services/api";
import { Task } from "../../types";
import { TaskCard } from "../../components/tasks/TaskCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Clock, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Deadlines: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "today" | "overdue" | "completed">("upcoming");

  // Fetch all tasks for comprehensive categorization
  const { data: allTasksData, isLoading } = useQuery({
    queryKey: ["tasks", "deadlines-view"],
    queryFn: () => taskService.getTasks({ limit: 100 }),
  });

  const tasks = allTasksData?.data?.tasks || [];

  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const completed = tasks.filter((t) => t.status === "COMPLETED");
  const overdue = tasks.filter(
    (t) => t.status !== "COMPLETED" && new Date(t.deadline).getTime() < now.getTime()
  );
  const dueToday = tasks.filter((t) => {
    if (t.status === "COMPLETED") return false;
    const d = new Date(t.deadline).getTime();
    return d >= startOfToday.getTime() && d <= endOfToday.getTime();
  });
  const upcoming = tasks.filter(
    (t) => t.status !== "COMPLETED" && new Date(t.deadline).getTime() >= now.getTime()
  );

  const tabCounts = {
    upcoming: upcoming.length,
    today: dueToday.length,
    overdue: overdue.length,
    completed: completed.length,
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case "upcoming":
        return upcoming;
      case "today":
        return dueToday;
      case "overdue":
        return overdue;
      case "completed":
        return completed;
      default:
        return [];
    }
  };

  const currentTasks = getFilteredTasks();

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Analyzing deadlines..." className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Deadlines Overview
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time timeframes and delivery status across all tasks
        </p>
      </div>

      {/* 4 Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "upcoming"
              ? "border-slate-900 text-slate-900 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Upcoming Deadlines</span>
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {tabCounts.upcoming}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "today"
              ? "border-slate-900 text-slate-900 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span>Due Today</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {tabCounts.today}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "overdue"
              ? "border-slate-900 text-slate-900 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span>Overdue</span>
          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {tabCounts.overdue}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "completed"
              ? "border-slate-900 text-slate-900 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Completed</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {tabCounts.completed}
          </span>
        </button>
      </div>

      {/* Grid of Tasks */}
      {currentTasks.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} tasks`}
          description={`There are currently no tasks categorized as ${activeTab}.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
