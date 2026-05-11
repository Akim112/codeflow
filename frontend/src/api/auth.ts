import api from './client';

export function notifyAuthChange() {
    window.dispatchEvent(new Event('auth-changed'));
}

export const authApi = {
    register: async (email: string, password: string, displayName: string) => {
        const data = await api.post('/api/auth/register', { email, password, displayName });
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        notifyAuthChange();
        return data;
    },

    login: async (email: string, password: string) => {
        const data = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        notifyAuthChange();
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        notifyAuthChange();
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn: () => {
        const token = localStorage.getItem('token');
        return !!token && token !== 'undefined';
    },
};