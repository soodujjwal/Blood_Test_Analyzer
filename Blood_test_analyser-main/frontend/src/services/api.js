import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
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
          window.location.reload();
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
  analyzePDF: (formData) =>
    api.post('/api/analyze/upload-pdf', formData, {
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
