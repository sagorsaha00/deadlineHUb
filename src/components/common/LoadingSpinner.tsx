import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/formatters";

export const LoadingSpinner: React.FC<{
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}> = ({ className, size = "md", label }) => {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 text-slate-500", className)}>
      <Loader2 className={cn("animate-spin text-slate-700", sizeMap[size])} />
      {label && <p className="mt-2 text-xs font-medium text-slate-500">{label}</p>}
    </div>
  );
};
