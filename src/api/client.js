import axios from 'axios';

// 🔥 UPDATE: Localhost අයින් කරලා Render Backend URL එක දැම්මා.
// Vercel එකේ Deploy කරද්දි මේ Link එක අනිවාර්යයි.
const BASE_URL = "https://dark-console-backend.onrender.com/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor to attach Token ---
// මේකෙන් Admin Log වෙලා ඉන්නකොට හැම Request එකකම Token එක යවනවා.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;