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
    '<rootDir>/src/**/*.(t|j)s'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/main.ts$',
    '<rootDir>/.*spec.ts$',
    '<rootDir>/.*module.ts$'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
}
