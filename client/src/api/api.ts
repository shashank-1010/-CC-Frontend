import axios from 'axios';

// ✅ Direct backend URL - /api mat lagao
const API_URL = 'https://v2-xnv2.onrender.com';

const api = axios.create({ 
  baseURL: API_URL 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
