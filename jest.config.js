module.exports = {
  // Use jsdom environment for browser APIs
  testEnvironment: 'jsdom',
  
  // Setup files to run before tests
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/test/unit/**/*.spec.js',
    '<rootDir>/test/integration/**/*.spec.js',
    '<rootDir>/test/permutations/**/*.spec.js'
  ],
  
  // Transform ES6 modules
  transform: {
    '^.+\\.m?js$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'mjs'],
  
  // Coverage configuration - maintain 95% requirement
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output
  verbose: true
};
