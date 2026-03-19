import axios from 'axios';

// ✅ HARDCODED BACKEND URL
const api = axios.create({ 
  baseURL: 'https://v2-xnv2.onrender.com'
});

// Request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.log('🔴 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
