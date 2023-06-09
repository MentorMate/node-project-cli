/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  moduleFileExtensions: [
    'js',
    'json',
    'ts'
  ],
  rootDir: '..',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  coverageDirectory: 'coverage-e2e',
  collectCoverageFrom: [
    '<rootDir>/src/features/**/*.(t|j)s'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/main.ts$',
    '<rootDir>/.*spec.ts$',
    '<rootDir>/.*module.ts$',
    '<rootDir>/src/.*/index.ts$',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  setupFiles: [
    '<rootDir>/jest.setup.ts'
  ],
  // path aliases from tsconfig.json
  moduleNameMapper: {
    '^@database$': '<rootDir>/src/database',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@extensions/(.*)$': '<rootDir>/src/extensions/$1',
    '^@middleware$': '<rootDir>/src/middleware',
    '^@auth$': '<rootDir>/src/features/auth',
    '^@auth/(.*)$': '<rootDir>/src/features/auth/$1',
    '^@healthchecks$': '<rootDir>/src/features/healthchecks',
    '^@healthchecks/(.*)$': '<rootDir>/src/features/healthchecks/$1',
    '^@hello-world$': '<rootDir>/src/features/hello-world',
    '^@hello-world/(.*)$': '<rootDir>/src/features/hello-world/$1',
    '^@todos$': '<rootDir>/src/features/todos',
    '^@todos/(.*)$': '<rootDir>/src/features/todos/$1',
    '^@users$': '<rootDir>/src/features/users',
    '^@users/(.*)$': '<rootDir>/src/features/users/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
}
