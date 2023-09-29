/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s'
  ],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/src/main.ts$',
    '<rootDir>/src/.*module.ts$',
    '<rootDir>/src/.*/index.ts$',
    '<rootDir>/src/.*dto.ts$',
    '<rootDir>/src/.*entity.ts$',
    '<rootDir>/src/.*controller.ts$',
    '<rootDir>/src/utils/class-transformers/.*',
    '<rootDir>/src/.*interceptor.ts$',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  moduleFileExtensions: [
    'js',
    'json',
    'ts'
  ],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  setupFiles: [
    '<rootDir>/jest.setup.ts'
  ],
  // path aliases from tsconfig.json
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@database$': '<rootDir>/src/database',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@extensions/(.*)$': '<rootDir>/src/extensions/$1',
    '^@middleware$': '<rootDir>/src/middleware',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  }
}
