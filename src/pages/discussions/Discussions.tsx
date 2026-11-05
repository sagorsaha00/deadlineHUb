import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { commentService } from "../../services/api";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { formatRelative, getInitials } from "../../utils/formatters";
import { PriorityBadge, StatusBadge } from "../../components/common/Badge";
import { MessageSquare, ArrowRight } from "lucide-react";

export const Discussions: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["discussions", "recent"],
    queryFn: () => commentService.getDiscussions(),
  });

  const comments = data?.data || [];

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading discussions..." className="h-64" />;
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Discussions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Conversations and task updates across your projects
        </p>
      </div>

      {comments.length === 0 ? (
        <EmptyState
          title="No discussions yet"
          description="Comments and discussions on tasks will appear in this unified feed."
          icon={<MessageSquare className="w-5 h-5 text-slate-400" />}
        />
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 hover:border-slate-300 transition-colors"
            >
              {/* Task reference line */}
              <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Task:
                  </span>
                  {comment.task ? (
                    <Link
                      to={`/tasks/${comment.task.id}`}
                      className="text-xs font-semibold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>{comment.task.title}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500">Unknown Task</span>
                  )}
                </div>

                {comment.task && (
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={comment.task.status} />
                    <PriorityBadge priority={comment.task.priority} />
                  </div>
                )}
              </div>

              {/* Author & Timestamp */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
                  {getInitials(comment.user?.name || "User")}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900">
                      {comment.user?.name || "User"}
                    </span>
                    {comment.user?.role === "ADMIN" && (
                      <span className="text-[10px] px-1 bg-slate-100 rounded text-slate-600 font-semibold">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formatRelative(comment.createdAt)}
                  </span>
                </div>
              </div>

              {/* Comment Content Preview */}
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-9">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
