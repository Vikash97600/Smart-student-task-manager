import axios from 'axios';

// Use relative URL for Vite proxy in development
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor - helpful for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const serverMsg = error.response.data?.message || error.response.statusText;
      return Promise.reject({ 
        message: `Server error ${error.response.status}: ${serverMsg}`,
        status: error.response.status 
      });
    } else if (error.request) {
      return Promise.reject({ 
        message: 'Network error - server not responding. Is backend running? (cd backend && npm run dev)' 
      });
    } else {
      return Promise.reject({ message: error.message });
    }
  }
);

export const authService = {
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const taskService = {
  getTasks: async () => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getTask: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDashboardStats: async () => {
    try {
      const response = await api.get('/tasks/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const settingsService = {
  getAllSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getSummary: async () => {
    try {
      const response = await api.get('/settings/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  update: async (settingsData) => {
    try {
      const response = await api.put('/settings', settingsData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateField: async (category, field, value) => {
    try {
      const response = await api.put('/settings', { [`${category}.${field}`]: value });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  reset: async () => {
    try {
      const response = await api.delete('/settings/reset');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const notificationService = {
  getAll: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  create: async (payload) => {
    try {
      const response = await api.post('/notifications', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  markRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/user/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getStats: async () => {
    try {
      const response = await api.get('/user/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const reportService = {
  getReportBlob: async () => {
    try {
      console.log('[ReportService] Fetching report blob...');
      const response = await api.get('/report', {
        responseType: 'blob',
      });

      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('Empty PDF response from server');
      }

      console.log(`[ReportService] PDF blob received: ${blob.size} bytes`);

      const contentDisposition = response.headers['content-disposition'] || '';
      let filename = `progress-report-${Date.now()}.pdf`;
      const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, '').trim());
      }

      return { blob, filename, size: blob.size };
    } catch (error) {
      console.error('[ReportService] Blob fetch failed:', error);
      let msg = 'Failed to generate PDF';
      if (error.status) msg += ` (HTTP ${error.status})`;
      if (error.message) msg += `: ${error.message}`;
      throw { message: msg, originalError: error };
    }
  },

  downloadReport: async () => {
    try {
      const { blob, filename } = await reportService.getReportBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log(`[ReportService] Download triggered: ${filename}`);
      return filename;
    } catch (error) {
      console.error('[ReportService] Download failed:', error);
      throw error;
    }
  },

  getShareableReport: async () => {
    try {
      const response = await api.get('/report/share');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  generateReportBlob: async () => {
    try {
      const { blob } = await reportService.getReportBlob();
      return blob;
    } catch (error) {
      throw error;
    }
  }
};

export default api;

