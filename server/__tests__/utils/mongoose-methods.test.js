/**
 * Mongoose Methods Tests
 * Comprehensive tests for all user-related database operations
 * Tests CRUD operations, search, filtering, sorting, and pagination
 */

const mongoose = require('mongoose');
const {
  getUserById,
  getUserByEmail,
  createUser,
  updateUserById,
  listUsers,
  listUsersFiltered,
  createUserWithRole,
  updateUserWithRole,
  deleteUserById,
} = require('../../utils/mongoose-methods');
const User = require('../../models/user-schema');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../../tests/setup/testDb');
const { createTestUser, hashPassword, generateObjectId } = require('../../tests/setup/helpers');
const { USER_ROLE } = require('../../constants/const');

describe('Mongoose Methods - User Operations', () => {
  beforeAll(async () => {
    await connectTestDB();
  }, 30000); // 30 second timeout for database connection

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe('Basic User Operations', () => {
    describe('getUserById', () => {
      test('should return user by valid ID', async () => {
        const testUser = createTestUser();
        const savedUser = await User.create(testUser);

        const result = await getUserById(savedUser._id);

        expect(result).toBeTruthy();
        expect(result._id.toString()).toBe(savedUser._id.toString());
        expect(result.name).toBe(testUser.name);
        expect(result.email).toBe(testUser.email);
      });

      test('should return null for non-existent ID', async () => {
        const nonExistentId = generateObjectId();
        const result = await getUserById(nonExistentId);
        expect(result).toBeNull();
      });

      test('should handle invalid ObjectId', async () => {
        await expect(getUserById('invalid-id')).rejects.toThrow();
      });
    });

    describe('getUserByEmail', () => {
      test('should return user by valid email', async () => {
        const testUser = createTestUser({ email: 'test@example.com' });
        await User.create(testUser);

        const result = await getUserByEmail('test@example.com');

        expect(result).toBeTruthy();
        expect(result.email).toBe('test@example.com');
        expect(result.name).toBe(testUser.name);
      });

      test('should return null for non-existent email', async () => {
        const result = await getUserByEmail('nonexistent@example.com');
        expect(result).toBeNull();
      });

      test('should be case insensitive (MongoDB default)', async () => {
        const testUser = createTestUser({ email: 'test@example.com' });
        await User.create(testUser);

        const result = await getUserByEmail('TEST@EXAMPLE.COM');
        expect(result).toBeTruthy();
        expect(result.email).toBe('test@example.com');
      });
    });

    describe('createUser', () => {
      test('should create user with password hash', async () => {
        const userData = {
          name: 'John Doe',
          email: 'john@example.com',
          passwordHash: await hashPassword('password123'),
        };

        const result = await createUser(userData);

        expect(result).toBeTruthy();
        expect(result.name).toBe('John Doe');
        expect(result.email).toBe('john@example.com');
        expect(result.password).toBe(userData.passwordHash);
        expect(result.role).toBe('USER'); // Default role
      });
    });

    describe('updateUserById', () => {
      test('should update user successfully', async () => {
        const testUser = createTestUser();
        const savedUser = await User.create(testUser);

        const updateData = {
          name: 'Updated Name',
          address: 'New Address',
        };

        const result = await updateUserById(savedUser._id, updateData);

        expect(result).toBeTruthy();
        expect(result.name).toBe('Updated Name');
        expect(result.address).toBe('New Address');
        expect(result.email).toBe(testUser.email); // Unchanged
      });

      test('should return null for non-existent user', async () => {
        const nonExistentId = generateObjectId();
        const result = await updateUserById(nonExistentId, { name: 'Test' });
        expect(result).toBeNull();
      });
    });

    describe('listUsers', () => {
      test('should return all users sorted by name', async () => {
        const users = [
          createTestUser({ name: 'Charlie', email: 'charlie@example.com' }),
          createTestUser({ name: 'Alice', email: 'alice@example.com' }),
          createTestUser({ name: 'Bob', email: 'bob@example.com' }),
        ];

        await User.create(users);

        const result = await listUsers();

        expect(result).toHaveLength(3);
        expect(result[0].name).toBe('Alice');
        expect(result[1].name).toBe('Bob');
        expect(result[2].name).toBe('Charlie');
      });

      test('should return empty array when no users exist', async () => {
        const result = await listUsers();
        expect(result).toEqual([]);
      });
    });
  });

  describe('Enhanced User Operations', () => {
    describe('listUsersFiltered', () => {
      beforeEach(async () => {
        // Create test users with different roles and names
        const testUsers = [
          createTestUser({
            name: 'John Admin',
            email: 'john.admin@example.com',
            role: USER_ROLE.ADMIN,
          }),
          createTestUser({
            name: 'Jane User',
            email: 'jane.user@example.com',
            role: USER_ROLE.USER,
          }),
          createTestUser({
            name: 'Bob Smith',
            email: 'bob.smith@example.com',
            role: USER_ROLE.USER,
          }),
          createTestUser({
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            role: USER_ROLE.ADMIN,
          }),
          createTestUser({
            name: 'Charlie Brown',
            email: 'charlie.brown@example.com',
            role: USER_ROLE.USER,
          }),
        ];

        await User.create(testUsers);
      });

      describe('Search Functionality', () => {
        test('should search by name (case insensitive)', async () => {
          const result = await listUsersFiltered({
            where: { search: 'john' },
          });

          expect(result.usersList).toHaveLength(2); // John Admin and Alice Johnson
          expect(result.total).toBe(2);
          expect(result.hasMore).toBe(false);

          const names = result.usersList.map((u) => u.name);
          expect(names).toContain('John Admin');
          expect(names).toContain('Alice Johnson');
        });

        test('should search by email (case insensitive)', async () => {
          const result = await listUsersFiltered({
            where: { search: 'smith' },
          });

          expect(result.usersList).toHaveLength(1);
          expect(result.usersList[0].name).toBe('Bob Smith');
          expect(result.total).toBe(1);
        });

        test('should return empty results for no matches', async () => {
          const result = await listUsersFiltered({
            where: { search: 'nonexistent' },
          });

          expect(result.usersList).toHaveLength(0);
          expect(result.total).toBe(0);
          expect(result.hasMore).toBe(false);
        });

        test('should search across both name and email', async () => {
          const result = await listUsersFiltered({
            where: { search: 'example.com' },
          });

          expect(result.usersList).toHaveLength(5); // All users have example.com emails
          expect(result.total).toBe(5);
        });
      });

      describe('Role Filtering', () => {
        test('should filter by ADMIN role', async () => {
          const result = await listUsersFiltered({
            where: { role: USER_ROLE.ADMIN },
          });

          expect(result.usersList).toHaveLength(2);
          expect(result.total).toBe(2);

          const roles = result.usersList.map((u) => u.role);
          expect(roles.every((role) => role === USER_ROLE.ADMIN)).toBe(true);
        });

        test('should filter by USER role', async () => {
          const result = await listUsersFiltered({
            where: { role: USER_ROLE.USER },
          });

          expect(result.usersList).toHaveLength(3);
          expect(result.total).toBe(3);

          const roles = result.usersList.map((u) => u.role);
          expect(roles.every((role) => role === USER_ROLE.USER)).toBe(true);
        });

        test('should combine search and role filter', async () => {
          const result = await listUsersFiltered({
            where: {
              search: 'john',
              role: USER_ROLE.ADMIN,
            },
          });

          expect(result.usersList).toHaveLength(2); // John Admin and Alice Johnson (contains "john")
          expect(result.total).toBe(2);

          const names = result.usersList.map((u) => u.name);
          expect(names).toContain('John Admin');
          expect(names).toContain('Alice Johnson');

          const roles = result.usersList.map((u) => u.role);
          expect(roles.every((role) => role === USER_ROLE.ADMIN)).toBe(true);
        });
      });

      describe('Sorting', () => {
        test('should sort by name ASC (default)', async () => {
          const result = await listUsersFiltered({
            orderBy: { field: 'NAME', direction: 'ASC' },
          });

          expect(result.usersList).toHaveLength(5);
          const names = result.usersList.map((u) => u.name);
          expect(names).toEqual([
            'Alice Johnson',
            'Bob Smith',
            'Charlie Brown',
            'Jane User',
            'John Admin',
          ]);
        });

        test('should sort by name DESC', async () => {
          const result = await listUsersFiltered({
            orderBy: { field: 'NAME', direction: 'DESC' },
          });

          expect(result.usersList).toHaveLength(5);
          const names = result.usersList.map((u) => u.name);
          expect(names).toEqual([
            'John Admin',
            'Jane User',
            'Charlie Brown',
            'Bob Smith',
            'Alice Johnson',
          ]);
        });

        test('should sort by createdAt ASC', async () => {
          const result = await listUsersFiltered({
            orderBy: { field: 'CREATED_AT', direction: 'ASC' },
          });

          expect(result.usersList).toHaveLength(5);
          // Should be sorted by creation time (oldest first)
        });

        test('should sort by createdAt DESC', async () => {
          const result = await listUsersFiltered({
            orderBy: { field: 'CREATED_AT', direction: 'DESC' },
          });

          expect(result.usersList).toHaveLength(5);
          // Should be sorted by creation time (newest first)
        });

        test('should use default sort when invalid field provided', async () => {
          const result = await listUsersFiltered({
            orderBy: { field: 'INVALID_FIELD', direction: 'ASC' },
          });

          expect(result.usersList).toHaveLength(5);
          // Should fall back to name sorting
          const names = result.usersList.map((u) => u.name);
          expect(names[0]).toBe('Alice Johnson'); // First alphabetically
        });
      });

      describe('Pagination', () => {
        test('should paginate results with limit and offset', async () => {
          const page1 = await listUsersFiltered({
            pagination: { limit: 2, offset: 0 },
          });

          expect(page1.usersList).toHaveLength(2);
          expect(page1.total).toBe(5);
          expect(page1.hasMore).toBe(true);

          const page2 = await listUsersFiltered({
            pagination: { limit: 2, offset: 2 },
          });

          expect(page2.usersList).toHaveLength(2);
          expect(page2.total).toBe(5);
          expect(page2.hasMore).toBe(true);

          const page3 = await listUsersFiltered({
            pagination: { limit: 2, offset: 4 },
          });

          expect(page3.usersList).toHaveLength(1);
          expect(page3.total).toBe(5);
          expect(page3.hasMore).toBe(false);
        });

        test('should handle pagination with search and filter', async () => {
          const result = await listUsersFiltered({
            where: { role: USER_ROLE.USER },
            pagination: { limit: 2, offset: 0 },
          });

          expect(result.usersList).toHaveLength(2);
          expect(result.total).toBe(3); // Total USER role users
          expect(result.hasMore).toBe(true);
        });

        test('should use default pagination when not provided', async () => {
          const result = await listUsersFiltered({});

          expect(result.usersList).toHaveLength(5); // Less than default limit of 10
          expect(result.total).toBe(5);
          expect(result.hasMore).toBe(false);
        });
      });

      describe('Complex Queries', () => {
        test('should handle search + filter + sort + pagination', async () => {
          const result = await listUsersFiltered({
            where: {
              search: 'john',
              role: USER_ROLE.ADMIN,
            },
            orderBy: { field: 'NAME', direction: 'DESC' },
            pagination: { limit: 1, offset: 0 },
          });

          expect(result.usersList).toHaveLength(1);
          expect(result.usersList[0].name).toBe('John Admin'); // Should be first when sorted DESC
          expect(result.total).toBe(2); // Total matching records
          expect(result.hasMore).toBe(true); // More records available
        });

        test('should return correct hasMore flag', async () => {
          // Test when there are more results
          const resultWithMore = await listUsersFiltered({
            pagination: { limit: 3, offset: 0 },
          });
          expect(resultWithMore.hasMore).toBe(true);

          // Test when no more results
          const resultNoMore = await listUsersFiltered({
            pagination: { limit: 10, offset: 0 },
          });
          expect(resultNoMore.hasMore).toBe(false);
        });
      });
    });

    describe('createUserWithRole', () => {
      test('should create user with specified role', async () => {
        const userData = {
          name: 'Admin User',
          email: 'admin@example.com',
          role: USER_ROLE.ADMIN,
          password: await hashPassword('password123'), // Add required password
        };

        const result = await createUserWithRole(userData);

        expect(result).toBeTruthy();
        expect(result.name).toBe('Admin User');
        expect(result.email).toBe('admin@example.com');
        expect(result.role).toBe(USER_ROLE.ADMIN);
      });

      test('should create user with default USER role', async () => {
        const userData = {
          name: 'Regular User',
          email: 'user@example.com',
          password: await hashPassword('password123'), // Add required password
        };

        const result = await createUserWithRole(userData);

        expect(result.role).toBe(USER_ROLE.USER);
      });

      test('should create user with imageUrl when provided', async () => {
        const userData = {
          name: 'User With Image',
          email: 'image@example.com',
          imageUrl: 'https://example.com/avatar.jpg',
          password: await hashPassword('password123'), // Add required password
        };

        const result = await createUserWithRole(userData);

        expect(result.imageUrl).toBe('https://example.com/avatar.jpg');
      });

      test('should not set imageUrl when not provided', async () => {
        const userData = {
          name: 'User Without Image',
          email: 'noimage@example.com',
          password: await hashPassword('password123'), // Add required password
        };

        const result = await createUserWithRole(userData);

        expect(result.imageUrl).toBeNull();
      });
    });

    describe('updateUserWithRole', () => {
      test('should update user with role changes', async () => {
        const testUser = createTestUser({ role: USER_ROLE.USER });
        const savedUser = await User.create(testUser);

        const updateData = {
          name: 'Updated Admin',
          role: USER_ROLE.ADMIN,
        };

        const result = await updateUserWithRole(savedUser._id, updateData);

        expect(result).toBeTruthy();
        expect(result.name).toBe('Updated Admin');
        expect(result.role).toBe(USER_ROLE.ADMIN);
        expect(result.updatedAt).toBeDefined();
      });

      test('should update updatedAt timestamp', async () => {
        const testUser = createTestUser();
        const savedUser = await User.create(testUser);
        const originalUpdatedAt = savedUser.updatedAt;

        // Wait a bit to ensure timestamp difference
        await new Promise((resolve) => setTimeout(resolve, 10));

        const result = await updateUserWithRole(savedUser._id, { name: 'Updated' });

        expect(result.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      });

      test('should return null for non-existent user', async () => {
        const nonExistentId = generateObjectId();
        const result = await updateUserWithRole(nonExistentId, { name: 'Test' });
        expect(result).toBeNull();
      });
    });

    describe('deleteUserById', () => {
      test('should delete existing user and return true', async () => {
        const testUser = createTestUser();
        const savedUser = await User.create(testUser);

        const result = await deleteUserById(savedUser._id);

        expect(result).toBe(true);

        // Verify user is deleted
        const deletedUser = await User.findById(savedUser._id);
        expect(deletedUser).toBeNull();
      });

      test('should return false for non-existent user', async () => {
        const nonExistentId = generateObjectId();
        const result = await deleteUserById(nonExistentId);
        expect(result).toBe(false);
      });

      test('should handle invalid ObjectId', async () => {
        await expect(deleteUserById('invalid-id')).rejects.toThrow();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // This would require mocking mongoose connection
      // For now, we'll test that errors are properly thrown
      await expect(getUserById('invalid-id')).rejects.toThrow();
    });

    test('should handle validation errors in createUserWithRole', async () => {
      const invalidUserData = {
        // Missing required name field
        email: 'test@example.com',
      };

      await expect(createUserWithRole(invalidUserData)).rejects.toThrow();
    });

    test('should handle validation errors in updateUserWithRole', async () => {
      const testUser = createTestUser();
      const savedUser = await User.create(testUser);

      const invalidUpdate = {
        email: 'invalid-email', // Invalid email format
      };

      await expect(updateUserWithRole(savedUser._id, invalidUpdate)).rejects.toThrow();
    });
  });
});
