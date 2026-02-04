import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth helpers
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  verifyEmail: (data: { email: string; code: string }) =>
    api.post('/auth/verify-email', data),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  create: (data: any) => api.post('/profile', data),
  update: (data: any) => api.put('/profile', data),
  delete: () => api.delete('/profile'),
};

// Preferences API
export const preferencesAPI = {
  get: () => api.get('/preferences'),
  create: (data: any) => api.post('/preferences', data),
  update: (data: any) => api.put('/preferences', data),
};

// Meal Plan API
export const mealPlanAPI = {
  get: (date: string) => api.get(`/meal-plan?date=${date}`),
  create: (data: any) => api.post('/meal-plan', data),
  generate: (data: { date: string }) => api.post('/meal-plan/generate', data),
  swap: (data: any) => api.put('/meal-plan/swap', data),
  delete: (date: string) => api.delete(`/meal-plan?date=${date}`),
};

// Meals API
export const mealsAPI = {
  getAll: (filters?: { mealType?: string; dietType?: string }) => 
    api.get('/meal', { params: filters }),
  getOne: (id: string) => api.get(`/meal/${id}`),
};

// Subscription API
export const subscriptionAPI = {
  getStatus: () => api.get('/subscription/status'),
  create: (subscriptionID: string) => api.post('/subscription/create', { subscriptionID }),
  cancel: () => api.post('/subscription/cancel'),
};

export default api;