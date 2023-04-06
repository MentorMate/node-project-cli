/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  // run test via Nodejs
  testEnvironment: 'node',
  // needed for TypeScript
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // root dir is the app root
  rootDir: '.',
  // coverage directory
  coverageDirectory: '<rootDir>/coverage',
  // coverage is collected from files under src/
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  // skip coverage from these files
  coveragePathIgnorePatterns: [
    // entry point
    '<rootDir>/src/index.ts',
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
