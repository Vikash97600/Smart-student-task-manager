import axios from 'axios';

// Use relative URL for Vite proxy in development
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

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

export const cognitiveLoadService = {
  // Log new activity when starting a task
  logActivity: async (activityData) => {
    try {
      const response = await api.post('/activity/log', activityData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Complete activity when finishing a task
  completeActivity: async (activityId, data) => {
    try {
      const response = await api.post('/activity/complete', { activityId, ...data });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get current cognitive load
  getCognitiveLoad: async () => {
    try {
      const response = await api.get('/activity/load');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get activity history
  getActivityHistory: async (hours = 24) => {
    try {
      const response = await api.get(`/activity/history?hours=${hours}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Record a task switch
  recordTaskSwitch: async (activityId) => {
    try {
      const response = await api.post('/activity/switch', { activityId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Record user's response to suggestion
  recordSuggestionResponse: async (actionTaken) => {
    try {
      const response = await api.post('/activity/response', { actionTaken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user settings
  getSettings: async () => {
    try {
      const response = await api.get('/activity/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user settings
  updateSettings: async (settingsData) => {
    try {
      const response = await api.put('/activity/settings', settingsData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
