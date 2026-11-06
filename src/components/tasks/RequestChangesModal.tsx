import React, { useState } from "react";
import { RotateCcw, X, AlertCircle, Loader2 } from "lucide-react";

interface RequestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  taskTitle: string;
  isLoading?: boolean;
}

export const RequestChangesModal: React.FC<RequestChangesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || isLoading) return;
    onConfirm(reason.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-changes-title"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3
                  id="request-changes-title"
                  className="text-base font-semibold text-slate-900 tracking-tight"
                >
                  Request Changes
                </h3>
                <p className="text-xs text-slate-500">
                  Return task to assignee for further updates
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Task Title
              </span>
              <p className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug">
                {taskTitle}
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reason-input"
                className="block font-semibold text-slate-800"
              >
                Feedback & Specific Changes Required:
              </label>
              <textarea
                id="reason-input"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain what needs to be revised or improved before this task can be approved..."
                disabled={isLoading}
                required
                className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-amber-900 text-[11px] leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                Status will return to <strong>IN_PROGRESS</strong>. The assignee will
                be notified by email and in-app alert with your notes.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!reason.trim() || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Send Changes Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
