import axios from 'axios';

// ✅ DIRECT HARDCORE – कोई environment नहीं, कोई variable नहीं
const api = axios.create({ 
  baseURL: 'https://backend-sk53.onrender.com/api'   // ← यही final hai
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log('🌐 Final URL:', config.baseURL + config.url);
  return config;
});

export default api;
