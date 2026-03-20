import axios from 'axios';

const API_URL = 'https://backend-sk53.onrender.com/api';  // ✅ नया URL + /api

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
