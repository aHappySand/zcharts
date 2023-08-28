module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', '@vue/airbnb'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'comma-dangle': 'off',
    'arrow-parens': 'off',
    'indent': 'off',
    'class-methods-use-this': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'guard-for-in': 'off',
    'no-restricted-syntax': 'off',
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never'
    }],
    "linebreak-style": 'off',
  },
};
