module.exports = {
  '*.js': [
    'prettier --write',
    'eslint --fix'
  ],
  '*.md': [
    'prettier --write',
    'markdownlint --fix'
  ],
  'package.json': 'sort-package-json',
};
