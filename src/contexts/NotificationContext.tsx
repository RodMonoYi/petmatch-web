import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { NotificationItem } from '../types';
import { notificationsAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace('/api', '');
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const [notificationList, count] = await Promise.all([
        notificationsAPI.getAll({ limit: 20 }),
        notificationsAPI.getUnreadCount(),
      ]);
      setNotifications(notificationList);
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao carregar notificacoes:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    const socket: Socket = io(getSocketUrl(), {
      auth: {
        token,
      },
    });

    socket.on('notification:new', (notification: NotificationItem) => {
      setNotifications((currentNotifications) => {
        if (currentNotifications.some((item) => item.id === notification.id)) {
          return currentNotifications;
        }

        return [notification, ...currentNotifications].slice(0, 20);
      });

      toast(`${notification.titulo}: ${notification.mensagem}`);
    });

    socket.on('notification:unreadCount', (count: number) => {
      setUnreadCount(count);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  const markAsRead = async (id: string) => {
    const notification = notifications.find((item) => item.id === id);

    if (notification && !notification.lida) {
      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item.id === id
            ? { ...item, lida: true, lida_em: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((currentCount) => Math.max(currentCount - 1, 0));
    }

    try {
      const updatedNotification = await notificationsAPI.markAsRead(id);
      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item.id === id ? updatedNotification : item,
        ),
      );
    } catch (error) {
      console.error('Erro ao marcar notificacao como lida:', error);
      await refreshNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        lida: true,
        lida_em: notification.lida_em || new Date().toISOString(),
      })),
    );
    setUnreadCount(0);

    try {
      await notificationsAPI.markAllAsRead();
    } catch (error) {
      console.error('Erro ao marcar notificacoes como lidas:', error);
      await refreshNotifications();
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
