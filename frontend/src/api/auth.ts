import api from './client';

export const authApi = {
    register: async (email: string, password: string, displayName: string) => {
        const data = await api.post('/api/auth/register', { email, password, displayName });
        // ВАЖНО: берем accessToken, а не token
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    login: async (email: string, password: string) => {
        const data = await api.post('/api/auth/login', { email, password });
        // ВАЖНО: берем accessToken, а не token
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn: () => {
        // Проверяем, что токен существует и он не равен строке "undefined"
        const token = localStorage.getItem('token');
        return !!token && token !== 'undefined';
    },
};