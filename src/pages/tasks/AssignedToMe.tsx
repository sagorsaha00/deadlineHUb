import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../services/api";
import { TaskStatus } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { TaskCard } from "../../components/tasks/TaskCard";
import { toast } from "sonner";

export const AssignedToMe: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", "assigned-to-me"],
    queryFn: () => taskService.getAssignedToMe(),
  });

  const tasks = data?.data || [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task status updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading your assigned tasks..." className="h-64" />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Assigned to Me
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tasks and deadlines assigned specifically to your account
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks assigned to you"
          description="You currently don't have any tasks assigned. New assignments will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
