// ============================================================
// وحدة الاتصال المركزية — Flexora API Gateway
// جميع الطلبات تمر عبر هذا الملف حصراً
// لتغيير النطاق عند الإطلاق، عدّل السطر الأول فقط:
// ============================================================

export const API_BASE_URL = 'https://elegant-playfulness-production-f153.up.railway.app';

import axios from 'axios';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// معترض الطلبات — إرفاق رمز المصادقة JWT تلقائياً
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flexora_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// معترض الاستجابات — معالجة أخطاء المصادقة المنتهية
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('flexora_auth_token');
      localStorage.removeItem('flexora_user_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
