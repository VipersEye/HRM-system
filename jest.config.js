module.exports = {
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/src/modules/tests/styleMock.js',
  },
  transform: {
    "^.+\\.js$": "babel-jest"
  }
};