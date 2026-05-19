const BASE = '';

async function handleResponse(res: Response) {
    if (res.status === 401) {
        const hadToken = !!localStorage.getItem('token');
        if (hadToken) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth';
        }
        let msg = 'Unauthorized';
        try {
            const body = await res.json();
            msg = body.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
    }
    if (res.status === 204) return null;
    if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
            const body = await res.json();
            msg = body.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
    }
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
}

function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

const api = {
    get: async (endpoint: string) => {
        const res = await fetch(`${BASE}${endpoint}`, {
            headers: getHeaders(),
        });
        return handleResponse(res);
    },

    post: async (endpoint: string, body?: unknown) => {
        const res = await fetch(`${BASE}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        return handleResponse(res);
    },

    patch: async (endpoint: string, body?: unknown) => {
        const res = await fetch(`${BASE}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        return handleResponse(res);
    },

    delete: async (endpoint: string) => {
        const res = await fetch(`${BASE}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(res);
    },

    download: async (endpoint: string, filename: string) => {
        const res = await fetch(`${BASE}${endpoint}`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },
};

export default api;