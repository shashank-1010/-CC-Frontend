import axios from 'axios';

// Render pe API_URL environment variable se aayega
const API_URL = import.meta.env.VITE_API_URL || 'https://v2-xnv2.onrender.com/api';

const api = axios.create({ 
  baseURL: API_URL 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
