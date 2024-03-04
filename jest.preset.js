const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)', '!**/e2e-tests/**'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary', 'html'],
  reporters: ['default'],
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}']
};
