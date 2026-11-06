export type Role = "ADMIN" | "MEMBER";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "NEW_COMMENT"
  | "DEADLINE_REMINDER"
  | "TASK_OVERDUE"
  | "TASK_SUBMITTED_FOR_REVIEW"
  | "TASK_COMPLETED"
  | "TASK_REOPENED"
  | "TASK_REASSIGNED";

export interface Attachment {
  id: string;
  taskId: string;
  commentId?: string | null;
  uploaderId: string;
  publicId: string;
  secureUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  uploader?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string | null;
  createdAt: string;
  _count?: {
    tasksAssigned?: number;
    tasksCreated?: number;
    notifications?: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  jiraUrl?: string | null;
  assignedToId?: string | null;
  assignedName: string;
  assignedEmail: string;
  createdById: string;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  comments?: Comment[];
  activityLogs?: ActivityLog[];
  attachments?: Attachment[];
  _count?: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string | null;
  };
  attachments?: Attachment[];
  task?: {
    id: string;
    title: string;
    priority: Priority;
    status: TaskStatus;
    deadline: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  taskId?: string | null;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  task?: {
    id: string;
    title: string;
    priority: Priority;
    status: TaskStatus;
    deadline: string;
  } | null;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  activityType: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    title: string;
    priority: Priority;
    status: TaskStatus;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

export interface PaginatedTasks {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface TeamMemberProgress {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  totalAssigned: number;
  todo: number;
  inProgress: number;
  inReview: number;
  completed: number;
  overdue: number;
  completionPercentage: number;
}

export interface DashboardStats {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
  completedCount: number;
  overdueCount: number;
  remainingCount: number;
  completionProgress: number;
  deadlines: {
    dueToday: number;
    dueTomorrow: number;
    dueIn7Days: number;
    overdue: number;
    completed: number;
  };
  teamProgress?: TeamMemberProgress[];
}

