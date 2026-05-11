import api from './client';

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    totalXp: number;
    createdAtUtc: string;
    emailConfirmed: boolean;
    role: string;
}

export const usersApi = {
    /** Get current user profile */
    getMe: async (): Promise<UserProfile> => {
        return await api.get('/api/users/me');
    },

    /** Update current user profile */
    updateMe: async (displayName: string): Promise<UserProfile> => {
        return await api.patch('/api/users/me', { displayName });
    },
};
