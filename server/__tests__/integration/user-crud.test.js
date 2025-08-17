/**
 * User CRUD Integration Tests
 * End-to-end tests for User management operations including
 * search, filtering, sorting, pagination, and full CRUD operations
 */

const request = require('supertest');
const { createTestServer } = require('../../tests/setup/testServer');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../../tests/setup/testDb');
const { hashPassword, generateTestToken } = require('../../tests/setup/helpers');
const User = require('../../models/user-schema');
const { USER_ROLE } = require('../../constants/const');

describe('User CRUD Integration Tests', () => {
  let app;
  let authToken;
  let adminUser;

  beforeAll(async () => {
    await connectTestDB();
    app = createTestServer();

    // Create admin user for authentication
    adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await hashPassword('AdminPass123!'),
      role: USER_ROLE.ADMIN,
    });
    await adminUser.save();

    authToken = generateTestToken(adminUser._id);
  }, 30000); // 30 second timeout for database connection

  beforeEach(async () => {
    // Clear all users except admin
    await User.deleteMany({ _id: { $ne: adminUser._id } });
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe('Users Query with Filtering, Sorting, and Pagination', () => {
    beforeEach(async () => {
      // Create test users with different roles and names
      const testUsers = [
        {
          name: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          password: await hashPassword('password123'),
          role: USER_ROLE.USER,
        },
        {
          name: 'Bob Smith',
          email: 'bob.smith@example.com',
          password: await hashPassword('password123'),
          role: USER_ROLE.ADMIN,
        },
        {
          name: 'Charlie Brown',
          email: 'charlie.brown@example.com',
          password: await hashPassword('password123'),
          role: USER_ROLE.USER,
        },
        {
          name: 'David Wilson',
          email: 'david.wilson@example.com',
          password: await hashPassword('password123'),
          role: USER_ROLE.USER,
        },
        {
          name: 'Eve Davis',
          email: 'eve.davis@example.com',
          password: await hashPassword('password123'),
          role: USER_ROLE.ADMIN,
        },
      ];

      await User.create(testUsers);
    });

    const GET_USERS_QUERY = `
      query GetUsers($where: UsersWhere, $orderBy: UsersOrderBy, $pagination: Pagination) {
        users(where: $where, orderBy: $orderBy, pagination: $pagination) {
          usersList {
            id
            name
            email
            role
            createdAt
            updatedAt
          }
          total
          hasMore
        }
      }
    `;

    test('should return all users with default parameters', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const { users } = response.body.data;
      expect(users.usersList).toHaveLength(6); // 5 test users + 1 admin
      expect(users.total).toBe(6);
      expect(users.hasMore).toBe(false);

      // Should be sorted by name ASC by default
      const names = users.usersList.map((u) => u.name);
      expect(names[0]).toBe('Admin User');
      expect(names[1]).toBe('Alice Johnson');
    });

    test('should search users by name (case insensitive)', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            where: { search: 'alice' },
          },
        });

      expect(response.status).toBe(200);
      const { users } = response.body.data;
      expect(users.usersList).toHaveLength(1);
      expect(users.usersList[0].name).toBe('Alice Johnson');
      expect(users.total).toBe(1);
    });

    test('should search users by email', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            where: { search: 'smith' },
          },
        });

      expect(response.status).toBe(200);
      const { users } = response.body.data;
      expect(users.usersList).toHaveLength(1);
      expect(users.usersList[0].name).toBe('Bob Smith');
    });

    test('should filter users by role', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            where: { role: USER_ROLE.ADMIN },
          },
        });

      expect(response.status).toBe(200);
      const { users } = response.body.data;
      expect(users.usersList).toHaveLength(3); // Admin User, Bob Smith, Eve Davis
      expect(users.total).toBe(3);

      const roles = users.usersList.map((u) => u.role);
      expect(roles.every((role) => role === USER_ROLE.ADMIN)).toBe(true);
    });

    test('should combine search and role filter', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            where: {
              search: 'bob',
              role: USER_ROLE.ADMIN,
            },
          },
        });

      expect(response.status).toBe(200);
      const { users } = response.body.data;
      expect(users.usersList).toHaveLength(1);
      expect(users.usersList[0].name).toBe('Bob Smith');
      expect(users.usersList[0].role).toBe(USER_ROLE.ADMIN);
    });

    test('should sort users by name DESC', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            orderBy: { field: 'NAME', direction: 'DESC' },
          },
        });

      expect(response.status).toBe(200);
      const { users } = response.body.data;
      const names = users.usersList.map((u) => u.name);
      expect(names[0]).toBe('Eve Davis');
      expect(names[names.length - 1]).toBe('Admin User');
    });

    test('should paginate results correctly', async () => {
      // Get first page
      const page1Response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            pagination: { limit: 2, offset: 0 },
          },
        });

      expect(page1Response.status).toBe(200);
      const page1 = page1Response.body.data.users;
      expect(page1.usersList).toHaveLength(2);
      expect(page1.total).toBe(6);
      expect(page1.hasMore).toBe(true);

      // Get second page
      const page2Response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            pagination: { limit: 2, offset: 2 },
          },
        });

      expect(page2Response.status).toBe(200);
      const page2 = page2Response.body.data.users;
      expect(page2.usersList).toHaveLength(2);
      expect(page2.total).toBe(6);
      expect(page2.hasMore).toBe(true);

      // Ensure different users on different pages
      const page1Names = page1.usersList.map((u) => u.name);
      const page2Names = page2.usersList.map((u) => u.name);
      expect(page1Names).not.toEqual(page2Names);
    });

    test('should handle complex query with all parameters', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            where: { role: USER_ROLE.USER },
            orderBy: { field: 'NAME', direction: 'ASC' },
            pagination: { limit: 2, offset: 0 },
          },
        });

      expect(response.status).toBe(200);
      const { users } = response.body.data;
      expect(users.usersList).toHaveLength(2);
      expect(users.total).toBe(3); // Total USER role users
      expect(users.hasMore).toBe(true);

      // Should be USER role users sorted by name
      expect(users.usersList[0].name).toBe('Alice Johnson');
      expect(users.usersList[0].role).toBe(USER_ROLE.USER);
    });

    test('should require authentication', async () => {
      const response = await request(app).post('/graphql').send({
        query: GET_USERS_QUERY,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('authenticated');
    });
  });

  describe('Single User Query', () => {
    const GET_USER_QUERY = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
          role
          imageUrl
          address
          dob
          createdAt
          updatedAt
        }
      }
    `;

    test('should return user by ID', async () => {
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: await hashPassword('password123'),
        role: USER_ROLE.USER,
        address: '123 Test St',
      });
      await testUser.save();

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_QUERY,
          variables: { id: testUser._id.toString() },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const { user } = response.body.data;
      expect(user.id).toBe(testUser._id.toString());
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe(USER_ROLE.USER);
      expect(user.address).toBe('123 Test St');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: GET_USER_QUERY,
          variables: { id: adminUser._id.toString() },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('authenticated');
    });
  });

  describe('Create User Mutation', () => {
    const CREATE_USER_MUTATION = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
          role
          imageUrl
          createdAt
          updatedAt
        }
      }
    `;

    test('should create user successfully', async () => {
      const userInput = {
        name: 'New User',
        email: 'newuser@example.com',
        role: USER_ROLE.USER,
        imageUrl: 'https://example.com/avatar.jpg',
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: CREATE_USER_MUTATION,
          variables: { input: userInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const { createUser } = response.body.data;
      expect(createUser.name).toBe('New User');
      expect(createUser.email).toBe('newuser@example.com');
      expect(createUser.role).toBe(USER_ROLE.USER);
      expect(createUser.imageUrl).toBe('https://example.com/avatar.jpg');
      expect(createUser.id).toBeDefined();

      // Verify user was created in database
      const savedUser = await User.findById(createUser.id);
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe('New User');
    });

    test('should create user with default role', async () => {
      const userInput = {
        name: 'Default Role User',
        email: 'defaultrole@example.com',
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: CREATE_USER_MUTATION,
          variables: { input: userInput },
        });

      expect(response.status).toBe(200);
      const { createUser } = response.body.data;
      expect(createUser.role).toBe(USER_ROLE.USER);
    });

    test('should reject duplicate email', async () => {
      const userInput = {
        name: 'Duplicate Email User',
        email: adminUser.email, // Use existing admin email
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: CREATE_USER_MUTATION,
          variables: { input: userInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Email already in use');
    });

    test('should validate required fields', async () => {
      const invalidInput = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email format
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: CREATE_USER_MUTATION,
          variables: { input: invalidInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Validation failed');
    });

    test('should require authentication', async () => {
      const userInput = {
        name: 'Unauthorized User',
        email: 'unauthorized@example.com',
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: CREATE_USER_MUTATION,
          variables: { input: userInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('authenticated');
    });
  });

  describe('Update User Mutation', () => {
    const UPDATE_USER_MUTATION = `
      mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          id
          name
          email
          role
          imageUrl
          updatedAt
        }
      }
    `;

    let testUser;

    beforeEach(async () => {
      testUser = new User({
        name: 'Original Name',
        email: 'original@example.com',
        password: await hashPassword('password123'),
        role: USER_ROLE.USER,
      });
      await testUser.save();
    });

    test('should update user successfully', async () => {
      const updateInput = {
        name: 'Updated Name',
        email: 'updated@example.com',
        role: USER_ROLE.ADMIN,
        imageUrl: 'https://example.com/new-avatar.jpg',
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: UPDATE_USER_MUTATION,
          variables: {
            id: testUser._id.toString(),
            input: updateInput,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const { updateUser } = response.body.data;
      expect(updateUser.name).toBe('Updated Name');
      expect(updateUser.email).toBe('updated@example.com');
      expect(updateUser.role).toBe(USER_ROLE.ADMIN);
      expect(updateUser.imageUrl).toBe('https://example.com/new-avatar.jpg');

      // Verify user was updated in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.role).toBe(USER_ROLE.ADMIN);
    });

    test('should update partial fields', async () => {
      const updateInput = {
        name: 'Partially Updated Name',
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: UPDATE_USER_MUTATION,
          variables: {
            id: testUser._id.toString(),
            input: updateInput,
          },
        });

      expect(response.status).toBe(200);
      const { updateUser } = response.body.data;
      expect(updateUser.name).toBe('Partially Updated Name');
      expect(updateUser.email).toBe('original@example.com'); // Unchanged
      expect(updateUser.role).toBe(USER_ROLE.USER); // Unchanged
    });

    test('should reject duplicate email for different user', async () => {
      const updateInput = {
        email: adminUser.email, // Try to use admin's email
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: UPDATE_USER_MUTATION,
          variables: {
            id: testUser._id.toString(),
            input: updateInput,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Email already in use');
    });

    test('should allow same email for same user', async () => {
      const updateInput = {
        name: 'Updated Name',
        email: testUser.email, // Same email
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: UPDATE_USER_MUTATION,
          variables: {
            id: testUser._id.toString(),
            input: updateInput,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateUser.name).toBe('Updated Name');
    });

    test('should return error for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateInput = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: UPDATE_USER_MUTATION,
          variables: {
            id: nonExistentId,
            input: updateInput,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('User not found');
    });

    test('should require authentication', async () => {
      const updateInput = {
        name: 'Unauthorized Update',
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: UPDATE_USER_MUTATION,
          variables: {
            id: testUser._id.toString(),
            input: updateInput,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('authenticated');
    });
  });

  describe('Delete User Mutation', () => {
    const DELETE_USER_MUTATION = `
      mutation DeleteUser($id: ID!) {
        deleteUser(id: $id)
      }
    `;

    let testUser;

    beforeEach(async () => {
      testUser = new User({
        name: 'User To Delete',
        email: 'delete@example.com',
        password: await hashPassword('password123'),
        role: USER_ROLE.USER,
      });
      await testUser.save();
    });

    test('should delete user successfully', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: DELETE_USER_MUTATION,
          variables: { id: testUser._id.toString() },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteUser).toBe(true);

      // Verify user was deleted from database
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    test('should return error for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: DELETE_USER_MUTATION,
          variables: { id: nonExistentId },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('User not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: DELETE_USER_MUTATION,
          variables: { id: testUser._id.toString() },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('authenticated');
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large dataset pagination efficiently', async () => {
      // Create 50 test users
      const users = Array.from({ length: 50 }, (_, i) => ({
        name: `User ${i.toString().padStart(2, '0')}`,
        email: `user${i}@example.com`,
        password: 'hashedpassword',
        role: i % 3 === 0 ? USER_ROLE.ADMIN : USER_ROLE.USER,
      }));

      await User.create(users);

      const GET_USERS_QUERY = `
        query GetUsers($pagination: Pagination) {
          users(pagination: $pagination) {
            usersList { id name }
            total
            hasMore
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            pagination: { limit: 10, offset: 0 },
          },
        });

      expect(response.status).toBe(200);
      const { users: result } = response.body.data;
      expect(result.usersList).toHaveLength(10);
      expect(result.total).toBe(51); // 50 + 1 admin
      expect(result.hasMore).toBe(true);
    });

    test('should handle empty search results gracefully', async () => {
      const GET_USERS_QUERY = `
        query GetUsers($where: UsersWhere) {
          users(where: $where) {
            usersList { id name }
            total
            hasMore
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            where: { search: 'nonexistentuser' },
          },
        });

      expect(response.status).toBe(200);
      const { users } = response.body.data;
      expect(users.usersList).toHaveLength(0);
      expect(users.total).toBe(0);
      expect(users.hasMore).toBe(false);
    });

    test('should handle special characters in search', async () => {
      const testUser = new User({
        name: "O'Connor-Smith",
        email: 'special@example.com',
        password: await hashPassword('password123'),
      });
      await testUser.save();

      const GET_USERS_QUERY = `
        query GetUsers($where: UsersWhere) {
          users(where: $where) {
            usersList { id name }
            total
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USERS_QUERY,
          variables: {
            where: { search: "O'Connor" },
          },
        });

      expect(response.status).toBe(200);
      const { users } = response.body.data;
      expect(users.usersList).toHaveLength(1);
      expect(users.usersList[0].name).toBe("O'Connor-Smith");
    });
  });
});
