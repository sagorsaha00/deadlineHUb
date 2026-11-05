import React from "react";
import { cn } from "../../utils/formatters";
import { Priority, TaskStatus, Role } from "../../types";

export const StatusBadge: React.FC<{ status: TaskStatus; className?: string }> = ({
  status,
  className,
}) => {
  const map: Record<TaskStatus, { label: string; style: string; dot: string }> = {
    TODO: {
      label: "To Do",
      style: "bg-slate-100 text-slate-700 border-slate-200/80",
      dot: "bg-slate-400",
    },
    IN_PROGRESS: {
      label: "In Progress",
      style: "bg-blue-50 text-blue-700 border-blue-200/80",
      dot: "bg-blue-500",
    },
    IN_REVIEW: {
      label: "In Review",
      style: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      dot: "bg-indigo-500",
    },
    COMPLETED: {
      label: "Completed",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      dot: "bg-emerald-500",
    },
  };

  const item = map[status] || map.TODO;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        item.style,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", item.dot)} />
      {item.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({
  priority,
  className,
}) => {
  const map: Record<Priority, { label: string; style: string }> = {
    LOW: {
      label: "Low",
      style: "bg-slate-100 text-slate-600 border-slate-200",
    },
    MEDIUM: {
      label: "Medium",
      style: "bg-sky-50 text-sky-700 border-sky-200",
    },
    HIGH: {
      label: "High",
      style: "bg-amber-50 text-amber-800 border-amber-200",
    },
    CRITICAL: {
      label: "Critical",
      style: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
    },
  };

  const item = map[priority] || map.MEDIUM;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        item.style,
        className
      )}
    >
      {item.label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: Role; className?: string }> = ({
  role,
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border",
        role === "ADMIN"
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-slate-100 text-slate-700 border-slate-200",
        className
      )}
    >
      {role}
    </span>
  );
};
