import ApiClient, { ApiRequestParam } from "../api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SAVINGS_REMINDER' | 'LOAN_APPROVAL' | 'REPAYMENT_DUE' | 'GROUP_UPDATE' | 'DONOR_REPORT';
  read: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NotificationResponse {
  data: Notification[];
  unreadCount: number;
}

export default class NotificationService {
  // Get user notifications
  async getNotifications(params?: ApiRequestParam): Promise<NotificationResponse> {
    return await ApiClient.getJson<NotificationResponse>('/notifications', params);
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<{ count: number }> {
    return await ApiClient.getJson<{ count: number }>('/notifications/unread-count');
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    return await ApiClient.patchJson<Notification>(`/notifications/${id}/read`, {});
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ count: number }> {
    return await ApiClient.patchJson<{ count: number }>('/notifications/mark-all-read', {});
  }

  // Create a new notification (admin only)
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: Notification['type'];
  }): Promise<Notification> {
    return await ApiClient.postJson<Notification>('/notifications', data);
  }

  // Delete a notification
  async deleteNotification(id: string): Promise<{ message: string }> {
    await ApiClient.delete(`/notifications/${id}`);
    return { message: 'Notification deleted successfully' };
  }

  // Get recent notifications (limit 10)
  async getRecentNotifications(): Promise<NotificationResponse> {
    return this.getNotifications({ limit: 10, offset: 0 });
  }

  // Get unread notifications only
  async getUnreadNotifications(): Promise<NotificationResponse> {
    return this.getNotifications({ read: false });
  }
}
