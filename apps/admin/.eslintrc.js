// https://www.npmjs.com/package/@rushstack/eslint-config

// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: [
    '@rushstack/eslint-config/profile/web-app',
    '@rushstack/eslint-config/mixins/react',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { tsconfigRootDir: __dirname },
  rules: {
    // react function 组件
    '@typescript-eslint/explicit-function-return-type': 'off',
    // 与 @typescript-eslint/no-floating-promises 冲突
    'no-void': 'off',
    'react/jsx-no-bind': [
      'error',
      {
        allowArrowFunctions: true,
      },
    ],
    // 目前项目中的命名方式并不稳定，不设置规范
    '@typescript-eslint/naming-convention': 'off',
    'no-empty': [
      'warn',
      {
        allowEmptyCatch: true,
      },
    ],
    '@rushstack/no-new-null': 'off',
    '@rushstack/typedef-var': 'off',
  },
};