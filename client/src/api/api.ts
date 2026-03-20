import axios from 'axios';

// ✅ YAHI FINAL HAI – ISKE AAGE KUCH NAHI
const api = axios.create({ 
  baseURL: 'https://backend-sk53.onrender.com/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
