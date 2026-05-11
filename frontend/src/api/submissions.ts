import api from './client';

export interface SubmitResult {
    passed: boolean;
    output: string;
    expected: string;
    error: string | null;
    failureReason: string | null;
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
    /** Submit code for synchronous execution and checking */
    submitCode: async (lessonId: number, code: string): Promise<SubmitResult> => {
        return await api.post(`/api/lessons/${lessonId}/submit`, { code });
    },

    /** Get status of an async submission job */
    getStatus: async (jobId: string): Promise<SubmissionStatus> => {
        return await api.get(`/api/submissions/${jobId}`);
    },
};
