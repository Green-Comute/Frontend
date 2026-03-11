import { apiRequest } from './api.js';

export const safetyService = {
  // ── Block / Unblock ───────────────────────────────────────────────────────
  blockUser: (blockedId) =>
    apiRequest('/safety/block', {
      method: 'POST',
      body: JSON.stringify({ blockedId }),
    }),

  unblockUser: (blockedId) =>
    apiRequest(`/safety/block/${blockedId}`, { method: 'DELETE' }),

  getBlockedUsers: () => apiRequest('/safety/block'),

  // ── Emergency Contacts ────────────────────────────────────────────────────
  addContact: (name, phone, relationship) =>
    apiRequest('/safety/emergency-contacts', {
      method: 'POST',
      body: JSON.stringify({ name, phone, relationship }),
    }),

  getContacts: () => apiRequest('/safety/emergency-contacts'),

  removeContact: (contactId) =>
    apiRequest(`/safety/emergency-contacts/${contactId}`, { method: 'DELETE' }),

  // ── Incident Reporting ────────────────────────────────────────────────────
  reportIncident: (tripId, description) =>
    apiRequest('/safety/incidents', {
      method: 'POST',
      body: JSON.stringify({ tripId, description }),
    }),

  // ── Women-Only Filter ─────────────────────────────────────────────────────
  womenOnlyFilter: (tripIds) =>
    apiRequest('/safety/women-only/filter', {
      method: 'POST',
      body: JSON.stringify({ tripIds }),
    }),

  // ── Trip Sharing ──────────────────────────────────────────────────────────
  createShareLink: (tripId) => apiRequest(`/trip/share/${tripId}`),

  /** Public — no auth needed; apiRequest sends token only if present, which is harmless */
  trackSharedTrip: (token) => apiRequest(`/trip/track/${token}`),
};
