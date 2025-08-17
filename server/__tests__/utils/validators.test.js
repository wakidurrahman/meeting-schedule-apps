/**
 * Validators Tests
 * Comprehensive tests for all Zod validation schemas
 * Tests User CRUD validation, edge cases, and error handling
 */

const {
  RegisterInputSchema,
  LoginInputSchema,
  MeetingInputSchema,
  UpdateProfileInputSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema,
  EventInputSchema,
} = require('../../utils/validators');
const { USER_ROLE } = require('../../constants/const');

describe('Validation Schemas', () => {
  describe('RegisterInputSchema', () => {
    test('should validate correct registration input', () => {
      const validInput = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const result = RegisterInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should trim whitespace from name', () => {
      const input = {
        name: '  John Doe  ',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const result = RegisterInputSchema.parse(input);
      expect(result.name).toBe('John Doe');
    });

    test('should reject empty name', () => {
      const input = {
        name: '',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      expect(() => RegisterInputSchema.parse(input)).toThrow();
    });

    test('should reject name that is too short', () => {
      const input = {
        name: 'J',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      expect(() => RegisterInputSchema.parse(input)).toThrow();
    });

    test('should reject name that is too long', () => {
      const input = {
        name: 'J'.repeat(51),
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      expect(() => RegisterInputSchema.parse(input)).toThrow();
    });

    test('should reject name with invalid characters', () => {
      const input = {
        name: 'John123',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      expect(() => RegisterInputSchema.parse(input)).toThrow();
    });

    test('should accept name with valid special characters', () => {
      const input = {
        name: "John O'Connor-Smith",
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const result = RegisterInputSchema.parse(input);
      expect(result.name).toBe("John O'Connor-Smith");
    });

    test('should reject invalid email format', () => {
      const input = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123!',
      };

      expect(() => RegisterInputSchema.parse(input)).toThrow();
    });

    test('should reject password that is too short', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Short1!',
      };

      expect(() => RegisterInputSchema.parse(input)).toThrow();
    });

    test('should reject password without complexity requirements', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'simplepassword',
      };

      expect(() => RegisterInputSchema.parse(input)).toThrow();
    });
  });

  describe('LoginInputSchema', () => {
    test('should validate correct login input', () => {
      const validInput = {
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const result = LoginInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should reject invalid email', () => {
      const input = {
        email: 'invalid-email',
        password: 'SecurePass123!',
      };

      expect(() => LoginInputSchema.parse(input)).toThrow();
    });

    test('should reject short password', () => {
      const input = {
        email: 'john@example.com',
        password: 'short',
      };

      expect(() => LoginInputSchema.parse(input)).toThrow();
    });
  });

  describe('CreateUserInputSchema', () => {
    test('should validate correct user creation input', () => {
      const validInput = {
        name: 'John Doe',
        email: 'john@example.com',
        role: USER_ROLE.USER,
        imageUrl: 'https://example.com/avatar.jpg',
      };

      const result = CreateUserInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should use default role when not provided', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = CreateUserInputSchema.parse(input);
      expect(result.role).toBe(USER_ROLE.USER);
    });

    test('should accept ADMIN role', () => {
      const input = {
        name: 'Admin User',
        email: 'admin@example.com',
        role: USER_ROLE.ADMIN,
      };

      const result = CreateUserInputSchema.parse(input);
      expect(result.role).toBe(USER_ROLE.ADMIN);
    });

    test('should reject invalid role', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'INVALID_ROLE',
      };

      expect(() => CreateUserInputSchema.parse(input)).toThrow();
    });

    test('should validate imageUrl when provided', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        imageUrl: 'https://example.com/avatar.jpg',
      };

      const result = CreateUserInputSchema.parse(input);
      expect(result.imageUrl).toBe('https://example.com/avatar.jpg');
    });

    test('should accept empty string for imageUrl', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        imageUrl: '',
      };

      const result = CreateUserInputSchema.parse(input);
      expect(result.imageUrl).toBe('');
    });

    test('should reject invalid imageUrl', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        imageUrl: 'not-a-url',
      };

      expect(() => CreateUserInputSchema.parse(input)).toThrow();
    });

    test('should trim and validate name', () => {
      const input = {
        name: '  John Doe  ',
        email: 'john@example.com',
      };

      const result = CreateUserInputSchema.parse(input);
      expect(result.name).toBe('John Doe');
    });

    test('should reject empty name', () => {
      const input = {
        name: '',
        email: 'john@example.com',
      };

      expect(() => CreateUserInputSchema.parse(input)).toThrow();
    });

    test('should reject invalid email format', () => {
      const input = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      expect(() => CreateUserInputSchema.parse(input)).toThrow();
    });
  });

  describe('UpdateUserInputSchema', () => {
    test('should validate correct user update input', () => {
      const validInput = {
        name: 'Updated Name',
        email: 'updated@example.com',
        role: USER_ROLE.ADMIN,
        imageUrl: 'https://example.com/new-avatar.jpg',
      };

      const result = UpdateUserInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should allow partial updates', () => {
      const input = {
        name: 'Updated Name Only',
      };

      const result = UpdateUserInputSchema.parse(input);
      expect(result.name).toBe('Updated Name Only');
      expect(result.email).toBeUndefined();
      expect(result.role).toBeUndefined();
    });

    test('should allow email-only update', () => {
      const input = {
        email: 'newemail@example.com',
      };

      const result = UpdateUserInputSchema.parse(input);
      expect(result.email).toBe('newemail@example.com');
      expect(result.name).toBeUndefined();
    });

    test('should allow role-only update', () => {
      const input = {
        role: USER_ROLE.ADMIN,
      };

      const result = UpdateUserInputSchema.parse(input);
      expect(result.role).toBe(USER_ROLE.ADMIN);
    });

    test('should trim name when provided', () => {
      const input = {
        name: '  Trimmed Name  ',
      };

      const result = UpdateUserInputSchema.parse(input);
      expect(result.name).toBe('Trimmed Name');
    });

    test('should reject empty name when provided', () => {
      const input = {
        name: '',
      };

      expect(() => UpdateUserInputSchema.parse(input)).toThrow();
    });

    test('should reject invalid email when provided', () => {
      const input = {
        email: 'invalid-email',
      };

      expect(() => UpdateUserInputSchema.parse(input)).toThrow();
    });

    test('should reject invalid role when provided', () => {
      const input = {
        role: 'INVALID_ROLE',
      };

      expect(() => UpdateUserInputSchema.parse(input)).toThrow();
    });

    test('should accept empty string for imageUrl', () => {
      const input = {
        imageUrl: '',
      };

      const result = UpdateUserInputSchema.parse(input);
      expect(result.imageUrl).toBe('');
    });

    test('should reject invalid imageUrl when provided', () => {
      const input = {
        imageUrl: 'not-a-url',
      };

      expect(() => UpdateUserInputSchema.parse(input)).toThrow();
    });

    test('should allow empty object (no updates)', () => {
      const input = {};

      const result = UpdateUserInputSchema.parse(input);
      expect(result).toEqual({});
    });
  });

  describe('UpdateProfileInputSchema', () => {
    test('should validate correct profile update input', () => {
      const validInput = {
        name: 'Updated Name',
        address: '123 New Street',
        dob: '1990-01-01T00:00:00.000Z',
        imageUrl: 'https://example.com/avatar.jpg',
      };

      const result = UpdateProfileInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should allow partial profile updates', () => {
      const input = {
        name: 'New Name',
      };

      const result = UpdateProfileInputSchema.parse(input);
      expect(result.name).toBe('New Name');
      expect(result.address).toBeUndefined();
    });

    test('should validate date of birth format', () => {
      const input = {
        dob: '1990-01-01T00:00:00.000Z',
      };

      const result = UpdateProfileInputSchema.parse(input);
      expect(result.dob).toBe('1990-01-01T00:00:00.000Z');
    });

    test('should reject invalid date of birth', () => {
      const input = {
        dob: 'invalid-date',
      };

      expect(() => UpdateProfileInputSchema.parse(input)).toThrow();
    });

    test('should allow empty dob', () => {
      const input = {
        dob: '',
      };

      const result = UpdateProfileInputSchema.parse(input);
      expect(result.dob).toBe('');
    });

    test('should validate imageUrl format', () => {
      const input = {
        imageUrl: 'https://example.com/avatar.jpg',
      };

      const result = UpdateProfileInputSchema.parse(input);
      expect(result.imageUrl).toBe('https://example.com/avatar.jpg');
    });

    test('should reject invalid imageUrl', () => {
      const input = {
        imageUrl: 'not-a-url',
      };

      expect(() => UpdateProfileInputSchema.parse(input)).toThrow();
    });
  });

  describe('MeetingInputSchema', () => {
    test('should validate correct meeting input', () => {
      const validInput = {
        title: 'Team Meeting',
        description: 'Weekly team sync',
        startTime: '2024-01-01T10:00:00.000Z',
        endTime: '2024-01-01T11:00:00.000Z',
        attendeeIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      const result = MeetingInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should use default empty description', () => {
      const input = {
        title: 'Meeting',
        startTime: '2024-01-01T10:00:00.000Z',
        endTime: '2024-01-01T11:00:00.000Z',
      };

      const result = MeetingInputSchema.parse(input);
      expect(result.description).toBe('');
    });

    test('should use default empty attendeeIds', () => {
      const input = {
        title: 'Meeting',
        startTime: '2024-01-01T10:00:00.000Z',
        endTime: '2024-01-01T11:00:00.000Z',
      };

      const result = MeetingInputSchema.parse(input);
      expect(result.attendeeIds).toEqual([]);
    });

    test('should reject when startTime is after endTime', () => {
      const input = {
        title: 'Meeting',
        startTime: '2024-01-01T11:00:00.000Z',
        endTime: '2024-01-01T10:00:00.000Z', // Before start time
      };

      expect(() => MeetingInputSchema.parse(input)).toThrow();
    });

    test('should reject invalid date formats', () => {
      const input = {
        title: 'Meeting',
        startTime: 'invalid-date',
        endTime: '2024-01-01T11:00:00.000Z',
      };

      expect(() => MeetingInputSchema.parse(input)).toThrow();
    });

    test('should reject invalid ObjectId in attendeeIds', () => {
      const input = {
        title: 'Meeting',
        startTime: '2024-01-01T10:00:00.000Z',
        endTime: '2024-01-01T11:00:00.000Z',
        attendeeIds: ['invalid-object-id'],
      };

      expect(() => MeetingInputSchema.parse(input)).toThrow();
    });
  });

  describe('EventInputSchema', () => {
    test('should validate correct event input', () => {
      const validInput = {
        title: 'Conference',
        description: 'Annual tech conference',
        startTime: '2024-01-01T09:00:00.000Z',
        endTime: '2024-01-01T17:00:00.000Z',
        attendeeIds: ['507f1f77bcf86cd799439011'],
      };

      const result = EventInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    test('should use default empty description', () => {
      const input = {
        title: 'Event',
        startTime: '2024-01-01T09:00:00.000Z',
        endTime: '2024-01-01T17:00:00.000Z',
      };

      const result = EventInputSchema.parse(input);
      expect(result.description).toBe('');
    });

    test('should use default empty attendeeIds', () => {
      const input = {
        title: 'Event',
        startTime: '2024-01-01T09:00:00.000Z',
        endTime: '2024-01-01T17:00:00.000Z',
      };

      const result = EventInputSchema.parse(input);
      expect(result.attendeeIds).toEqual([]);
    });

    test('should reject empty title', () => {
      const input = {
        title: '',
        startTime: '2024-01-01T09:00:00.000Z',
        endTime: '2024-01-01T17:00:00.000Z',
      };

      expect(() => EventInputSchema.parse(input)).toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null values gracefully', () => {
      expect(() => CreateUserInputSchema.parse(null)).toThrow();
      expect(() => UpdateUserInputSchema.parse(null)).toThrow();
    });

    test('should handle undefined values gracefully', () => {
      expect(() => CreateUserInputSchema.parse(undefined)).toThrow();
      expect(() => UpdateUserInputSchema.parse(undefined)).toThrow();
    });

    test('should handle non-object inputs', () => {
      expect(() => CreateUserInputSchema.parse('string')).toThrow();
      expect(() => CreateUserInputSchema.parse(123)).toThrow();
      expect(() => CreateUserInputSchema.parse([])).toThrow();
    });

    test('should provide detailed error messages', () => {
      const input = {
        name: '', // Invalid
        email: 'invalid-email', // Invalid
        role: 'INVALID_ROLE', // Invalid
      };

      try {
        CreateUserInputSchema.parse(input);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ZodError');
        expect(error.issues).toBeDefined();
        expect(error.issues.length).toBeGreaterThan(0);
      }
    });

    test('should handle very long strings', () => {
      const input = {
        name: 'A'.repeat(1000),
        email: 'test@example.com',
      };

      expect(() => CreateUserInputSchema.parse(input)).toThrow();
    });

    test('should handle special email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user123@example123.com',
      ];

      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'missing@domain',
        'spaces @domain.com',
      ];

      validEmails.forEach((email) => {
        const input = { name: 'Test User', email };
        expect(() => CreateUserInputSchema.parse(input)).not.toThrow();
      });

      invalidEmails.forEach((email) => {
        const input = { name: 'Test User', email };
        expect(() => CreateUserInputSchema.parse(input)).toThrow();
      });
    });
  });
});
