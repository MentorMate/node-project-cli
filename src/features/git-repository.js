module.exports = {
  meta: {
    id: 'git-repository',
    name: 'Git Repository',
  },
  dependencies: {
    os: {
      path: ['git'],
    },
  },
  output: () => ({
    commands: ['git init', 'git checkout -b main'],
    assets: [
      {
        source: 'git/gitignore',
        target: '.gitignore',
      },
    ],
  }),
};
