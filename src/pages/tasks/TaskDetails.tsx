import React, { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  taskService,
  commentService,
  activityService,
  attachmentService,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { TaskStatus, Comment, Attachment } from "../../types";
import { StatusBadge, PriorityBadge } from "../../components/common/Badge";
import { LiveCountdown } from "../../components/common/LiveCountdown";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { TaskModal } from "./TaskModal";
import { ImageLightboxModal } from "../../components/common/ImageLightboxModal";
import { SubmitForReviewModal } from "../../components/tasks/SubmitForReviewModal";
import { RequestChangesModal } from "../../components/tasks/RequestChangesModal";
import {
  ExternalLink,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Send,
  Trash2,
  Edit2,
  History,
  MessageSquare,
  CheckCircle,
  Paperclip,
  Image as ImageIcon,
  X,
  RotateCcw,
  Bell,
  Check,
} from "lucide-react";
import {
  formatDateTime,
  formatRelative,
  getInitials,
} from "../../utils/formatters";
import { toast } from "sonner";

export const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [requestChangesModalOpen, setRequestChangesModalOpen] = useState(false);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxFileName, setLightboxFileName] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Task
  const { data: taskData, isLoading: taskLoading, error: taskError } = useQuery({
    queryKey: ["task", id],
    queryFn: () => taskService.getTaskById(id!),
    enabled: !!id,
  });

  // Fetch Activity Log
  const { data: activityData } = useQuery({
    queryKey: ["activity", id],
    queryFn: () => activityService.getTaskActivity(id!),
    enabled: !!id,
  });

  const task = taskData?.data;
  const activities = activityData?.data || [];

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: (newStatus: TaskStatus) =>
      taskService.updateStatus(id!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Status updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  // Submit for Review Mutation
  const submitReviewMutation = useMutation({
    mutationFn: () => taskService.submitForReview(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setSubmitModalOpen(false);
      toast.success("Task submitted for Admin review!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit for review");
    },
  });

  // Admin Complete Task Mutation
  const completeTaskMutation = useMutation({
    mutationFn: () => taskService.completeTask(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task approved and marked COMPLETED!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to complete task");
    },
  });

  // Admin Request Changes Mutation
  const requestChangesMutation = useMutation({
    mutationFn: (reason: string) => taskService.requestChanges(id!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setRequestChangesModalOpen(false);
      toast.success("Changes requested and member notified.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to request changes");
    },
  });

  // Admin Send Reminder Mutation
  const sendReminderMutation = useMutation({
    mutationFn: () => taskService.sendReminder(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      toast.success("Deadline reminder sent successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send reminder");
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: () => taskService.deleteTask(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task deleted successfully");
      navigate("/tasks");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete task");
    },
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ content, attachmentIds }: { content: string; attachmentIds?: string[] }) =>
      commentService.addComment(id!, content, attachmentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      setCommentText("");
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Comment posted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add comment");
    },
  });

  // Update Comment Mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentService.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      setEditingCommentId(null);
      setEditingCommentText("");
      toast.success("Comment updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update comment");
    },
  });

  // Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      toast.success("Comment deleted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size cannot exceed 10MB");
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setFilePreview(previewUrl);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !selectedFile) return;

    let attachmentIds: string[] = [];

    if (selectedFile) {
      try {
        setIsUploadingFile(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("taskId", id!);

        const uploadRes = await attachmentService.upload(formData);
        if (uploadRes.data?.id) {
          attachmentIds.push(uploadRes.data.id);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to upload image attachment");
        setIsUploadingFile(false);
        return;
      } finally {
        setIsUploadingFile(false);
      }
    }

    addCommentMutation.mutate({
      content: commentText.trim() || (selectedFile ? `Shared attachment: ${selectedFile.name}` : ""),
      attachmentIds,
    });
  };

  const handleSaveEditComment = (commentId: string) => {
    if (!editingCommentText.trim()) return;
    updateCommentMutation.mutate({ commentId, content: editingCommentText });
  };

  const handleDeleteTask = () => {
    if (window.confirm("Are you sure you want to delete this task? This cannot be undone.")) {
      deleteTaskMutation.mutate();
    }
  };

  const handleRequestChangesPrompt = () => {
    const reason = prompt("Enter specific changes or feedback requested from assignee:");
    if (reason !== null) {
      requestChangesMutation.mutate(reason);
    }
  };

  if (taskLoading) {
    return <LoadingSpinner size="lg" label="Loading task details..." className="h-96" />;
  }

  if (taskError || !task) {
    return (
      <div className="text-center py-16">
        <h2 className="text-base font-semibold text-slate-900">Task Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This task doesn't exist or you don't have permission to view it.
        </p>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to tasks
        </Link>
      </div>
    );
  }

  const isAssigned =
    task.assignedToId === user?.id ||
    task.assignedEmail.toLowerCase() === user?.email.toLowerCase();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back navigation & admin actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Tasks
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => sendReminderMutation.mutate()}
                disabled={sendReminderMutation.isPending || task.status === "COMPLETED"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors cursor-pointer disabled:opacity-50"
                title="Send manual deadline email to assignee"
              >
                <Bell className="w-3.5 h-3.5" /> Remind Assignee
              </button>
              <button
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Task
              </button>
              <button
                onClick={handleDeleteTask}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Task Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {task.jiraUrl && (
                <a
                  href={task.jiraUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200/80 transition-colors"
                >
                  <span>Open in Jira</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
              {task.title}
            </h1>
          </div>

          {/* Live Countdown Display */}
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1">
            <span className="text-[11px] font-medium text-slate-400">Live Deadline Countdown</span>
            <LiveCountdown
              deadline={task.deadline}
              isCompleted={task.status === "COMPLETED"}
            />
          </div>
        </div>

        {/* Task Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-xs">
          {/* Status Controller with strict role-based options */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Status Action
            </span>
            <div>
              {isAdmin ? (
                <select
                  value={task.status}
                  onChange={(e) => statusMutation.mutate(e.target.value as TaskStatus)}
                  className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              ) : (
                /* Member Status Controller */
                <div className="flex items-center gap-1.5">
                  {task.status === "TODO" && isAssigned && (
                    <button
                      onClick={() => statusMutation.mutate("IN_PROGRESS")}
                      disabled={statusMutation.isPending}
                      className="w-full text-center px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Start (In Progress)
                    </button>
                  )}
                  {task.status === "IN_PROGRESS" && isAssigned && (
                    <button
                      onClick={() => setSubmitModalOpen(true)}
                      disabled={submitReviewMutation.isPending}
                      className="w-full text-center px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      Submit for Review
                    </button>
                  )}
                  {task.status === "IN_REVIEW" && (
                    <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded-lg block text-center w-full">
                      In Review
                    </span>
                  )}
                  {task.status === "COMPLETED" && (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg block text-center w-full">
                      Completed
                    </span>
                  )}
                  {!isAssigned && task.status !== "IN_REVIEW" && task.status !== "COMPLETED" && (
                    <span className="text-xs text-slate-500 italic px-2 py-1">View only</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Assigned To
            </span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-semibold">
                {getInitials(task.assignedName)}
              </div>
              <div className="truncate">
                <p className="font-semibold text-slate-900 truncate">{task.assignedName}</p>
                <p className="text-[10px] text-slate-400 truncate">{task.assignedEmail}</p>
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Target Deadline
            </span>
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDateTime(task.deadline)}</span>
            </div>
          </div>

          {/* Creator */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Created By
            </span>
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.createdBy?.name || "Admin"}</span>
            </div>
          </div>
        </div>

        {/* WORKFLOW ACTION BANNER: Modern, Intuitive & Role-Aware */}
        {/* State 1: Assignee working on IN_PROGRESS task */}
        {!isAdmin && isAssigned && task.status === "IN_PROGRESS" && (
          <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-slate-50 border border-indigo-200/80 rounded-xl p-4 sm:p-5 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Send className="w-5 h-5 ml-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    In Progress
                  </span>
                  <span className="text-xs font-bold text-slate-800">Ready for review?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Finished working? Send this task to Admin for review.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSubmitModalOpen(true)}
              disabled={submitReviewMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Review</span>
            </button>
          </div>
        )}

        {/* State 2: Assignee on TODO task */}
        {!isAdmin && isAssigned && task.status === "TODO" && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Task is waiting to be started</p>
                <p className="text-slate-500">Move this task to In Progress when you begin working.</p>
              </div>
            </div>
            <button
              onClick={() => statusMutation.mutate("IN_PROGRESS")}
              disabled={statusMutation.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Start Task (In Progress)</span>
            </button>
          </div>
        )}

        {/* State 3: Task in IN_REVIEW (Member view or Admin review controls) */}
        {task.status === "IN_REVIEW" && (
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-indigo-950">Submitted for Admin Review</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Awaiting Approval
                  </span>
                </div>
                <p className="text-indigo-800/80 text-[11px] leading-relaxed">
                  {isAdmin
                    ? "Assignee has submitted their work. Verify the deliverables and approve or request changes."
                    : "Your work is currently in the review queue. The administrator will inspect it and sign off or request changes."}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setRequestChangesModalOpen(true)}
                  disabled={requestChangesMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Changes</span>
                </button>
                <button
                  onClick={() => completeTaskMutation.mutate()}
                  disabled={completeTaskMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Complete</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* State 4: Task is COMPLETED */}
        {task.status === "COMPLETED" && (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 my-4 flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Task Completed & Approved</p>
              <p className="text-emerald-700/80 text-[11px]">
                This task has been verified and successfully closed by the administrator.
              </p>
            </div>
          </div>
        )}

        {/* Description Section */}
        <div className="pt-2">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
            Description & Context
          </h3>
          {task.description ? (
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No description provided for this task.</p>
          )}
        </div>
      </div>

      {/* Two Column Section: Discussion & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Discussion Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5" id="comments">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                Task Discussion ({task.comments?.length || 0})
              </h2>
            </div>

            {/* Comment Thread List */}
            <div className="space-y-4 mb-6">
              {task.comments?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">
                  No comments yet. Start the discussion below.
                </p>
              ) : (
                task.comments?.map((comment: Comment) => {
                  const isAuthor = comment.userId === user?.id;
                  const canEdit = isAuthor || isAdmin;
                  const isEditingThis = editingCommentId === comment.id;

                  return (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-semibold">
                            {getInitials(comment.user.name)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">
                              {comment.user.name}
                            </span>
                            {comment.user.role === "ADMIN" && (
                              <span className="ml-1 text-[10px] px-1 bg-slate-200 rounded font-bold text-slate-700">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <span>{formatRelative(comment.createdAt)}</span>
                          {canEdit && (
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditingCommentText(comment.content);
                                }}
                                className="hover:text-slate-700 p-0.5 cursor-pointer"
                                title="Edit comment"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("Delete this comment?")) {
                                    deleteCommentMutation.mutate(comment.id);
                                  }
                                }}
                                className="hover:text-red-600 p-0.5 cursor-pointer"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      {isEditingThis ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            rows={2}
                            className="w-full p-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditComment(comment.id)}
                              className="px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pl-8 space-y-2">
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>

                          {/* Render Attachments if present */}
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {comment.attachments.map((att: Attachment) => {
                                const isImage =
                                  att.mimeType.startsWith("image/") ||
                                  /\.(png|jpe?g|webp|gif)$/i.test(att.secureUrl);

                                return (
                                  <div
                                    key={att.id}
                                    className="group relative rounded-lg border border-slate-200 overflow-hidden bg-white hover:border-slate-400 transition-all cursor-pointer shadow-xs"
                                    onClick={() => {
                                      setLightboxImage(att.secureUrl);
                                      setLightboxFileName(att.fileName);
                                    }}
                                  >
                                    {isImage ? (
                                      <div className="w-32 h-24 overflow-hidden relative">
                                        <img
                                          src={att.secureUrl}
                                          alt={att.fileName}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-medium transition-opacity">
                                          Click to view
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-2.5 flex items-center gap-2 text-xs text-slate-700">
                                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate max-w-[120px]">{att.fileName}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment Input Form with Image Upload & Preview */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100">
              <div className="space-y-2.5">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment or status update..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none bg-white"
                />

                {/* Attached File Preview */}
                {filePreview && (
                  <div className="relative inline-block border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                    <img
                      src={filePreview}
                      alt="Upload preview"
                      className="w-24 h-20 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-1 right-1 p-0.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="p-1 bg-white text-[9px] text-slate-500 truncate max-w-[96px]">
                      {selectedFile?.name}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="hidden"
                      id="comment-file-upload"
                    />
                    <label
                      htmlFor="comment-file-upload"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                      title="Attach image or file"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{selectedFile ? "Change Image" : "Attach Image"}</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      addCommentMutation.isPending ||
                      isUploadingFile ||
                      (!commentText.trim() && !selectedFile)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    {isUploadingFile ? "Uploading..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (1 col): Activity Timeline */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              Activity Audit Log
            </h2>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No activity recorded yet</p>
            ) : (
              <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {activities.map((act) => (
                  <div key={act.id} className="relative text-xs">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                    <div>
                      <span className="font-semibold text-slate-900">{act.user.name}</span>
                      <p className="text-slate-600 mt-0.5 leading-snug">{act.description}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {formatDateTime(act.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Edit Modal (Admin only) */}
      {isAdmin && (
        <TaskModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          taskToEdit={task}
        />
      )}

      {/* Full Size Image Lightbox Modal */}
      <ImageLightboxModal
        imageUrl={lightboxImage}
        fileName={lightboxFileName}
        onClose={() => setLightboxImage(null)}
      />

      {/* Submit for Review Confirmation Modal */}
      <SubmitForReviewModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={() => submitReviewMutation.mutate()}
        taskTitle={task.title}
        isLoading={submitReviewMutation.isPending}
      />

      {/* Admin Request Changes Modal */}
      {isAdmin && (
        <RequestChangesModal
          isOpen={requestChangesModalOpen}
          onClose={() => setRequestChangesModalOpen(false)}
          onConfirm={(reason) => requestChangesMutation.mutate(reason)}
          taskTitle={task.title}
          isLoading={requestChangesMutation.isPending}
        />
      )}
    </div>
  );
};
