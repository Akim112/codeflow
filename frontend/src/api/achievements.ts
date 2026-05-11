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
    getAll: async (): Promise<AchievementDefinition[]> => {
        return await api.get('/api/achievements');
    },

    getMyAchievements: async (): Promise<UserAchievement[]> => {
        return await api.get('/api/achievements/me');
    },
};
