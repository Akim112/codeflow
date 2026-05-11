import api from './client';

export interface Notification {
    id: string;
    type: string;
    title: string;
    body: string | null;
    createdAtUtc: string;
    isRead: boolean;
}

export const notificationsApi = {
    /** Get current user's notifications */
    getNotifications: async (unreadOnly: boolean = false, limit: number = 50): Promise<Notification[]> => {
        const params = new URLSearchParams();
        if (unreadOnly) params.set('unreadOnly', 'true');
        if (limit !== 50) params.set('limit', String(limit));
        const query = params.toString();
        return await api.get(`/api/notifications${query ? '?' + query : ''}`);
    },

    /** Mark a single notification as read */
    markRead: async (id: string): Promise<void> => {
        await api.patch(`/api/notifications/${id}/read`);
    },

    /** Mark all notifications as read */
    markAllRead: async (): Promise<void> => {
        await api.post('/api/notifications/read-all');
    },
};
