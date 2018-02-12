module.exports = {
  collectCoverageFrom: ['src/**/*.js'],
  modulePathIgnorePatterns: ['build'],
  projects: ['./jest.preact.config.js', './jest/react.config.js']
}
