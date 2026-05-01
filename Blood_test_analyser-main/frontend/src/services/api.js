import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry if it's already a login or refresh request
      if (originalRequest.url.includes('/api/auth/login') || originalRequest.url.includes('/api/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });

          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('refresh_token', response.data.refresh_token);

          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;

          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Don't reload, just reject so the app state can handle it
          return Promise.reject(err);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (email, password, fullName) =>
    api.post('/api/auth/signup', { email, password, full_name: fullName }),
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  refreshToken: (refreshToken) =>
    api.post('/api/auth/refresh', { refresh_token: refreshToken }),
  getCurrentUser: () => api.get('/api/auth/me'),
};

export const analyzeAPI = {
  analyze: (results, patientInfo) =>
    api.post('/api/analyze/analyze', { results, patient_info: patientInfo }),
  analyzeFile: (formData, age, gender) =>
    api.post(`/api/analyze/upload?age=${age}&gender=${gender}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Backwards-compatible alias: some frontend code calls `analyzePDF`
  analyzePDF: (formData, age, gender) =>
    api.post(`/api/analyze/upload?age=${age}&gender=${gender}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHistory: () => api.get('/api/analyze/history'),
  getAnalysis: (id) => api.get(`/api/analyze/history/${id}`),
  deleteAnalysis: (id) => api.delete(`/api/analyze/history/${id}`),
};

export function getErrorMessage(err, fallback = 'An unexpected error occurred') {
  return err?.response?.data?.detail || fallback;
}

export default api;
