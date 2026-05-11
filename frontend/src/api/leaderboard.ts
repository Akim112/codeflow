import api from './client';

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    totalXp: number;
}

export const leaderboardApi = {
    getLeaderboard: async (limit: number = 50): Promise<LeaderboardEntry[]> => {
        return await api.get(`/api/leaderboard?limit=${limit}`);
    },
};
