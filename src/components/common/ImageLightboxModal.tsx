import React, { useEffect } from "react";
import { X, ExternalLink, Download } from "lucide-react";

interface ImageLightboxModalProps {
  imageUrl: string | null;
  fileName?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageUrl,
  fileName,
  onClose,
}) => {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (imageUrl) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="absolute -top-12 right-0 flex items-center gap-3 text-white">
          {fileName && (
            <span className="text-xs text-slate-300 font-mono truncate max-w-xs">
              {fileName}
            </span>
          )}
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Open original"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full Image */}
        <img
          src={imageUrl}
          alt={fileName || "Attachment full preview"}
          className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl border border-white/10"
        />
      </div>
    </div>
  );
};
