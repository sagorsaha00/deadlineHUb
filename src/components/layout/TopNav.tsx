import React from "react";
import { Menu, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../../services/api";

interface TopNavProps {
  onMenuClick: () => void;
  title?: string;
  action?: React.ReactNode;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuClick, title, action }) => {
  const { data: notifData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getNotifications(true),
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.data?.unreadCount ?? 0;

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 -ml-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-sm font-semibold text-slate-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {action}

        <Link
          to="/notifications"
          className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
          )}
        </Link>
      </div>
    </header>
  );
};
