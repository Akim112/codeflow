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

export interface PurchaseHintResponse {
    totalXp: number;
    hintLevel: number;
    hintText: string;
}

export const progressApi = {
    getMyProgress: async (): Promise<UserProgressSummary> => {
        return await api.get('/api/progress');
    },

    purchaseHint: async (lessonId: number, hintLevel: 1 | 2): Promise<PurchaseHintResponse> => {
        return await api.post('/api/progress/purchase-hint', { lessonId, hintLevel });
    },

    moralChoice: async (factionId: string, lessonId: number): Promise<XpBalance> => {
        return await api.post('/api/progress/moral-choice', { factionId, lessonId });
    },

    resetProgress: async (): Promise<void> => {
        await api.post('/api/progress/reset');
    },
};
