module.exports = {
  '*.js': [
    'prettier --write',
    'eslint --fix'
  ],
  '*.md': 'prettier --write',
  'package.json': 'sort-package-json',
};
