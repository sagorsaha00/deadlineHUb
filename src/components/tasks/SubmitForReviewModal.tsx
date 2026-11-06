import React from "react";
import { Send, X, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface SubmitForReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  isLoading?: boolean;
}

export const SubmitForReviewModal: React.FC<SubmitForReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  isLoading = false,
}) => {
  if (!isOpen) return null;

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
        aria-labelledby="submit-review-title"
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 ml-0.5" />
            </div>
            <div>
              <h3
                id="submit-review-title"
                className="text-base font-semibold text-slate-900 tracking-tight"
              >
                Submit for Admin Review
              </h3>
              <p className="text-xs text-slate-500">
                Send your completed work for verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Task Summary Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Task to Submit
              </span>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                  In Progress
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                  In Review
                </span>
              </div>
            </div>
            <p className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug">
              {taskTitle}
            </p>
          </div>

          {/* Explanation */}
          <div className="space-y-2 text-slate-600 leading-relaxed">
            <p>
              Once submitted, the task status will change to{" "}
              <strong className="text-slate-900 font-semibold">IN_REVIEW</strong>.
              Your Administrator will receive an email and in-app notification to review
              your deliverable and either approve it or request changes.
            </p>
          </div>

          {/* Warning / Informational Alert */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-amber-900 text-[11px] leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              You will not be able to change the status yourself while the task is
              under review, but you can continue participating in the discussion comments.
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
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit for Review</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
