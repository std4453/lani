module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  transform: { '^.+\\.[tj]sx?$': 'ts-jest' },
  transformIgnorePatterns: ['/node_modules/(?!.*pretty-bytes)'],
  globals: { 'ts-jest': { tsconfig: '<rootDir>/tests/tsconfig.json' } },
  moduleNameMapper: {
    '^antd/es/.*/style(/index)?$': '<rootDir>/tests/style-mock.js',
    '^antd/es/(.*)$': 'antd/lib/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.less$': '<rootDir>/tests/style-mock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
