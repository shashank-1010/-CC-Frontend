import axios from 'axios';

// ✅ HARDCODE KARO - DIRECT BACKEND URL
const api = axios.create({ 
  baseURL: 'https://v2-xnv2.onrender.com'  // /api MAT LAGANA
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
