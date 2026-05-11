import api from './client';

export interface Course {
    id: number;
    title: string;
    description: string;
    level: string;
    color: string;
    totalLessons: number;
}

export interface Lesson {
    id: number;
    courseId: number;
    chapter: string;
    title: string;
    description: string;
    task: string;
    initialCode: string;
    xp: number;
    isBoss: boolean;
    hasDebugger: boolean;
}

export const coursesApi = {
    getAllCourses: async (): Promise<Course[]> => {
        return await api.get('/api/courses');
    },

    getCourseById: async (id: number): Promise<Course> => {
        return await api.get(`/api/courses/${id}`);
    },

    getLessonsForCourse: async (courseId: number): Promise<Lesson[]> => {
        return await api.get(`/api/courses/${courseId}/lessons`);
    },

    getLessonById: async (id: number | string): Promise<Lesson> => {
        return await api.get(`/api/lessons/${id}`);
    },
};
