import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getToken, isAuthenticated, logout } from './auth';

describe('Auth Utility Functions', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    global.localStorage = localStorageMock;
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getToken', () => {
    it('should retrieve token from localStorage', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      localStorageMock.getItem.mockReturnValue(mockToken);

      const token = getToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
      expect(token).toBe(mockToken);
    });

    it('should return null if no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const token = getToken();

      expect(token).toBeNull();
    });

    it('should call localStorage.getItem with correct key', () => {
      getToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      localStorageMock.getItem.mockReturnValue('valid-token');

      const result = isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false if token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false for empty string token', () => {
      localStorageMock.getItem.mockReturnValue('');

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return true for any truthy token value', () => {
      localStorageMock.getItem.mockReturnValue('any-token-value');

      const result = isAuthenticated();

      expect(result).toBe(true);
    });
  });

  describe('logout', () => {
    it('should remove token from localStorage', () => {
      // Mock window.location
      delete window.location;
      window.location = { href: '' };

      logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should redirect to login page', () => {
      // Mock window.location
      delete window.location;
      window.location = { href: '' };

      logout();

      expect(window.location.href).toBe('/login');
    });

    it('should call removeItem before redirect', () => {
      delete window.location;
      window.location = { href: '' };

      const callOrder = [];
      
      localStorageMock.removeItem.mockImplementation(() => {
        callOrder.push('removeItem');
      });

      Object.defineProperty(window.location, 'href', {
        set: () => {
          callOrder.push('redirect');
        },
        get: () => '',
      });

      logout();

      expect(callOrder[0]).toBe('removeItem');
    });

    it('should only remove authToken, not clear all localStorage', () => {
      delete window.location;
      window.location = { href: '' };

      logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.clear).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete auth flow', () => {
      // User logs in - token is set
      localStorageMock.getItem.mockReturnValue('new-auth-token');
      expect(isAuthenticated()).toBe(true);
      expect(getToken()).toBe('new-auth-token');

      // User logs out
      delete window.location;
      window.location = { href: '' };
      localStorageMock.getItem.mockReturnValue(null);

      logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(isAuthenticated()).toBe(false);
    });
  });
});
