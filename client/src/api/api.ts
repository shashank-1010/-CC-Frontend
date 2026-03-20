import axios from 'axios';

// ✅ Pehle environment variable se try karo, nahi to hardcoded URL
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-sk53.onrender.com';

const api = axios.create({ 
  baseURL: API_URL 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
