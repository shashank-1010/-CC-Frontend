import axios from 'axios';

// ✅ YEH SAHI HONA CHAHIYE (backend URL)
const API_URL = 'https://backend-sk53.onrender.com';

const api = axios.create({ 
  baseURL: API_URL 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
