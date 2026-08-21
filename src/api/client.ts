import axios from 'axios';

// Reads VITE_API_URL from .env (see .env.example) so local dev talks to your
// local API automatically, falling back to the deployed API for production
// builds where no env var is set. Previously this baseURL was hardcoded to
// the production Render URL, so the README had to instruct people to hand-edit
// this file just to run the app against a local backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://vesselops-api-6r42.onrender.com/api',
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
