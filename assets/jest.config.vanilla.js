/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  // run test via Nodejs
  testEnvironment: 'node',
  // root dir is the app root
  rootDir: '.',
  // path aliases from tsconfig.json
  moduleNameMapper: {
    '^@api$': '<rootDir>/src/api',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@modules$': '<rootDir>/src/modules',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@common$': '<rootDir>/src/common',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@database$': '<rootDir>/src/database',
    '^@extensions/(.*)$': '<rootDir>/src/extensions/$1',
  },
  // coverage is collected from files under src/
  collectCoverageFrom: ['<rootDir>/src/**/*.[tj]s?(x)'],
  // coverage directory
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
