import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.pumppal.io';
const API_VERSION = 'v1';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/${API_VERSION}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  // Generic API methods
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // Authentication methods
  async login(walletAddress, signature) {
    return this.post('/auth/login', { walletAddress, signature });
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async refreshToken() {
    return this.post('/auth/refresh');
  }

  // User management
  async getUserProfile() {
    return this.get('/user/profile');
  }

  async updateUserProfile(profileData) {
    return this.put('/user/profile', profileData);
  }

  // ICO Project methods
  async getICOProjects(params = {}) {
    return this.get('/icos', params);
  }

  async getICOProject(projectId) {
    return this.get(`/icos/${projectId}`);
  }

  async createICOProject(projectData) {
    return this.post('/icos', projectData);
  }

  async updateICOProject(projectId, projectData) {
    return this.put(`/icos/${projectId}`, projectData);
  }

  async deleteICOProject(projectId) {
    return this.delete(`/icos/${projectId}`);
  }

  async deployICOContract(projectId, contractData) {
    return this.post(`/icos/${projectId}/deploy`, contractData);
  }

  async finalizeICO(projectId) {
    return this.post(`/icos/${projectId}/finalize`);
  }

  async cancelICO(projectId) {
    return this.post(`/icos/${projectId}/cancel`);
  }

  // Investor methods
  async getInvestors(projectId, params = {}) {
    return this.get(`/icos/${projectId}/investors`, params);
  }

  async getInvestor(projectId, investorId) {
    return this.get(`/icos/${projectId}/investors/${investorId}`);
  }

  async addInvestor(projectId, investorData) {
    return this.post(`/icos/${projectId}/investors`, investorData);
  }

  async updateInvestor(projectId, investorId, investorData) {
    return this.put(`/icos/${projectId}/investors/${investorId}`, investorData);
  }

  // Contribution methods
  async getContributions(projectId, params = {}) {
    return this.get(`/icos/${projectId}/contributions`, params);
  }

  async recordContribution(projectId, contributionData) {
    return this.post(`/icos/${projectId}/contributions`, contributionData);
  }

  async getContributionHistory(walletAddress) {
    return this.get(`/contributions/history/${walletAddress}`);
  }

  // Analytics methods
  async getICOAnalytics(projectId, timeframe = '7d') {
    return this.get(`/icos/${projectId}/analytics`, { timeframe });
  }

  async getFundraisingChart(projectId, timeframe = '7d') {
    return this.get(`/icos/${projectId}/chart`, { timeframe });
  }

  async getInvestorAnalytics(projectId) {
    return this.get(`/icos/${projectId}/investor-analytics`);
  }

  async getTierBreakdown(projectId) {
    return this.get(`/icos/${projectId}/tier-breakdown`);
  }

  // Staking methods
  async getStakingTiers() {
    return this.get('/staking/tiers');
  }

  async getStakingRewards(walletAddress) {
    return this.get(`/staking/rewards/${walletAddress}`);
  }

  async claimStakingRewards(walletAddress) {
    return this.post(`/staking/rewards/${walletAddress}/claim`);
  }

  // Transaction methods
  async getTransactions(params = {}) {
    return this.get('/transactions', params);
  }

  async getTransaction(transactionHash) {
    return this.get(`/transactions/${transactionHash}`);
  }

  async recordTransaction(transactionData) {
    return this.post('/transactions', transactionData);
  }

  // Notification methods
  async getNotifications() {
    return this.get('/notifications');
  }

  async markNotificationAsRead(notificationId) {
    return this.put(`/notifications/${notificationId}/read`);
  }

  async getNotificationSettings() {
    return this.get('/notifications/settings');
  }

  async updateNotificationSettings(settings) {
    return this.put('/notifications/settings', settings);
  }

  // File upload methods
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await this.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Error handling
  handleApiError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        type: 'API_ERROR',
        status,
        message: data.message || 'An API error occurred',
        details: data.details || null,
        code: data.code || null
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        type: 'NETWORK_ERROR',
        message: 'Network error - please check your connection',
        details: error.message
      };
    } else {
      // Something else happened
      return {
        type: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        details: error
      };
    }
  }

  // Utility methods
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
