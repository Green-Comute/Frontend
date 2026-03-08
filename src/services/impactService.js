/**
 * @fileoverview Impact & ESG API Service
 * @description Covers lifetime user impact, per-trip ESG modal, org ESG dashboard,
 * platform global stats, and top commute partners.
 * @module services/impactService
 */

import apiRequest from './api';

export const impactService = {
  /**
   * GET /impact/lifetime
   * Driver lifetime cumulative ESG stats.
   */
  async getLifetimeImpact() {
    return apiRequest('/impact/lifetime');
  },

  /**
   * GET /impact/trips/:id
   * Per-trip ESG breakdown for a single completed trip.
   */
  async getTripImpact(tripId) {
    return apiRequest(`/impact/trips/${tripId}`);
  },

  /**
   * GET /esg-admin/dashboard
   * Org-level ESG totals + per-fuel-type breakdown (ORG_ADMIN only).
   */
  async getOrgEsgDashboard() {
    return apiRequest('/esg-admin/dashboard');
  },

  /**
   * GET /esg-admin/global
   * Platform-wide global ESG totals + top organisations (PLATFORM_ADMIN only).
   */
  async getGlobalEsgStats() {
    return apiRequest('/esg-admin/global');
  },

  /**
   * GET /esg-admin/commute-partners
   * Top commute partners for the authenticated driver.
   */
  async getCommutePartners(limit = 5) {
    return apiRequest(`/esg-admin/commute-partners?limit=${limit}`);
  },
};
