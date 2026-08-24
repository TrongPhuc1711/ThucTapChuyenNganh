import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: "bg-success-light border-success/20 text-success",
  error: "bg-danger-light border-danger/20 text-danger",
  warning: "bg-warning-light border-warning/20 text-warning",
  info: "bg-info-light border-info/20 text-info",
};

function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] || ICONS.info;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
        animate-slide-right
        ${STYLES[toast.type] || STYLES.info}
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    {
      success: (msg, duration) => addToast(msg, "success", duration),
      error: (msg, duration) => addToast(msg, "error", duration),
      warning: (msg, duration) => addToast(msg, "warning", duration),
      info: (msg, duration) => addToast(msg, "info", duration),
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback nếu không có ToastProvider
    return {
      success: (msg) => console.log("✅", msg),
      error: (msg) => console.error("❌", msg),
      warning: (msg) => console.warn("⚠️", msg),
      info: (msg) => console.info("ℹ️", msg),
    };
  }
  return context;
}
