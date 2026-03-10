import { apiRequest, API_BASE_URL } from './api.js';

export const supportService = {
  /**
   * POST /support/tickets
   * If a File object is provided the request is sent as multipart/form-data;
   * otherwise as JSON (no attachment).
   */
  createTicket: async (issueType, message, file = null) => {
    if (file) {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('issueType', issueType);
      formData.append('message', message);
      formData.append('attachment', file);
      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create ticket');
      }
      return response.json();
    }
    return apiRequest('/support/tickets', {
      method: 'POST',
      body: JSON.stringify({ issueType, message }),
    });
  },

  getMyTickets: () => apiRequest('/support/tickets'),

  getTicket: (ticketId) => apiRequest(`/support/tickets/${ticketId}`),
};
