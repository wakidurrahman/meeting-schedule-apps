/**
 * User Model Tests
 * Tests for Mongoose User schema validation, methods, and database operations
 */

const mongoose = require('mongoose');
const User = require('../../models/user-schema');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../../tests/setup/testDb');
const { createTestUser, hashPassword } = require('../../tests/setup/helpers');

describe('User Model', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe('Schema Validation', () => {
    test('should create a valid user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: await hashPassword('password123'),
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe('John Doe');
      expect(savedUser.email).toBe('john@example.com');
      expect(savedUser.role).toBe('USER'); // Default role
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    test('should require name field', async () => {
      const user = new User({
        email: 'john@example.com',
        password: 'hashedpassword',
      });

      await expect(user.save()).rejects.toThrow(/name.*required/i);
    });

    test('should require email field', async () => {
      const user = new User({
        name: 'John Doe',
        password: 'hashedpassword',
      });

      await expect(user.save()).rejects.toThrow(/email.*required/i);
    });

    test('should require password field', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
      });

      await expect(user.save()).rejects.toThrow(/password.*required/i);
    });

    test('should enforce unique email constraint', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
      };

      // Create first user
      const user1 = new User(userData);
      await user1.save();

      // Try to create second user with same email
      const user2 = new User({
        ...userData,
        name: 'Jane Doe',
      });

      await expect(user2.save()).rejects.toThrow(/duplicate key error/i);
    });

    test('should validate email format', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'hashedpassword',
      });

      await expect(user.save()).rejects.toThrow(/valid email/i);
    });

    test('should convert email to lowercase', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'hashedpassword',
      });

      const savedUser = await user.save();
      expect(savedUser.email).toBe('john@example.com');
    });

    test('should trim name field', async () => {
      const user = new User({
        name: '  John Doe  ',
        email: 'john@example.com',
        password: 'hashedpassword',
      });

      const savedUser = await user.save();
      expect(savedUser.name).toBe('John Doe');
    });

    test('should set default values', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
      });

      const savedUser = await user.save();
      expect(savedUser.role).toBe('USER');
      expect(savedUser.imageUrl).toBeNull();
      expect(savedUser.address).toBe('');
      expect(savedUser.dob).toBeNull();
      expect(savedUser.createdEvents).toEqual([]);
    });

    test('should accept valid role values', async () => {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashedpassword',
        role: 'ADMIN',
      });

      const savedUser = await adminUser.save();
      expect(savedUser.role).toBe('ADMIN');
    });

    test('should reject invalid role values', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: 'INVALID_ROLE',
      });

      await expect(user.save()).rejects.toThrow(/INVALID_ROLE.*not a valid enum value/i);
    });

    test('should handle optional fields', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        imageUrl: 'https://example.com/avatar.jpg',
        address: '123 Main St',
        dob: new Date('1990-01-01'),
      });

      const savedUser = await user.save();
      expect(savedUser.imageUrl).toBe('https://example.com/avatar.jpg');
      expect(savedUser.address).toBe('123 Main St');
      expect(savedUser.dob).toEqual(new Date('1990-01-01'));
    });
  });

  describe('Model Methods', () => {
    test('should populate createdEvents reference', async () => {
      // This would require Event model to be set up
      // For now, just test that the field exists and is an array
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
      });

      const savedUser = await user.save();
      expect(Array.isArray(savedUser.createdEvents)).toBe(true);
    });
  });

  describe('Database Operations', () => {
    test('should find user by email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
      };

      await new User(userData).save();
      const foundUser = await User.findOne({ email: 'john@example.com' });

      expect(foundUser).toBeTruthy();
      expect(foundUser.name).toBe('John Doe');
    });

    test('should update user data', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
      });

      const savedUser = await user.save();

      savedUser.name = 'Jane Doe';
      savedUser.address = 'New Address';

      const updatedUser = await savedUser.save();

      expect(updatedUser.name).toBe('Jane Doe');
      expect(updatedUser.address).toBe('New Address');
      expect(updatedUser.updatedAt).not.toEqual(updatedUser.createdAt);
    });

    test('should delete user', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
      });

      const savedUser = await user.save();
      const userId = savedUser._id;

      await User.findByIdAndDelete(userId);

      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });
  });
});
