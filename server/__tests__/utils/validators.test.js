/**
 * Validators Utility Tests
 * Tests for Zod validation schemas used across the application
 */

const {
  RegisterInputSchema,
  LoginInputSchema,
  UpdateProfileInputSchema,
} = require('../../utils/validators');

describe('Validation Schemas', () => {
  describe('RegisterInputSchema', () => {
    test('should validate correct registration input', () => {
      const validInput = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = RegisterInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should require name field', () => {
      const invalidInput = {
        email: 'john@example.com',
        password: 'password123',
      };

      expect(() => RegisterInputSchema.parse(invalidInput)).toThrow();
    });

    test('should require email field', () => {
      const invalidInput = {
        name: 'John Doe',
        password: 'password123',
      };

      expect(() => RegisterInputSchema.parse(invalidInput)).toThrow();
    });

    test('should require password field', () => {
      const invalidInput = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      expect(() => RegisterInputSchema.parse(invalidInput)).toThrow();
    });

    test('should validate email format', () => {
      const invalidInput = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      expect(() => RegisterInputSchema.parse(invalidInput)).toThrow(/email/i);
    });

    test('should validate minimum password length', () => {
      const invalidInput = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123', // Too short
      };

      expect(() => RegisterInputSchema.parse(invalidInput)).toThrow(/password/i);
    });

    test('should validate minimum name length', () => {
      const invalidInput = {
        name: 'A', // Too short
        email: 'john@example.com',
        password: 'password123',
      };

      expect(() => RegisterInputSchema.parse(invalidInput)).toThrow(/name/i);
    });

    test('should trim whitespace from fields', () => {
      const inputWithWhitespace = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        password: '  password123  ',
      };

      const result = RegisterInputSchema.parse(inputWithWhitespace);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.password).toBe('password123');
    });
  });

  describe('LoginInputSchema', () => {
    test('should validate correct login input', () => {
      const validInput = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = LoginInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should require email field', () => {
      const invalidInput = {
        password: 'password123',
      };

      expect(() => LoginInputSchema.parse(invalidInput)).toThrow();
    });

    test('should require password field', () => {
      const invalidInput = {
        email: 'john@example.com',
      };

      expect(() => LoginInputSchema.parse(invalidInput)).toThrow();
    });

    test('should validate email format', () => {
      const invalidInput = {
        email: 'invalid-email',
        password: 'password123',
      };

      expect(() => LoginInputSchema.parse(invalidInput)).toThrow(/email/i);
    });

    test('should validate minimum password length', () => {
      const invalidInput = {
        email: 'john@example.com',
        password: '123', // Too short
      };

      expect(() => LoginInputSchema.parse(invalidInput)).toThrow(/password/i);
    });
  });

  describe('UpdateProfileInputSchema', () => {
    test('should validate correct profile update input', () => {
      const validInput = {
        name: 'John Doe Updated',
        imageUrl: 'https://example.com/avatar.jpg',
        address: '123 Updated Street',
        dob: '1990-01-01T00:00:00.000Z',
      };

      const result = UpdateProfileInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should allow partial updates', () => {
      const partialInput = {
        name: 'John Doe Updated',
      };

      const result = UpdateProfileInputSchema.parse(partialInput);
      expect(result.name).toBe('John Doe Updated');
    });

    test('should allow empty input (all fields optional)', () => {
      const emptyInput = {};

      const result = UpdateProfileInputSchema.parse(emptyInput);
      expect(result).toEqual({});
    });

    test('should validate name minimum length when provided', () => {
      const invalidInput = {
        name: 'A', // Too short
      };

      expect(() => UpdateProfileInputSchema.parse(invalidInput)).toThrow(/name/i);
    });

    test('should validate imageUrl format when provided', () => {
      const invalidInput = {
        imageUrl: 'not-a-url',
      };

      expect(() => UpdateProfileInputSchema.parse(invalidInput)).toThrow(/url/i);
    });

    test('should validate date format when provided', () => {
      const invalidInput = {
        dob: 'invalid-date',
      };

      expect(() => UpdateProfileInputSchema.parse(invalidInput)).toThrow(/date/i);
    });

    test('should trim whitespace from string fields', () => {
      const inputWithWhitespace = {
        name: '  John Doe Updated  ',
        address: '  123 Updated Street  ',
      };

      const result = UpdateProfileInputSchema.parse(inputWithWhitespace);
      expect(result.name).toBe('John Doe Updated');
      expect(result.address).toBe('123 Updated Street');
    });

    test('should handle null values for optional fields', () => {
      const inputWithNulls = {
        name: 'John Doe',
        imageUrl: null,
        address: null,
        dob: null,
      };

      const result = UpdateProfileInputSchema.parse(inputWithNulls);
      expect(result.name).toBe('John Doe');
      expect(result.imageUrl).toBeNull();
      expect(result.address).toBeNull();
      expect(result.dob).toBeNull();
    });
  });

  describe('Error Messages', () => {
    test('should provide meaningful error messages', () => {
      const invalidInput = {
        name: '',
        email: 'invalid',
        password: '123',
      };

      try {
        RegisterInputSchema.parse(invalidInput);
      } catch (error) {
        expect(error.issues).toBeDefined();
        expect(error.issues.length).toBeGreaterThan(0);
        expect(error.issues.some((issue) => issue.path.includes('email'))).toBe(true);
        expect(error.issues.some((issue) => issue.path.includes('password'))).toBe(true);
      }
    });
  });
});
