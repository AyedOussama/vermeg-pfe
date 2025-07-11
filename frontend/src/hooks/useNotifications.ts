// ============================================================================
// USE NOTIFICATIONS HOOK - Advanced Notification Management System
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  category: 'system' | 'application' | 'interview' | 'message' | 'workflow';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  persistent: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export interface NotificationOptions {
  type?: Notification['type'];
  category?: Notification['category'];
  priority?: Notification['priority'];
  persistent?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  duration?: number; // Auto-dismiss duration in ms
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

// ============================================================================
// MOCK NOTIFICATIONS DATA
// ============================================================================

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    type: 'info',
    title: 'New Application Received',
    message: 'Sara Bouaziz has applied for Senior Frontend Developer position',
    category: 'application',
    priority: 'medium',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    persistent: true,
    actionUrl: '/rh/applications',
    actionLabel: 'Review Application',
    metadata: {
      applicationId: 'app-001',
      candidateName: 'Sara Bouaziz',
      jobTitle: 'Senior Frontend Developer'
    }
  },
  {
    id: 'notif-002',
    type: 'success',
    title: 'Interview Scheduled',
    message: 'Interview with Ahmed Khalil scheduled for tomorrow at 2:00 PM',
    category: 'interview',
    priority: 'high',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false,
    persistent: true,
    actionUrl: '/rh/interviews',
    actionLabel: 'View Interview',
    metadata: {
      interviewId: 'int-001',
      candidateName: 'Ahmed Khalil',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'notif-003',
    type: 'warning',
    title: 'Application Deadline Approaching',
    message: 'DevOps Engineer position closes in 3 days',
    category: 'workflow',
    priority: 'medium',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true,
    persistent: false,
    actionUrl: '/project-leader/jobs',
    actionLabel: 'View Job',
    metadata: {
      jobId: 'job-002',
      jobTitle: 'DevOps Engineer',
      daysRemaining: 3
    }
  }
];

// ============================================================================
// NOTIFICATION STORAGE UTILITIES
// ============================================================================

const STORAGE_KEY = 'app_notifications';
const SETTINGS_KEY = 'notification_settings';

const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      // Filter out expired notifications
      const now = new Date();
      return notifications.filter((notif: Notification) => 
        !notif.expiresAt || new Date(notif.expiresAt) > now
      );
    }
  } catch (error) {
    console.error('Error loading notifications from storage:', error);
  }
  return [...MOCK_NOTIFICATIONS];
};

const saveNotificationsToStorage = (notifications: Notification[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications to storage:', error);
  }
};

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true
  });

  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ========================================
  // INITIALIZATION
  // ========================================

  useEffect(() => {
    const loadNotifications = () => {
      const notifications = loadNotificationsFromStorage();
      const unreadCount = notifications.filter(n => !n.read).length;
      
      setState({
        notifications,
        unreadCount,
        isLoading: false
      });
    };

    loadNotifications();
  }, []);

  // ========================================
  // NOTIFICATION MANAGEMENT
  // ========================================

  const addNotification = useCallback((
    title: string,
    message: string,
    options: NotificationOptions = {}
  ): string => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      id,
      type: options.type || 'info',
      title,
      message,
      category: options.category || 'system',
      priority: options.priority || 'medium',
      timestamp: new Date().toISOString(),
      read: false,
      persistent: options.persistent || false,
      actionUrl: options.actionUrl,
      actionLabel: options.actionLabel,
      metadata: options.metadata,
      expiresAt: options.duration ? 
        new Date(Date.now() + options.duration).toISOString() : undefined
    };

    setState(prev => {
      const newNotifications = [notification, ...prev.notifications];
      saveNotificationsToStorage(newNotifications);
      
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: prev.unreadCount + 1
      };
    });

    // Show toast notification
    const toastOptions = {
      position: 'top-right' as const,
      autoClose: options.duration || (options.persistent ? false : 5000),
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    };

    switch (notification.type) {
      case 'success':
        toast.success(`${title}: ${message}`, toastOptions);
        break;
      case 'error':
        toast.error(`${title}: ${message}`, toastOptions);
        break;
      case 'warning':
        toast.warn(`${title}: ${message}`, toastOptions);
        break;
      default:
        toast.info(`${title}: ${message}`, toastOptions);
    }

    // Auto-dismiss non-persistent notifications
    if (!options.persistent && options.duration) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, options.duration);
      
      timeoutRefs.current.set(id, timeout);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    setState(prev => {
      const newNotifications = prev.notifications.filter(n => n.id !== id);
      saveNotificationsToStorage(newNotifications);
      
      const removedNotification = prev.notifications.find(n => n.id === id);
      const unreadCountDelta = removedNotification && !removedNotification.read ? -1 : 0;
      
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: Math.max(0, prev.unreadCount + unreadCountDelta)
      };
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setState(prev => {
      const newNotifications = prev.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      saveNotificationsToStorage(newNotifications);
      
      const notification = prev.notifications.find(n => n.id === id);
      const unreadCountDelta = notification && !notification.read ? -1 : 0;
      
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: Math.max(0, prev.unreadCount + unreadCountDelta)
      };
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setState(prev => {
      const newNotifications = prev.notifications.map(n => ({ ...n, read: true }));
      saveNotificationsToStorage(newNotifications);
      
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: 0
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();

    setState(prev => {
      saveNotificationsToStorage([]);
      return {
        ...prev,
        notifications: [],
        unreadCount: 0
      };
    });
  }, []);

  // ========================================
  // CONVENIENCE METHODS
  // ========================================

  const notifySuccess = useCallback((title: string, message: string, options?: Omit<NotificationOptions, 'type'>) => {
    return addNotification(title, message, { ...options, type: 'success' });
  }, [addNotification]);

  const notifyError = useCallback((title: string, message: string, options?: Omit<NotificationOptions, 'type'>) => {
    return addNotification(title, message, { ...options, type: 'error' });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, message: string, options?: Omit<NotificationOptions, 'type'>) => {
    return addNotification(title, message, { ...options, type: 'warning' });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message: string, options?: Omit<NotificationOptions, 'type'>) => {
    return addNotification(title, message, { ...options, type: 'info' });
  }, [addNotification]);

  // ========================================
  // FILTERING & QUERYING
  // ========================================

  const getNotificationsByCategory = useCallback((category: Notification['category']) => {
    return state.notifications.filter(n => n.category === category);
  }, [state.notifications]);

  const getNotificationsByPriority = useCallback((priority: Notification['priority']) => {
    return state.notifications.filter(n => n.priority === priority);
  }, [state.notifications]);

  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(n => !n.read);
  }, [state.notifications]);

  // ========================================
  // CLEANUP
  // ========================================

  useEffect(() => {
    return () => {
      // Cleanup all timeouts on unmount
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  // ========================================
  // RETURN INTERFACE
  // ========================================

  return {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    
    // Core methods
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    dismiss: removeNotification, // Alias for compatibility
    
    // Convenience methods
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    
    // Query methods
    getNotificationsByCategory,
    getNotificationsByPriority,
    getUnreadNotifications
  };
};

export default useNotifications;
