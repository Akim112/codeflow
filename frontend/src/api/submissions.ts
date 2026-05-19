import api from './client';

export interface SubmitResult {
    passed: boolean;
    output: string;
    expected: string | null;
    error: string | null;
    failureReason: string | null;
    xpEarned: number | null;
    lessonCompleted: boolean;
    totalXp: number | null;
}

export interface SubmissionStatus {
    id: string;
    status: string;
    output: string | null;
    error: string | null;
    passed: boolean | null;
    createdAtUtc: string;
    completedAtUtc: string | null;
}

export const submissionsApi = {
    submitCode: async (lessonId: number, code: string, wasCleanRun = true): Promise<SubmitResult> => {
        return await api.post(`/api/lessons/${lessonId}/submit`, { code, wasCleanRun });
    },

    getStatus: async (jobId: string): Promise<SubmissionStatus> => {
        return await api.get(`/api/submissions/${jobId}`);
    },
};
