module.exports = {
  meta: {
    id: 'editorconfig',
    name: 'Editorconfig',
  },
  output: () => ({
    assets: [
      {
        source: '.editorconfig',
        target: '.editorconfig',
      },
    ],
  }),
};
