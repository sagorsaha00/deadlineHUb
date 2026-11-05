import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  UserCheck,
  Clock,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  X,
  Users,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getInitials, cn } from "../../utils/formatters";
import { RoleBadge } from "../common/Badge";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../../services/api";
import { AiAssistantModal } from "../ai/AiAssistantModal";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getNotifications(true),
    refetchInterval: 30000, // Refetch every 30s
  });

  const unreadCount = notifData?.data?.unreadCount ?? 0;

  // Role-specific navigation items
  const baseNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tasks", label: "All Tasks", icon: CheckSquare },
    ...(isAdmin
      ? [{ to: "/team", label: "Team Members", icon: Users }]
      : [{ to: "/assigned-to-me", label: "Assigned to Me", icon: UserCheck }]),
    { to: "/deadlines", label: "Deadlines", icon: Clock },
    { to: "/discussions", label: "Discussions", icon: MessageSquare },
    {
      to: "/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              D
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm">
              Deadline<span className="text-slate-500 font-normal">Hub</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {baseNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* AI Assistant Quick Trigger */}
          <div className="pt-3 border-t border-slate-100 mt-3">
            <button
              onClick={() => {
                setAiModalOpen(true);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-800 bg-linear-to-r from-blue-50 to-indigo-50/70 border border-blue-100/80 hover:border-blue-200 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-blue-900">AI Assistant</span>
              </div>
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono">
                Groq
              </span>
            </button>
          </div>
        </nav>

        {/* Bottom User Pill */}
        {user && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="truncate text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user.name}
                    </p>
                    <RoleBadge role={user.role} className="scale-85 origin-left" />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Floating AI Assistant Modal */}
      <AiAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </>
  );
};
