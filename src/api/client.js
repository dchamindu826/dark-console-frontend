import axios from 'axios';

// 🔥 CHANGE 1: VPS Domain එක මෙතනට දාන්න.
// Backend එකේ routes පටන් ගන්නේ '/api' වලින් නම් අගට '/api' දාන්න.
const BASE_URL = "https://api.dark-console.com/api"; 

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔥 CHANGE 2: Cookies/Sessions වැඩ කරන්න මේක ඕන.
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor to attach Token ---
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