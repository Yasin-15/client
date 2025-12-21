import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
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
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    updateDetails: (data) => api.put('/auth/updatedetails', data),
    updatePassword: (data) => api.put('/auth/updatepassword', data)
};

// Election API
export const electionAPI = {
    getAll: () => api.get('/elections'),
    getActive: () => api.get('/elections/active'),
    getById: (id) => api.get(`/elections/${id}`),
    create: (data) => api.post('/elections', data),
    update: (id, data) => api.put(`/elections/${id}`, data),
    delete: (id) => api.delete(`/elections/${id}`),
    publishResults: (id) => api.put(`/elections/${id}/publish-results`)
};

// Candidate API
export const candidateAPI = {
    getAll: (electionId) => api.get('/candidates', { params: { election: electionId } }),
    getById: (id) => api.get(`/candidates/${id}`),
    create: (data) => api.post('/candidates', data),
    update: (id, data) => api.put(`/candidates/${id}`, data),
    delete: (id) => api.delete(`/candidates/${id}`),
    approve: (id) => api.put(`/candidates/${id}/approve`)
};

// Vote API
export const voteAPI = {
    castVote: (data) => api.post('/votes', data),
    checkVoted: (electionId) => api.get(`/votes/check/${electionId}`),
    getResults: (electionId) => api.get(`/votes/results/${electionId}`),
    getLiveResults: (electionId) => api.get(`/votes/live-results/${electionId}`),
    verifyVote: (token) => api.get(`/votes/verify/${token}`)
};

// Admin API
export const adminAPI = {
    getUsers: () => api.get('/admin/users'),
    verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
    suspendUser: (id) => api.put(`/admin/users/${id}/suspend`),
    activateUser: (id) => api.put(`/admin/users/${id}/activate`),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    getStats: () => api.get('/admin/stats'),
    getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data) => api.put('/admin/settings', data)
};

export default api;
