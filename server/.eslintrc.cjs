/**
 * ESLint configuration for the Node.js server (Express + GraphQL + Mongoose)
 *
 * This configuration provides:
 * - Import sorting and organization
 * - Node.js best practices
 * - Security recommendations
 * - Code consistency rules
 * - Integration with Prettier
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    commonjs: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:import/recommended',
    'plugin:security/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['import', 'node', 'security', 'prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': ['error'],

    // Import organization and sorting
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // Node.js built-in modules
          'external', // npm packages
          'internal', // internal modules
          'parent', // parent directory imports
          'sibling', // same directory imports
          'index', // index files
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroups: [
          {
            pattern: '../**',
            group: 'parent',
            position: 'before',
          },
          {
            pattern: './**',
            group: 'sibling',
            position: 'before',
          },
        ],
      },
    ],
    'import/newline-after-import': ['error', { count: 1 }],
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'off', // Turn off since we're using CommonJS
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',

    // Variables and functions
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-console': 'off', // Allow console for server logging

    // Code quality
    'no-duplicate-imports': 'error',
    'no-return-await': 'error',
    'prefer-template': 'error',
    'object-shorthand': 'error',
    'no-useless-concat': 'error',
    'no-template-curly-in-string': 'error',

    // Function and arrow function rules
    'arrow-body-style': ['error', 'as-needed'],
    'prefer-arrow-callback': 'error',
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],

    // Error handling
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',

    // Node.js specific rules
    'node/no-unpublished-require': 'off',
    'node/no-missing-require': 'off', // Can conflict with dynamic requires
    'node/no-unsupported-features/es-syntax': 'off',
    'node/prefer-global/process': 'error',
    'node/prefer-global/console': 'error',
    'node/no-process-exit': 'warn',

    // Security rules (from eslint-plugin-security)
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'off', // Too restrictive for our use case
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',

    // Async/Promise rules
    'require-await': 'error',
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'no-promise-executor-return': 'error',

    // Best practices
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    radix: 'error',
    yoda: 'error',

    // Stylistic rules (that work with Prettier)
    'spaced-comment': ['error', 'always'],
    'lines-between-class-members': ['error', 'always'],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.json'],
      },
    },
  },
  ignorePatterns: ['node_modules', 'dist', 'build', 'coverage', '*.min.js', 'public'],
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
        mocha: true,
      },
      rules: {
        'no-console': 'off',
        'security/detect-object-injection': 'off',
        'security/detect-non-literal-fs-filename': 'off',
      },
    },
    {
      files: ['server.js'],
      rules: {
        'no-console': 'off', // Allow console.log in main server file
      },
    },
  ],
};
