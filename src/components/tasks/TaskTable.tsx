import React from "react";
import { Link } from "react-router-dom";
import { Task, TaskStatus } from "../../types";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import { LiveCountdown } from "../common/LiveCountdown";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { getInitials } from "../../utils/formatters";
import { TaskActionMenu } from "./TaskActionMenu";

interface TaskTableProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onRefresh?: () => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onRefresh,
}) => {
  return (
    <div className="overflow-visible bg-white rounded-xl border border-slate-200 shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">Task</th>
            <th className="py-3 px-4">Assignee</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Countdown / Deadline</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
              {/* Task Title + Jira */}
              <td className="py-3.5 px-4 max-w-xs">
                <div className="space-y-1">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 flex items-center gap-1 group"
                  >
                    <span>{task.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  {task.jiraUrl && (
                    <a
                      href={task.jiraUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      Jira Ticket
                    </a>
                  )}
                </div>
              </td>

              {/* Assignee */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-semibold">
                    {getInitials(task.assignedName)}
                  </div>
                  <div className="truncate max-w-[130px]">
                    <div className="font-medium text-slate-900 truncate">
                      {task.assignedName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {task.assignedEmail}
                    </div>
                  </div>
                </div>
              </td>

              {/* Priority */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <PriorityBadge priority={task.priority} />
              </td>

              {/* Status */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <StatusBadge status={task.status} />
              </td>

              {/* Countdown */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <LiveCountdown
                  deadline={task.deadline}
                  isCompleted={task.status === "COMPLETED"}
                  compact={true}
                />
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <TaskActionMenu
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onRefresh={onRefresh}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
