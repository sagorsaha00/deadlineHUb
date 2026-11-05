import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService, taskService } from "../../services/api";
import { User, Task } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { RoleBadge } from "../../components/common/Badge";
import { getInitials, formatDateOnly as formatDate } from "../../utils/formatters";
import { Users, Search, CheckSquare, ShieldCheck, UserCheck } from "lucide-react";

export const TeamMembers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["team-users"],
    queryFn: () => userService.getUsers(),
  });

  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ["team-all-tasks"],
    queryFn: () => taskService.getTasks({ limit: 100 }),
  });

  const users: User[] = usersData?.data ?? [];
  const tasks: Task[] = tasksData?.data?.tasks ?? [];

  if (loadingUsers || loadingTasks) {
    return <LoadingSpinner size="lg" label="Loading team members..." className="h-64" />;
  }

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const memberCount = users.filter((u) => u.role === "MEMBER").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team Members</h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of registered team members, roles, and assigned workload
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Team</p>
            <p className="text-lg font-bold text-slate-900">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Administrators</p>
            <p className="text-lg font-bold text-slate-900">{adminCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Members</p>
            <p className="text-lg font-bold text-slate-900">{memberCount}</p>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Active Tasks</th>
                <th className="py-3 px-4">Completed Tasks</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((member) => {
                  const memberTasks = tasks.filter(
                    (t) =>
                      t.assignedToId === member.id ||
                      t.assignedEmail.toLowerCase() === member.email.toLowerCase()
                  );
                  const activeCount = memberTasks.filter((t) => t.status !== "COMPLETED").length;
                  const completedCount = memberTasks.filter((t) => t.status === "COMPLETED").length;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{member.name}</p>
                            <p className="text-[11px] text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <RoleBadge role={member.role} />
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            activeCount > 3 ? "text-amber-600" : "text-slate-700"
                          }`}
                        >
                          {activeCount} active
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 font-medium">
                          {completedCount} completed
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(member.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
