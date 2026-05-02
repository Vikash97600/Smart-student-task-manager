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
    // Handle error responses
    if (error.response) {
      // Server responded with error status
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      // Something else went wrong
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
  // Get all user settings (full nested object)
  getAllSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get flattened settings summary for UI components
  getSummary: async () => {
    try {
      const response = await api.get('/settings/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user settings (supports nested updates)
  update: async (settingsData) => {
    try {
      const response = await api.put('/settings', settingsData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update specific nested field
  updateField: async (category, field, value) => {
    try {
      const response = await api.put('/settings', { [`${category}.${field}`]: value });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset all settings to defaults
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

export default api;
