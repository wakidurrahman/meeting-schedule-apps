# GraphQL Modular Restructure - Complete Guide

This document explains the complete restructuring of the GraphQL implementation from monolithic files to a modular, domain-based architecture.

## 🎯 What Was Accomplished

### Before (Monolithic Structure)

```
graphql/
├── resolvers.js      # 458 lines - all resolvers mixed together
└── typeDefs.js       # 155 lines - all type definitions together
```

### After (Modular Structure)

```
graphql/
├── resolvers/           # Domain-specific resolver files
│   ├── index.js        # Main resolver export (20 lines)
│   ├── user.js         # User authentication & profile (140 lines)
│   ├── meeting.js      # Meeting CRUD operations (80 lines)
│   ├── event.js        # Event management (90 lines)
│   └── booking.js      # Event booking operations (60 lines)
├── type-defs/          # Domain-specific type definitions
│   ├── index.js        # Main type definitions export (25 lines)
│   ├── user.js         # User types, inputs, queries & mutations (50 lines)
│   ├── meeting.js      # Meeting types, inputs, queries & mutations (35 lines)
│   ├── event.js        # Event types, inputs, queries & mutations (35 lines)
│   └── booking.js      # Booking types, queries & mutations (20 lines)
└── shared/             # Shared utilities and types
    ├── helpers.js      # Common resolver helper functions (120 lines)
    └── scalars.js      # Shared scalar types and enums (10 lines)
```

## 🚀 Key Benefits

### 1. **Separation of Concerns**

- Each domain (user, meeting, event, booking) has its own focused files
- Easier to locate and modify specific functionality
- Reduced cognitive load when working on specific features

### 2. **Team Collaboration**

- Multiple developers can work on different domains simultaneously
- Reduced merge conflicts
- Clear ownership of domain-specific code

### 3. **Maintainability**

- Smaller, focused files are easier to understand and maintain
- Related code is grouped together
- Consistent patterns across all domains

### 4. **Scalability**

- Easy to add new domains without affecting existing code
- Clear template for adding new functionality
- Shared utilities prevent code duplication

### 5. **Testing**

- Domain-specific tests can be isolated
- Easier to mock and test individual resolvers
- Clear separation of concerns in test files

## 📁 File Structure Details

### Resolvers Structure

Each resolver file follows a consistent pattern:

```javascript
// graphql/resolvers/[domain].js
const { GraphQLError } = require('graphql');

// Import domain-specific database methods
const { getUserById, createUser } = require('../../utils/mongoose-methods');

// Import validation schemas
const { RegisterInputSchema } = require('../../utils/validators');

// Import shared helpers
const { requireAuth, handleUnexpectedError, formatUser } = require('../shared/helpers');

// Domain resolvers object
const domainResolvers = {
  // Query resolvers
  queryName: async (args, context) => {
    try {
      const userId = requireAuth(context);
      const result = await getDomainData(args);
      return formatDomainData(result);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Mutation resolvers
  mutationName: async ({ input }, context) => {
    try {
      const userId = requireAuth(context);
      ValidationSchema.parse(input);
      const result = await createDomainData(input, userId);
      return formatDomainData(result);
    } catch (err) {
      if (err.name === 'ZodError') {
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      }
      handleUnexpectedError(err);
    }
  },
};

module.exports = domainResolvers;
```

### Type Definitions Structure

Each type definition file focuses on a single domain:

```javascript
// graphql/type-defs/[domain].js
module.exports = `
  # Domain Types
  type DomainType {
    id: ID!
    name: String!
    # ... other fields
  }

  # Domain Inputs
  input DomainInput {
    name: String!
    # ... other fields
  }

  # Domain Queries
  extend type Query {
    domains: [DomainType!]!
    domain(id: ID!): DomainType
  }

  # Domain Mutations
  extend type Mutation {
    createDomain(input: DomainInput!): DomainType!
    updateDomain(id: ID!, input: DomainInput!): DomainType!
    deleteDomain(id: ID!): Boolean!
  }
`;
```

### Shared Helpers

Common functionality is centralized in shared helpers:

```javascript
// graphql/shared/helpers.js

// Authentication validation
function requireAuth(context) {
  const userId = context?.req?.userId;
  if (!userId) {
    throw new GraphQLError(MESSAGES.NOT_AUTHENTICATED, {
      extensions: { code: ERROR_CODES.UNAUTHENTICATED },
    });
  }
  return userId;
}

// Error handling
function handleUnexpectedError(err) {
  if (err instanceof GraphQLError) throw err;
  throw new GraphQLError(MESSAGES.INTERNAL_ERROR, {
    extensions: { code: ERROR_CODES.INTERNAL_SERVER_ERROR },
  });
}

// Data formatting functions
function formatUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl ?? null,
    address: user.address ?? null,
    dob: user.dob ?? null,
    role: user.role ?? 'USER',
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}

// Similar formatting functions for other domains...
```

## 🔧 How to Use the New Structure

### Adding a New Resolver to Existing Domain

1. Open the appropriate domain file (e.g., `graphql/resolvers/user.js`)
2. Add the new resolver function following the existing pattern
3. Update the corresponding type definition file if needed

### Adding a New Domain

1. **Create the type definitions** (`graphql/type-defs/newdomain.js`):

   ```javascript
   module.exports = `
     type NewDomain {
       id: ID!
       name: String!
     }
   
     extend type Query {
       newDomains: [NewDomain!]!
     }
   
     extend type Mutation {
       createNewDomain(input: NewDomainInput!): NewDomain!
     }
   `;
   ```

2. **Create the resolvers** (`graphql/resolvers/newdomain.js`):

   ```javascript
   const newDomainResolvers = {
     newDomains: async (_args, context) => {
       // Implementation
     },
     createNewDomain: async ({ input }, context) => {
       // Implementation
     },
   };

   module.exports = newDomainResolvers;
   ```

3. **Update the index files**:
   - Add to `graphql/type-defs/index.js`
   - Add to `graphql/resolvers/index.js`

4. **Add shared helpers** if needed in `graphql/shared/helpers.js`

### Using Shared Helpers

Always use the shared helper functions for consistency:

```javascript
const {
  requireAuth, // Authentication validation
  handleUnexpectedError, // Error handling
  formatUser, // User data formatting
  formatMeeting, // Meeting data formatting
  formatEvent, // Event data formatting
  formatBooking, // Booking data formatting
} = require('../shared/helpers');

// Example usage in resolver
const userId = requireAuth(context);
const user = await getUserById(userId);
return formatUser(user);
```

## 📊 Migration Results

### Code Organization

- ✅ **75% reduction in file size** for individual files
- ✅ **Clear domain separation** - no more mixed concerns
- ✅ **Consistent patterns** across all resolvers
- ✅ **Shared utilities** eliminate code duplication

### Developer Experience

- ✅ **Faster navigation** - know exactly where to find code
- ✅ **Easier onboarding** - clear structure for new developers
- ✅ **Better collaboration** - multiple developers can work on different domains
- ✅ **Reduced conflicts** - changes in one domain don't affect others

### Maintenance Benefits

- ✅ **Isolated testing** - test individual domains
- ✅ **Easy refactoring** - changes are contained within domains
- ✅ **Clear dependencies** - understand what each domain relies on
- ✅ **Consistent error handling** - shared error handling patterns

## 🎯 Best Practices

### File Organization

- Keep domain files focused on a single responsibility
- Use descriptive file names that match the domain
- Group related functionality together

### Code Patterns

- Always use shared helper functions for common operations
- Follow consistent naming conventions across domains
- Use proper error handling and validation in all resolvers

### Type Definitions

- Use `extend type` for Query, Mutation, and Subscription
- Keep input types close to their related object types
- Use descriptive names for types and fields

### Testing Strategy

- Write domain-specific tests for each resolver file
- Use the shared helpers in tests for consistency
- Mock external dependencies at the domain level

## 🔄 Server Integration

The server.js file now imports from the new modular structure:

```javascript
// server.js
const resolvers = require('./graphql/resolvers'); // From resolvers/index.js
const typeDefs = require('./graphql/type-defs'); // From type-defs/index.js
```

The GraphQL schema is built exactly the same way as before, but now with much better organization and maintainability.

## 🚨 Important Notes

- **Backward Compatibility**: The API remains exactly the same - only the internal organization changed
- **No Breaking Changes**: All existing queries and mutations work identically
- **Gradual Adoption**: New features should follow the modular pattern
- **Shared Helpers**: Always use the shared helper functions for consistency

This modular structure provides a solid foundation for scaling the GraphQL API as the application grows and new features are added.
