// ESLint config specifically for import path enforcement
// Ensures @/ alias usage and prevents deep relative imports

module.exports = {
  extends: [],
  plugins: ['import'],
  rules: {
    // Prevent deep relative imports (../../../)
    'import/no-relative-parent-imports': 'error',
    
    // Custom rule to enforce @/ alias usage
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../../../*', '../../../../*', '../../../../../*'],
            message: 'Use @/ alias instead of deep relative imports (../../../). Configure in tsconfig.json paths.'
          },
          {
            group: ['**/frontend/**'],
            message: 'Do not import from frontend/ directory. Use shared libs or API endpoints.'
          },
          {
            group: ['**/backend/**'],
            message: 'Frontend code cannot import backend modules directly. Use API endpoints.'
          }
        ]
      }
    ],
    
    // Enforce consistent import order
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ]
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
      rules: {
        'import/no-relative-parent-imports': 'off',
        'no-restricted-imports': 'off'
      }
    },
    {
      files: ['backend/**/*.ts'],
      rules: {
        // Backend has different rules - allow relative imports within backend
        'import/no-relative-parent-imports': 'off',
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/frontend/**', '**/app/**', '**/components/**'],
                message: 'Backend cannot import frontend code.'
              }
            ]
          }
        ]
      }
    }
  ]
};