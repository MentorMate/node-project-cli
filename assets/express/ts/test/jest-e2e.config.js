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
  rootDir: '..',
  // match anything that is spec-e2e or test-e2e with a js, jsx, ts and tsx extension
  testMatch: [
    "**/?(*.)+(spec|test)-e2e.[tj]s"
  ],
  // change coverage directory name so that it doesn't overlap with unit test coverage
  coverageDirectory: '<rootDir>/coverage-e2e',
  // coverage is collected from files under src/
  collectCoverageFrom: [
    '<rootDir>/src/**/*.[tj]s',
  ],
  // and from those files ignore
  coveragePathIgnorePatterns: [
    // unit tests
    '(spec|test).[tj]s$',
    // entry points
    '<rootDir>/src/index.[tj]s$',
    '<rootDir>/src/app.[tj]s$',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
