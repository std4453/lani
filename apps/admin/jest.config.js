module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  globals: { 'ts-jest': { tsconfig: '<rootDir>/tests/tsconfig.json' } },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.module\\.less$': '<rootDir>/tests/style-mock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
