const fs = require('fs');
const path = require('path');

const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8'),
);

module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    'prettier/prettier': ['error', prettierOptions],
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-await-in-loop': 0,
    'no-use-before-define': 0,
    'no-restricted-syntax': 0,
    'global-require': 0,
    'func-names': 'off',
    'object-shorthand': 'off',
    'consistent-return': 'off',
    'spaced-comment': 'off',
    'no-return-await': 'off',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-unused-vars': ['error', { argsIgnorePattern: 'req|res|next|val' }],
  },
  globals: {},
};
