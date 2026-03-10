import { apiRequest } from './api.js';

/** Epic-5 privacy/GPS/tutorial/account settings (separate from gamification opt-out). */
export const privacyService = {
  getSettings: () => apiRequest('/privacy/settings'),

  /** Accepted keys: hideProfile, hideRatings, hideTrips, womenOnlyPreference (booleans). */
  updateSettings: (updates) =>
    apiRequest('/privacy/settings', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  getGps: () => apiRequest('/privacy/gps'),

  setGps: (gpsEnabled) =>
    apiRequest('/privacy/gps', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: gpsEnabled }),  // backend reads req.body.enabled
    }),

  getTutorial: () => apiRequest('/privacy/tutorial'),

  completeTutorial: () =>
    apiRequest('/privacy/tutorial/complete', { method: 'POST' }),

  deleteAccount: (password) =>
    apiRequest('/privacy/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    }),
};
