import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Send,
  MessageSquare,
  CheckCircle,
  Clock,
  ArrowRightCircle,
  Flag,
  UserCheck,
  Calendar,
} from "lucide-react";
import { Task, TaskStatus, Priority } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { taskService } from "../../services/api";

interface TaskActionMenuProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onRefresh?: () => void;
}

export const TaskActionMenu: React.FC<TaskActionMenuProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onRefresh,
}) => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setStatusMenuOpen(false);
        setPriorityMenuOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSendReminder = async () => {
    try {
      setSendingReminder(true);
      await taskService.sendReminder(task.id);
      setReminderMessage("Reminder sent!");
      setTimeout(() => {
        setReminderMessage(null);
        setIsOpen(false);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  const handleStatusSelect = async (newStatus: TaskStatus) => {
    try {
      if (onStatusChange) {
        onStatusChange(task.id, newStatus);
      } else {
        await taskService.updateStatus(task.id, newStatus);
        if (onRefresh) onRefresh();
      }
      setIsOpen(false);
      setStatusMenuOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handlePrioritySelect = async (newPriority: Priority) => {
    try {
      await taskService.updateTask(task.id, { priority: newPriority });
      if (onRefresh) onRefresh();
      setIsOpen(false);
      setPriorityMenuOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update priority");
    }
  };

  const handleSubmitReview = async () => {
    try {
      await taskService.submitForReview(task.id);
      if (onRefresh) onRefresh();
      setIsOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit for review");
    }
  };

  const isAssignedToUser =
    task.assignedToId === user?.id ||
    task.assignedEmail?.toLowerCase() === user?.email?.toLowerCase();

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setStatusMenuOpen(false);
          setPriorityMenuOpen(false);
        }}
        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Shared Action: View Details */}
          <div className="py-1">
            <button
              onClick={() => {
                navigate(`/tasks/${task.id}`);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>View Details</span>
            </button>
          </div>

          {/* ADMIN ACTIONS (8 items) */}
          {isAdmin ? (
            <>
              <div className="py-1">
                {onEdit && (
                  <>
                    <button
                      onClick={() => {
                        onEdit(task);
                        setIsOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Task</span>
                    </button>

                    <button
                      onClick={() => {
                        onEdit(task);
                        setIsOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Change Assignee</span>
                    </button>

                    <button
                      onClick={() => {
                        onEdit(task);
                        setIsOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Change Deadline</span>
                    </button>
                  </>
                )}

                {/* Change Status Submenu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setStatusMenuOpen(!statusMenuOpen);
                      setPriorityMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowRightCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Change Status</span>
                    </div>
                    <span className="text-[10px] text-slate-400">▸</span>
                  </button>

                  {statusMenuOpen && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 bg-slate-50/80 rounded-md mx-2 my-1 border border-slate-100">
                      {(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"] as TaskStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusSelect(st)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            task.status === st
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-200/60"
                          }`}
                        >
                          {st.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Change Priority Submenu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setPriorityMenuOpen(!priorityMenuOpen);
                      setStatusMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Flag className="w-3.5 h-3.5 text-slate-400" />
                      <span>Change Priority</span>
                    </div>
                    <span className="text-[10px] text-slate-400">▸</span>
                  </button>

                  {priorityMenuOpen && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 bg-slate-50/80 rounded-md mx-2 my-1 border border-slate-100">
                      {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Priority[]).map((pr) => (
                        <button
                          key={pr}
                          onClick={() => handlePrioritySelect(pr)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            task.priority === pr
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-200/60"
                          }`}
                        >
                          {pr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Deadline Reminder */}
                {task.status !== "COMPLETED" && (
                  <button
                    onClick={handleSendReminder}
                    disabled={sendingReminder}
                    className="w-full px-3.5 py-1.5 text-left text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-500" />
                    <span>{reminderMessage || (sendingReminder ? "Sending..." : "Send Deadline Reminder")}</span>
                  </button>
                )}
              </div>

              {/* Danger Zone: Delete */}
              {onDelete && (
                <div className="py-1">
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete task "${task.title}"? This cannot be undone.`)) {
                        onDelete(task.id);
                        setIsOpen(false);
                      }
                    }}
                    className="w-full px-3.5 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete Task</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            /* MEMBER ACTIONS (3 items) */
            <div className="py-1">
              {/* Submit for Review if In Progress / To Do */}
              {isAssignedToUser && task.status !== "COMPLETED" && task.status !== "IN_REVIEW" && (
                <button
                  onClick={handleSubmitReview}
                  className="w-full px-3.5 py-1.5 text-left text-indigo-600 hover:bg-indigo-50 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Submit for Review</span>
                </button>
              )}

              {/* Move to In Progress if TODO */}
              {isAssignedToUser && task.status === "TODO" && (
                <button
                  onClick={() => handleStatusSelect("IN_PROGRESS")}
                  className="w-full px-3.5 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Start Task (In Progress)</span>
                </button>
              )}

              {/* Add Comment */}
              <button
                onClick={() => {
                  navigate(`/tasks/${task.id}#comments`);
                  setIsOpen(false);
                }}
                className="w-full px-3.5 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Add Comment</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
