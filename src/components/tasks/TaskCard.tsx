import React from "react";
import { Link } from "react-router-dom";
import { Task, TaskStatus } from "../../types";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import { LiveCountdown } from "../common/LiveCountdown";
import { ExternalLink, MessageSquare } from "lucide-react";
import { getInitials, formatDateTime } from "../../utils/formatters";
import { TaskActionMenu } from "./TaskActionMenu";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onRefresh?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onRefresh,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between group relative">
      <div>
        {/* Top meta: Priority, Status, Options */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>

          <TaskActionMenu
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onRefresh={onRefresh}
          />
        </div>

        {/* Task Title & Link */}
        <Link
          to={`/tasks/${task.id}`}
          className="block text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug"
        >
          {task.title}
        </Link>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Jira Link */}
        {task.jiraUrl && (
          <div className="mb-4">
            <a
              href={task.jiraUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-colors"
            >
              <span>Jira Ticket</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100">
        {/* Live Countdown */}
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1 flex items-center justify-between">
            <span>Deadline: {formatDateTime(task.deadline)}</span>
          </div>
          <LiveCountdown
            deadline={task.deadline}
            isCompleted={task.status === "COMPLETED"}
            className="w-full justify-center"
          />
        </div>

        {/* Bottom row: Assignee & Comment Count */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-semibold">
              {getInitials(task.assignedName)}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-medium text-slate-800 truncate max-w-[120px]">
                {task.assignedName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{task._count?.comments ?? task.comments?.length ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
