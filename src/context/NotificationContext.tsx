import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  HelpCircle,
} from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface NotificationContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  showConfirm: (options: ConfirmDialogOptions) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, durationMs);
  }, []);

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  }, []);

  // Safe window.alert fallback in iframe environment to prevent native SecurityError
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      showToast(String(msg || ''), 'info', 4500);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleConfirm = () => {
    if (confirmDialog) {
      confirmDialog.onConfirm();
      setConfirmDialog(null);
    }
  };

  const handleCancel = () => {
    if (confirmDialog) {
      if (confirmDialog.onCancel) confirmDialog.onCancel();
      setConfirmDialog(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* 1. Global Toast Stack */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const bgClass = isSuccess
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-100/50'
            : isError
            ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-100/50'
            : isWarning
            ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-amber-100/50'
            : 'bg-blue-50 border-blue-300 text-blue-900 shadow-blue-100/50';

          const icon = isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : isError ? (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
          );

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-3 text-xs sm:text-sm font-medium transition-all duration-300 animate-in slide-in-from-top-3 ${bgClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 leading-relaxed break-words">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-700 p-0.5 transition-colors"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 2. Global Modal Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 font-serif">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmDialog.isDanger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}
              >
                {confirmDialog.isDanger ? (
                  <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                ) : (
                  <HelpCircle className="w-6 h-6 stroke-[2.2]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {confirmDialog.title || (confirmDialog.isDanger ? 'Xác nhận hành động' : 'Xác nhận')}
                </h3>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                {confirmDialog.cancelText || 'Hủy bỏ'}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                  confirmDialog.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#1976D2] hover:bg-blue-700'
                }`}
              >
                {confirmDialog.confirmText || 'Đồng ý thực hiện'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
