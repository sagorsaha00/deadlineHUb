import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../services/api";
import { Notification, NotificationType } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { formatRelative } from "../../utils/formatters";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  UserPlus,
  Trash2,
  CheckCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export const Notifications: React.FC = () => {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", unreadOnly],
    queryFn: () => notificationService.getNotifications(unreadOnly),
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification removed");
    },
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case "NEW_COMMENT":
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case "DEADLINE_REMINDER":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "TASK_OVERDUE":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "TASK_COMPLETED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading notifications..." className="h-64" />;
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time alerts, assignments, comments and deadline reminders
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}

          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              unreadOnly
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {unreadOnly ? "Showing Unread" : "Show Unread Only"}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={
            unreadOnly
              ? "You have no unread notifications right now."
              : "You're all caught up! New reminders and task activities will appear here."
          }
          icon={<Bell className="w-5 h-5 text-slate-400" />}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: Notification) => (
            <div
              key={notif.id}
              className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all ${
                notif.isRead
                  ? "bg-white border-slate-200/80 text-slate-600"
                  : "bg-blue-50/40 border-blue-200 text-slate-900 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.isRead ? "bg-slate-100" : "bg-white border border-slate-200"
                  }`}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <p className="text-xs font-medium leading-relaxed">{notif.message}</p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{formatRelative(notif.createdAt)}</span>

                    {notif.task && (
                      <>
                        <span>•</span>
                        <Link
                          to={`/tasks/${notif.task.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          View Task &rarr;
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => markReadMutation.mutate(notif.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => deleteMutation.mutate(notif.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
