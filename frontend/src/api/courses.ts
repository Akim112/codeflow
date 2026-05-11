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
    expectedOutput: string;
    xp: number;
    isBoss: boolean;
    hasDebugger: boolean;
    hint: string;
    hint2: string;
}

export const coursesApi = {
    /** Get all courses */
    getAllCourses: async (): Promise<Course[]> => {
        return await api.get('/api/courses');
    },

    /** Get a single course by ID */
    getCourseById: async (id: number): Promise<Course> => {
        return await api.get(`/api/courses/${id}`);
    },

    /** Get all lessons for a course */
    getLessonsForCourse: async (courseId: number): Promise<Lesson[]> => {
        return await api.get(`/api/courses/${courseId}/lessons`);
    },

    /** Get a single lesson by ID */
    getLessonById: async (id: number | string): Promise<Lesson> => {
        return await api.get(`/api/lessons/${id}`);
    },
};