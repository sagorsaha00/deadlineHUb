import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../utils/formatters";

interface LiveCountdownProps {
  deadline: string | Date;
  isCompleted?: boolean;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isPast: boolean;
}

function calculateTimeRemaining(deadlineDate: Date): TimeRemaining {
  const now = new Date().getTime();
  const target = deadlineDate.getTime();
  const diff = target - now;

  if (isNaN(diff)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isPast: true };
  }

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: diff,
      isPast: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: diff,
    isPast: false,
  };
}

export const LiveCountdown: React.FC<LiveCountdownProps> = ({
  deadline,
  isCompleted = false,
  className,
  showIcon = true,
  compact = false,
}) => {
  const targetDate = new Date(deadline);
  const isValidDate = !isNaN(targetDate.getTime());

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    isValidDate ? calculateTimeRemaining(targetDate) : { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isPast: true }
  );

  useEffect(() => {
    if (isCompleted || !isValidDate) return;

    // Recalculate immediately
    setTimeLeft(calculateTimeRemaining(targetDate));

    // Update every second
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [deadline, isCompleted, isValidDate]);

  if (!isValidDate) {
    return (
      <span className={cn("text-xs text-slate-400 inline-flex items-center gap-1", className)}>
        {showIcon && <Clock className="w-3.5 h-3.5" />}
        No deadline set
      </span>
    );
  }

  if (isCompleted) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60",
          className
        )}
      >
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        Completed
      </span>
    );
  }

  if (timeLeft.isPast) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200",
          className
        )}
      >
        {showIcon && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
        Expired
      </span>
    );
  }

  const hoursRemaining = timeLeft.totalMs / (1000 * 60 * 60);
  const isUrgent = hoursRemaining <= 1; // Under 1 hour
  const isWarning = hoursRemaining <= 24 && !isUrgent; // Under 24 hours

  const pad = (num: number) => String(num).padStart(2, "0");

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors",
          isUrgent && "bg-red-50 text-red-700 border border-red-200 animate-pulse",
          isWarning && "bg-amber-50 text-amber-700 border border-amber-200",
          !isUrgent && !isWarning && "bg-slate-100 text-slate-700 border border-slate-200",
          className
        )}
      >
        {showIcon && (
          isUrgent ? <AlertCircle className="w-3 h-3 text-red-600" /> :
          isWarning ? <AlertTriangle className="w-3 h-3 text-amber-600" /> :
          <Clock className="w-3 h-3 text-slate-500" />
        )}
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
        isUrgent && "bg-red-50 text-red-700 border-red-200 shadow-xs",
        isWarning && "bg-amber-50 text-amber-800 border-amber-200 shadow-xs",
        !isUrgent && !isWarning && "bg-slate-50 text-slate-700 border-slate-200",
        className
      )}
    >
      {showIcon && (
        isUrgent ? (
          <AlertCircle className="w-4 h-4 text-red-600 animate-bounce" />
        ) : isWarning ? (
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        ) : (
          <Clock className="w-4 h-4 text-slate-500" />
        )
      )}

      <div className="flex items-center gap-1 font-mono tracking-tight text-xs font-semibold">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-white/80 px-1 py-0.5 rounded border border-slate-200/50">
              {timeLeft.days}d
            </span>
            <span>:</span>
          </>
        )}
        <span className="bg-white/80 px-1 py-0.5 rounded border border-slate-200/50">
          {pad(timeLeft.hours)}h
        </span>
        <span>:</span>
        <span className="bg-white/80 px-1 py-0.5 rounded border border-slate-200/50">
          {pad(timeLeft.minutes)}m
        </span>
        <span>:</span>
        <span className="bg-white/80 px-1 py-0.5 rounded border border-slate-200/50">
          {pad(timeLeft.seconds)}s
        </span>
      </div>

      {isUrgent && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 bg-red-600 text-white rounded">
          Urgent
        </span>
      )}
      {isWarning && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 bg-amber-600 text-white rounded">
          Due Soon
        </span>
      )}
    </div>
  );
};
