/**
 * @fileoverview Passkey Service Tests
 * @description Unit tests for registerPasskey() and loginWithPasskey() functions.
 * Mocks global fetch and @simplewebauthn/browser functions.
 */

import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock @simplewebauthn/browser BEFORE importing the module under test
vi.mock('@simplewebauthn/browser', () => ({
    startRegistration: vi.fn(),
    startAuthentication: vi.fn(),
}));

import { registerPasskey, loginWithPasskey } from './passkeyService';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// ── Setup / Teardown ────────────────────────────────────────────────────
beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
    localStorage.setItem('authToken', 'test-jwt-token');
});

afterEach(() => {
    vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════
// registerPasskey
// ═══════════════════════════════════════════════════════════════════════
describe('registerPasskey', () => {
    test('returns error when server fails to generate options', async () => {
        fetch.mockImplementationOnce(() =>
            Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'User not found' }) })
        );

        const result = await registerPasskey();
        expect(result.success).toBe(false);
        expect(result.message).toBe('User not found');
    });

    test('returns error when user cancels the browser prompt', async () => {
        fetch.mockReset();
        // Step 1: options request succeeds
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ challenge: 'abc123', rp: { name: 'GreenCommute' } }),
            })
        );

        // Step 2: browser prompt throws (user cancelled)
        startRegistration.mockRejectedValueOnce(new Error('User cancelled'));

        const result = await registerPasskey();
        expect(result.success).toBe(false);
        expect(result.message).toBe('User cancelled');
    });

    test('returns success when full registration flow succeeds', async () => {
        fetch.mockReset();

        // Step 1: options
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ challenge: 'abc123' }),
            })
        );

        // Step 2: browser prompt succeeds
        startRegistration.mockResolvedValueOnce({ id: 'cred-id', response: {} });

        // Step 3: verify succeeds
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ verified: true, message: 'Passkey registered!' }),
            })
        );

        const result = await registerPasskey();
        expect(result.success).toBe(true);
        expect(result.message).toContain('Passkey registered');
    });
});

// ═══════════════════════════════════════════════════════════════════════
// loginWithPasskey
// ═══════════════════════════════════════════════════════════════════════
describe('loginWithPasskey', () => {
    test('returns error when no passkey exists for email', async () => {
        fetch.mockReset();
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'No passkeys registered for this account' }),
            })
        );

        const result = await loginWithPasskey('nobody@example.com');
        expect(result.success).toBe(false);
        expect(result.message).toMatch(/no passkey/i);
    });

    test('returns error when user cancels the browser prompt', async () => {
        fetch.mockReset();
        // Step 1: login options succeed
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        userId: 'user123',
                        challenge: 'xyz',
                        allowCredentials: [{ id: 'cred1' }],
                    }),
            })
        );

        // Step 2: browser prompt throws
        startAuthentication.mockRejectedValueOnce(new Error('User cancelled'));

        const result = await loginWithPasskey('user@example.com');
        expect(result.success).toBe(false);
        expect(result.message).toBe('User cancelled');
    });

    test('stores token and returns user on success', async () => {
        fetch.mockReset();
        localStorage.removeItem('authToken'); // start clean

        // Step 1: login options
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        userId: 'user123',
                        challenge: 'xyz',
                        allowCredentials: [{ id: 'cred1' }],
                    }),
            })
        );

        // Step 2: browser prompt succeeds
        startAuthentication.mockResolvedValueOnce({ id: 'cred1', response: {} });

        // Step 3: verify succeeds with JWT
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        token: 'new-jwt-token',
                        user: { id: 'user123', email: 'user@example.com', role: 'EMPLOYEE' },
                    }),
            })
        );

        const result = await loginWithPasskey('user@example.com');
        expect(result.success).toBe(true);
        expect(result.data.token).toBe('new-jwt-token');
        expect(result.data.user.email).toBe('user@example.com');
        expect(localStorage.getItem('authToken')).toBe('new-jwt-token');
    });
});
