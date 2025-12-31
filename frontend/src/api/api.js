import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (username, password) => api.post('/auth/register', { username, password }),
    login: (username, password) => api.post('/auth/login', { username, password }),
    getMe: () => api.get('/auth/me'),
    uploadPhoto: (formData) => api.post('/auth/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Groups API
export const groupsAPI = {
    create: (name) => api.post('/groups/create', { name }),
    join: (inviteCode) => api.post('/groups/join', { inviteCode }),
    getMyGroups: () => api.get('/groups/my-groups'),
    getGroup: (id) => api.get(`/groups/${id}`)
};

// Messages API
export const messagesAPI = {
    send: (receiverId, groupId, messageText) => api.post('/messages/send', { receiverId, groupId, messageText }),
    getInbox: () => api.get('/messages/inbox')
};

export default api;
