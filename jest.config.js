/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  testEnvironment: 'node',
  rootDir: 'src',
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.js'],
  coveragePathIgnorePatterns: ['cli.js', 'mocks.js'],
};

module.exports = config;
