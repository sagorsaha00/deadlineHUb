import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "../../components/common/Modal";
import { taskService, userService } from "../../services/api";
import { Task, Priority, TaskStatus } from "../../types";
import { Loader2, ExternalLink, Calendar, Clock, UserCheck } from "lucide-react";

const jiraUrlRegex = /^(https?:\/\/[^\s]+)$/i;

const taskFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  jiraUrl: z
    .string()
    .trim()
    .refine((val) => !val || jiraUrlRegex.test(val), "Must be a valid HTTP or HTTPS URL")
    .optional()
    .or(z.literal("")),
  assignedName: z.string().min(1, "Assigned name is required"),
  assignedEmail: z.string().email("Valid assigned email is required"),
  deadlineDate: z.string().min(1, "Deadline date is required"),
  deadlineTime: z.string().min(1, "Deadline time is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]).optional(),
  description: z.string().optional().or(z.literal("")),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!taskToEdit;

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers(),
    enabled: isOpen,
  });

  const teamMembers = usersData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      priority: "MEDIUM",
      status: "TODO",
      deadlineTime: "17:00",
    },
  });

  useEffect(() => {
    if (taskToEdit && isOpen) {
      const d = new Date(taskToEdit.deadline);
      const dateStr = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
      const timeStr = !isNaN(d.getTime())
        ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
        : "17:00";

      reset({
        title: taskToEdit.title,
        jiraUrl: taskToEdit.jiraUrl || "",
        assignedName: taskToEdit.assignedName,
        assignedEmail: taskToEdit.assignedEmail,
        deadlineDate: dateStr,
        deadlineTime: timeStr,
        priority: taskToEdit.priority,
        status: taskToEdit.status,
        description: taskToEdit.description || "",
      });
    } else if (!taskToEdit && isOpen) {
      // Default to tomorrow 5 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      reset({
        title: "",
        jiraUrl: "",
        assignedName: "",
        assignedEmail: "",
        deadlineDate: dateStr,
        deadlineTime: "17:00",
        priority: "MEDIUM",
        status: "TODO",
        description: "",
      });
    }
  }, [taskToEdit, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const deadlineISO = new Date(`${data.deadlineDate}T${data.deadlineTime}:00`).toISOString();

      const payload = {
        title: data.title,
        jiraUrl: data.jiraUrl?.trim() || null,
        assignedName: data.assignedName,
        assignedEmail: data.assignedEmail,
        deadline: deadlineISO,
        priority: data.priority as Priority,
        status: data.status as TaskStatus,
        description: data.description?.trim() || null,
      };

      if (isEditing && taskToEdit) {
        return taskService.updateTask(taskToEdit.id, payload);
      } else {
        return taskService.createTask(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      queryClient.invalidateQueries({ queryKey: ["assigned-to-me"] });
      toast.success(isEditing ? "Task updated successfully" : "Task created and assigned");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save task");
    },
  });

  const onSubmit = (data: TaskFormData) => {
    mutation.mutate(data);
  };

  const handleSelectMember = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    if (!memberId) return;
    const member = teamMembers.find((m) => m.id === memberId);
    if (member) {
      setValue("assignedName", member.name);
      setValue("assignedEmail", member.email);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "Create New Task"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("title")}
            placeholder="e.g. Integrate SAML SSO Authentication"
            className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          {errors.title && (
            <p className="mt-1 text-[11px] text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Jira URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Jira Ticket URL <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
            <input
              type="url"
              {...register("jiraUrl")}
              placeholder="https://jira.company.com/browse/PROJ-101"
              className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
          {errors.jiraUrl && (
            <p className="mt-1 text-[11px] text-red-600">{errors.jiraUrl.message}</p>
          )}
        </div>

        {/* Assignee selection */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              Task Assignment
            </label>
            {teamMembers.length > 0 && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>Select from team:</span>
                <select
                  onChange={handleSelectMember}
                  defaultValue=""
                  className="px-2 py-0.5 text-[11px] border border-slate-200 rounded bg-white"
                >
                  <option value="" disabled>
                    Choose member...
                  </option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Assigned Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("assignedName")}
                placeholder="Sarah Jenkins"
                className="block w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              {errors.assignedName && (
                <p className="mt-0.5 text-[10px] text-red-600">
                  {errors.assignedName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Assigned Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("assignedEmail")}
                placeholder="sarah.jenkins@company.com"
                className="block w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              {errors.assignedEmail && (
                <p className="mt-0.5 text-[10px] text-red-600">
                  {errors.assignedEmail.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Deadline Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deadline Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <input
                type="date"
                {...register("deadlineDate")}
                className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              />
            </div>
            {errors.deadlineDate && (
              <p className="mt-1 text-[11px] text-red-600">
                {errors.deadlineDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deadline Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <input
                type="time"
                {...register("deadlineTime")}
                className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              />
            </div>
            {errors.deadlineTime && (
              <p className="mt-1 text-[11px] text-red-600">
                {errors.deadlineTime.message}
              </p>
            )}
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              {...register("priority")}
              className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                {...register("status")}
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Add context, acceptance criteria or notes..."
            className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
