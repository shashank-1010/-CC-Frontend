import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-sk53.onrender.com';

const api = axios.create({ 
  baseURL: API_URL + '/api'   // ✅ YEH KARO – /api auto add ho jayega
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

export default api;
