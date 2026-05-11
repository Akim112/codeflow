import api from './client';

export interface AchievementDefinition {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
}

export interface UserAchievement {
    achievementId: string;
    unlockedAtUtc: string;
}

export const achievementsApi = {
    /** Get all achievement definitions */
    getAll: async (): Promise<AchievementDefinition[]> => {
        return await api.get('/api/achievements');
    },

    /** Get achievements unlocked by current user */
    getMyAchievements: async (): Promise<UserAchievement[]> => {
        return await api.get('/api/achievements/me');
    },
};
