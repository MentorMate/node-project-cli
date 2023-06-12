module.exports = {
  meta: {
    id: 'markdown-lint',
    name: 'Markdown Lint',
  },
  output: () => ({
    scripts: {
      'lint:markdown': 'markdownlint **/*.md --ignore node_modules',
    },
    devDependencies: {
      'markdownlint-cli': '~0.34.0',
    },
  }),
};
