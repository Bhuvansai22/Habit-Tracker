import axios from 'axios';

const api = axios.create({
    baseURL: 'https://habit-tracker-7rw1.onrender.com',
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('hf_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
