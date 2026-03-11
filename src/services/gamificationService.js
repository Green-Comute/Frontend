import apiRequest from './api.js';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {})
});

const adminRequest = async (endpoint, options = {}) => {
    import { ASSETS_BASE_URL } from '../config/api.config';
    const base = ASSETS_BASE_URL;
    const res = await fetch(`${base}${endpoint}`, { ...options, headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
};

/**
 * @fileoverview Gamification Service
 * @description Handles all Epic-4 API calls for gamification, rewards, and admin.
 * Follows the same pattern as tripService.js and rideService.js.
 * @module services/gamificationService
 */
export const gamificationService = {
    // ── User: Points & Tiers ─────────────────────────────────────────────────

    /** Story 4.2 — current balance */
    async getBalance() {
        return apiRequest('/gamification/balance');
    },

    /** Story 4.3 — paginated history */
    async getHistory(page = 1) {
        return apiRequest(`/gamification/history?page=${page}`);
    },

    /** Story 4.5 — tier progress */
    async getTierProgress() {
        return apiRequest('/gamification/tier-progress');
    },

    /** Story 4.7 — org-wide leaderboard */
    async getLeaderboard() {
        return apiRequest('/gamification/leaderboard');
    },

    /** Story 4.8 — dept leaderboard */
    async getDeptLeaderboard(dept) {
        return apiRequest(`/gamification/leaderboard/dept?dept=${encodeURIComponent(dept)}`);
    },

    /** Story 4.13 — opt-out toggle */
    async toggleOptOut() {
        return apiRequest('/gamification/opt-out', { method: 'PUT' });
    },

    // ── User: Rewards ────────────────────────────────────────────────────────

    /** Story 4.9 — rewards catalog */
    async getCatalog() {
        return apiRequest('/rewards/catalog');
    },

    /** Story 4.10 — atomic redemption */
    async redeemReward(rewardId) {
        return apiRequest('/rewards/redeem', {
            method: 'POST',
            body: JSON.stringify({ rewardId }),
        });
    },

    /** Story 4.15 — user's redemption history */
    async getMyRedemptions() {
        return apiRequest('/rewards/my-redemptions');
    },

    // ── ORG_ADMIN: Reward Items CRUD ─────────────────────────────────────────

    /** Story 4.11 */
    async listRewardItems() {
        return adminRequest('/org-admin/rewards/items');
    },
    async createRewardItem(data) {
        return adminRequest('/org-admin/rewards/items', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    async updateRewardItem(id, data) {
        return adminRequest(`/org-admin/rewards/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    async deactivateRewardItem(id) {
        return adminRequest(`/org-admin/rewards/items/${id}`, { method: 'DELETE' });
    },

    // ── ORG_ADMIN: Redemption Queue ──────────────────────────────────────────

    /** Story 4.12 */
    async listRedemptions(status = 'PENDING') {
        return adminRequest(`/org-admin/rewards/redemptions?status=${status}`);
    },
    async approveRedemption(id) {
        return adminRequest(`/org-admin/rewards/redemptions/${id}/approve`, { method: 'POST' });
    },
    async rejectRedemption(id, reason) {
        return adminRequest(`/org-admin/rewards/redemptions/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    },

    // ── ORG_ADMIN: Tier Config ───────────────────────────────────────────────

    /** Story 4.4 */
    async getOrgTiers() {
        return adminRequest('/org-admin/rewards/tiers');
    },
    async updateOrgTiers(tiers) {
        return adminRequest('/org-admin/rewards/tiers', {
            method: 'PUT',
            body: JSON.stringify({ tiers }),
        });
    },

    // ── PLATFORM_ADMIN: Point Rules ──────────────────────────────────────────

    /** Story 4.14 */
    async getPointRules() {
        return adminRequest('/platform/point-rules');
    },
    async updatePointRules(rules) {
        return adminRequest('/platform/point-rules', {
            method: 'PUT',
            body: JSON.stringify({ rules }),
        });
    },
};

export default gamificationService;
