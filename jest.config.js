const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      enableTsDiagnostics: true,
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    ...tsjPreset.transform,
  },
  testMatch: ['**/test/**/*.test.(ts|js)'],
  testEnvironment: 'node',
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
}
