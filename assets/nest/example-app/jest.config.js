/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  collectCoverageFrom: [
    '**/*.(t|j)s'
  ],
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/main.ts$',
    '<rootDir>/.*module.ts$'
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
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  }
}
