/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  // run test via Nodejs
  testEnvironment: 'node',
  // root dir is the app root
  rootDir: '.',
  // coverage directory
  coverageDirectory: '<rootDir>/coverage',
  // coverage is collected from files under src/
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js',
  ],
  // skip coverage from these files
  coveragePathIgnorePatterns: [
    // entry point
    '<rootDir>/src/index.js',
    '<rootDir>/src/app.js',
  ],
  // minimum coverage percent
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
