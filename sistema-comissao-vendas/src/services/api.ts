import axios from 'axios';

//const baseURL = import.meta.env.VITE_API_BASE_URL;
const baseURL = 'http://localhost:8080';

const api = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
