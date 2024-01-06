/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  testEnvironment: 'node',
  rootDir: 'src',
  coverageDirectory: '../coverage',
  collectCoverageFrom: [
    '**/*.js'
  ],
  coveragePathIgnorePatterns: [
    'cli.js',
    'utils/test/mocks.js'
  ],
};
