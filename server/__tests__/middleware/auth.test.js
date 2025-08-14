/**
 * Authentication Middleware Tests
 * Tests for JWT authentication and authorization middleware
 */

const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Set up test environment
    process.env.JWT_SECRET = 'test-secret-key';

    // Mock request, response, and next function
    req = {
      get: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid Token', () => {
    test('should authenticate user with valid token', () => {
      const userId = 'user123';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      req.get.mockReturnValue(`Bearer ${token}`);

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(true);
      expect(req.userId).toBe(userId);
      expect(next).toHaveBeenCalledWith();
    });

    test('should handle token without Bearer prefix', () => {
      const userId = 'user123';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      req.get.mockReturnValue(token);

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(false);
      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Invalid Token', () => {
    test('should handle missing Authorization header', () => {
      req.get.mockReturnValue(null);

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(false);
      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    test('should handle empty Authorization header', () => {
      req.get.mockReturnValue('');

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(false);
      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    test('should handle malformed token', () => {
      req.get.mockReturnValue('Bearer invalid-token');

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(false);
      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    test('should handle expired token', () => {
      const userId = 'user123';
      const expiredToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }, // Already expired
      );

      req.get.mockReturnValue(`Bearer ${expiredToken}`);

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(false);
      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    test('should handle token with wrong secret', () => {
      const userId = 'user123';
      const token = jwt.sign({ userId }, 'wrong-secret');

      req.get.mockReturnValue(`Bearer ${token}`);

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(false);
      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    test('should handle empty token after Bearer', () => {
      req.get.mockReturnValue('Bearer ');

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(false);
      expect(req.userId).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Edge Cases', () => {
    test('should handle token with extra spaces', () => {
      const userId = 'user123';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      req.get.mockReturnValue(`  Bearer   ${token}  `);

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(false); // Because split(' ')[1] won't work with extra spaces
      expect(next).toHaveBeenCalledWith();
    });

    test('should handle case-sensitive Bearer keyword', () => {
      const userId = 'user123';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      req.get.mockReturnValue(`bearer ${token}`); // lowercase

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(false);
      expect(next).toHaveBeenCalledWith();
    });

    test('should not throw error when JWT_SECRET is missing', () => {
      delete process.env.JWT_SECRET;

      const userId = 'user123';
      const token = jwt.sign({ userId }, 'any-secret');

      req.get.mockReturnValue(`Bearer ${token}`);

      expect(() => {
        authMiddleware(req, res, next);
      }).not.toThrow();

      expect(req.isAuth).toBe(false);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Integration with Real JWT', () => {
    test('should work with real JWT lifecycle', () => {
      const userId = 'user123';
      const payload = { userId, role: 'USER' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      req.get.mockReturnValue(`Bearer ${token}`);

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(true);
      expect(req.userId).toBe(userId);
      expect(next).toHaveBeenCalledWith();
    });

    test('should extract additional payload data', () => {
      const payload = { userId: 'user123', role: 'ADMIN', email: 'admin@example.com' };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      req.get.mockReturnValue(`Bearer ${token}`);

      authMiddleware(req, res, next);

      expect(req.isAuth).toBe(true);
      expect(req.userId).toBe('user123');
      // Note: Current middleware only extracts userId,
      // but could be extended to extract role, email, etc.
    });
  });
});
