module.exports = {
  '*.js': [
    'prettier --write',
    'eslint --fix'
  ],
  'package.json': 'sort-package-json',
};
