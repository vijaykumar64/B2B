import { api } from './api';
import { AppNotification } from '../types';

export const createNotification = async (notification: Omit<AppNotification, 'id' | 'read'>): Promise<string | undefined> => {
  try {
    const data = await api.post('/notifications', notification);
    return data.notification?.id;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    await api.patch(`/notifications/${id}`, { read: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

export const markAllNotificationsAsRead = async (userId: string, _notifications: AppNotification[]): Promise<void> => {
  try {
    await api.post('/notifications/mark-all-read', {});
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};
