import { useState } from 'react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter panel flex items-start gap-3 p-4 shadow-lg ${
            toast.type === 'error'
              ? 'border-accent-red/30'
              : toast.type === 'success'
              ? 'border-accent-green/30'
              : 'border-accent-amber/30'
          }`}
        >
          <span className="text-lg mt-0.5">
            {toast.type === 'error' ? '✕' : toast.type === 'success' ? '✓' : '⚠'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{toast.title}</p>
            {toast.message && (
              <p className="text-xs text-text-muted mt-1">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-text-muted hover:text-text-primary transition-colors text-sm"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Toast hook
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message = '', type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
