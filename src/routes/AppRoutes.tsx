import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

// Auth Pages
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { ResetPassword } from "../pages/auth/ResetPassword";

// Dashboard & Tasks Pages
import { Dashboard } from "../pages/dashboard/Dashboard";
import { AllTasks } from "../pages/tasks/AllTasks";
import { TaskDetails } from "../pages/tasks/TaskDetails";
import { AssignedToMe } from "../pages/tasks/AssignedToMe";
import { Deadlines } from "../pages/deadlines/Deadlines";
import { Discussions } from "../pages/discussions/Discussions";
import { Notifications } from "../pages/notifications/Notifications";
import { Settings } from "../pages/settings/Settings";
import { TeamMembers } from "../pages/team/TeamMembers";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Checking authentication..." className="h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-screen" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPassword />
          </PublicOnlyRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<AllTasks />} />
        <Route path="/tasks/:id" element={<TaskDetails />} />
        <Route path="/assigned-to-me" element={<AssignedToMe />} />
        <Route path="/deadlines" element={<Deadlines />} />
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/team" element={<TeamMembers />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
