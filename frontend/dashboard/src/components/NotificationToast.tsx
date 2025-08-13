import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { useThemeClasses } from '../contexts/ThemeContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  toast,
  onDismiss,
}) => {
  const themeClasses = useThemeClasses();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'info':
        return <Info size={20} className="text-blue-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-500';
      case 'info':
        return 'border-l-blue-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
    }
  };

  return (
    <div
      className={`
        ${themeClasses.card} ${themeClasses.shadow} 
        border-l-4 ${getBorderColor()}
        p-4 mb-2 rounded-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${themeClasses.textPrimary}`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className={`ml-2 flex-shrink-0 ${themeClasses.textSecondary} hover:${themeClasses.textPrimary} transition-colors`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Container de notificações
interface NotificationContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-w-sm">
      {toasts.map((toast) => (
        <NotificationToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default NotificationToast;
