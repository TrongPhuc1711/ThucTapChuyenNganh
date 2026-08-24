import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  full: "max-w-[95vw]",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showClose = true,
  closeOnBackdrop = true,
}) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl ${sizes[size] || sizes.md} w-full max-h-[90vh] overflow-hidden animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-6 border-b border-coffee-50">
            {title && (
              <h3 className="font-heading text-lg font-bold text-coffee-800">
                {title}
              </h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors cursor-pointer ml-auto"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex gap-3 p-6 border-t border-coffee-50 bg-coffee-50/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
