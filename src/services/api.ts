import axios from "axios";
import {
  ApiResponse,
  User,
  Task,
  PaginatedTasks,
  Comment,
  Notification,
  ActivityLog,
  Attachment,
  DashboardStats,
} from "../types";

const baseURL = import.meta.env.VITE_API_URL || "https://deadlinebackend-five.vercel.app/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("deadlinehub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired or invalid session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register") ||
        window.location.pathname.startsWith("/forgot-password") ||
        window.location.pathname.startsWith("/reset-password");

      if (!isAuthPage) {
        localStorage.removeItem("deadlinehub_token");
        localStorage.removeItem("deadlinehub_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials: any) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>("/auth/login", credentials);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>("/auth/register", data);
    return res.data;
  },
  logout: async () => {
    const res = await api.post<ApiResponse<null>>("/auth/logout");
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data;
  },
  forgotPassword: async (data: { email: string }) => {
    const res = await api.post<ApiResponse<any>>("/auth/forgot-password", data);
    return res.data;
  },
  resetPassword: async (data: any) => {
    const res = await api.post<ApiResponse<null>>("/auth/reset-password", data);
    return res.data;
  },
  changePassword: async (data: any) => {
    const res = await api.patch<ApiResponse<null>>("/auth/change-password", data);
    return res.data;
  },
};

// Users Services
export const userService = {
  getUsers: async () => {
    const res = await api.get<ApiResponse<User[]>>("/users");
    return res.data;
  },
  updateProfile: async (data: { name?: string; avatarUrl?: string }) => {
    const res = await api.patch<ApiResponse<User>>("/users/profile", data);
    return res.data;
  },
};

// Tasks Services
export const taskService = {
  getDashboardStats: async () => {
    const res = await api.get<ApiResponse<DashboardStats>>("/tasks/dashboard-stats");
    return res.data;
  },
  getTasks: async (params?: Record<string, any>) => {
    const res = await api.get<ApiResponse<PaginatedTasks>>("/tasks", { params });
    return res.data;
  },
  getAssignedToMe: async () => {
    const res = await api.get<ApiResponse<Task[]>>("/tasks/assigned-to-me");
    return res.data;
  },
  getUpcomingDeadlines: async () => {
    const res = await api.get<ApiResponse<Task[]>>("/tasks/upcoming-deadlines");
    return res.data;
  },
  getDueToday: async () => {
    const res = await api.get<ApiResponse<Task[]>>("/tasks/due-today");
    return res.data;
  },
  getOverdueTasks: async () => {
    const res = await api.get<ApiResponse<Task[]>>("/tasks/overdue");
    return res.data;
  },
  getTaskById: async (id: string) => {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data;
  },
  createTask: async (data: any) => {
    const res = await api.post<ApiResponse<Task>>("/tasks", data);
    return res.data;
  },
  updateTask: async (id: string, data: any) => {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return res.data;
  },
  submitForReview: async (id: string) => {
    const res = await api.post<ApiResponse<Task>>(`/tasks/${id}/submit-review`);
    return res.data;
  },
  completeTask: async (id: string) => {
    const res = await api.post<ApiResponse<Task>>(`/tasks/${id}/complete`);
    return res.data;
  },
  requestChanges: async (id: string, reason?: string) => {
    const res = await api.post<ApiResponse<Task>>(`/tasks/${id}/request-changes`, { reason });
    return res.data;
  },
  sendReminder: async (id: string) => {
    const res = await api.post<ApiResponse<null>>(`/tasks/${id}/remind`);
    return res.data;
  },
  deleteTask: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/tasks/${id}`);
    return res.data;
  },
};

// Comments Services
export const commentService = {
  getTaskComments: async (taskId: string) => {
    const res = await api.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`);
    return res.data;
  },
  addComment: async (taskId: string, content: string, attachmentIds?: string[]) => {
    const res = await api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { content, attachmentIds });
    return res.data;
  },
  updateComment: async (id: string, content: string) => {
    const res = await api.patch<ApiResponse<Comment>>(`/comments/${id}`, { content });
    return res.data;
  },
  deleteComment: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/comments/${id}`);
    return res.data;
  },
  getDiscussions: async () => {
    const res = await api.get<ApiResponse<Comment[]>>("/comments/recent");
    return res.data;
  },
};

// Attachments Services
export const attachmentService = {
  upload: async (formData: FormData) => {
    const res = await api.post<ApiResponse<Attachment>>("/attachments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  getTaskAttachments: async (taskId: string) => {
    const res = await api.get<ApiResponse<Attachment[]>>(`/attachments/task/${taskId}`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/attachments/${id}`);
    return res.data;
  },
};

// AI Assistant Services
export const aiService = {
  chat: async (message: string, messages?: { role: string; content: string }[]) => {
    const res = await api.post<ApiResponse<{ reply: string; model: string }>>("/ai/chat", {
      message,
      messages,
    });
    return res.data;
  },
};

// Notifications Services
export const notificationService = {
  getNotifications: async (unreadOnly = false) => {
    const res = await api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>(
      "/notifications",
      { params: { unreadOnly } }
    );
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch<ApiResponse<null>>("/notifications/read-all");
    return res.data;
  },
  deleteNotification: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/notifications/${id}`);
    return res.data;
  },
};

// Activity Services
export const activityService = {
  getTaskActivity: async (taskId: string) => {
    const res = await api.get<ApiResponse<ActivityLog[]>>(`/activity/task/${taskId}`);
    return res.data;
  },
  getRecentActivity: async () => {
    const res = await api.get<ApiResponse<ActivityLog[]>>("/activity/recent");
    return res.data;
  },
};
