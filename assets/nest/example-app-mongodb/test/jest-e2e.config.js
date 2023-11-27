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
    '<rootDir>/src/api/**/*.(t|j)s'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/main.ts$',
    '<rootDir>/.*spec.ts$',
    '<rootDir>/.*module.ts$',
    '<rootDir>/src/.*/index.ts$',
    '<rootDir>/src/.*dto.ts$',
    '<rootDir>/src/.*entity.ts$',
    '<rootDir>/src/.*repository.ts$',
    '<rootDir>/src/.*guard.ts$',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  // path aliases from tsconfig.json
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@database$': '<rootDir>/src/database',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@extensions/(.*)$': '<rootDir>/src/extensions/$1',
    '^@middleware$': '<rootDir>/src/middleware',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
}
