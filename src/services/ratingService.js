import { apiRequest } from './api.js';

export const ratingService = {
  /** GET /ratings/user/:userId — average rating for any user */
  getUserRating: (userId) =>
    apiRequest(`/ratings/user/${userId}`),

  /**
   * POST /ratings/driver — passenger rates the driver after a trip.
   * targetUserId is the driver's userId (required by backend).
   */
  rateDriver: (tripId, targetUserId, stars, comment = '') =>
    apiRequest('/ratings/driver', {
      method: 'POST',
      body: JSON.stringify({ tripId, targetUserId, stars, comment }),
    }),

  /**
   * POST /ratings/passenger — driver rates a passenger after a trip.
   * targetUserId is the passenger's userId.
   */
  ratePassenger: (tripId, targetUserId, stars, comment = '') =>
    apiRequest('/ratings/passenger', {
      method: 'POST',
      body: JSON.stringify({ tripId, targetUserId, stars, comment }),
    }),
};
