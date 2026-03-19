import axios from 'axios';

const api = axios.create({ 
  baseURL: 'https://v2-xnv2.onrender.com'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.log('API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;
