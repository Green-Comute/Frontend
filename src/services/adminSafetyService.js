import { apiRequest } from './api.js';

export const adminSafetyService = {
  // ── Incidents ─────────────────────────────────────────────────────────────
  getIncidents: (status = '', page = 1) => {
    const params = new URLSearchParams({ page });
    if (status) params.set('status', status);
    return apiRequest(`/admin/incidents?${params}`);
  },

  reviewIncident: (incidentId, action, note) =>
    apiRequest(`/admin/incidents/${incidentId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, note }),
    }),

  // ── Safety Guidelines ─────────────────────────────────────────────────────
  publishGuideline: (title, content) =>
    apiRequest('/admin/guidelines', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),

  getActiveGuideline: () => apiRequest('/admin/guidelines/active'),

  acceptGuideline: (guidelineId) =>
    apiRequest(`/admin/guidelines/${guidelineId}/accept`, { method: 'POST' }),

  checkAcceptance: () => apiRequest('/admin/guidelines/check-acceptance'),
};
