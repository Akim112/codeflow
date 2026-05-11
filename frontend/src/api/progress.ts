import api from './client';

export interface UserProgressSummary {
    totalXp: number;
    completedLessonsCount: number;
    completedLessonIds: number[];
    cleanStreak: number;
    fastBossKill: boolean;
}

export interface ProgressResult {
    lessonId: number;
    completedAtUtc: string;
    xpEarned: number;
    wasCleanRun: boolean;
}

export interface XpBalance {
    totalXp: number;
}

export const progressApi = {
    /** Get current user's progress summary */
    getMyProgress: async (): Promise<UserProgressSummary> => {
        return await api.get('/api/progress');
    },

    /** Mark a lesson as completed */
    completeLesson: async (lessonId: number, wasCleanRun: boolean): Promise<ProgressResult> => {
        return await api.post('/api/progress/complete', { lessonId, wasCleanRun });
    },

    /** Purchase a hint (costs XP) */
    purchaseHint: async (price: number): Promise<XpBalance> => {
        return await api.post('/api/progress/purchase-hint', { price });
    },

    /** Submit a moral choice */
    moralChoice: async (factionId: string, xpBonus: number, reputationBonus: number): Promise<XpBalance> => {
        return await api.post('/api/progress/moral-choice', { factionId, xpBonus, reputationBonus });
    },

    /** Reset all progress */
    resetProgress: async (): Promise<void> => {
        await api.post('/api/progress/reset');
    },
};
