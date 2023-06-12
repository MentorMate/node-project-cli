const feature = require('./markdown-lint');
const {
  itHasValidMeta,
  itDeclaresDevDependencies,
  itProvidesScripts,
} = require('../utils/test/feature');
const { createExtensionInput } = require('../utils/test/mocks');

describe('markdown-lint', () => {
  itHasValidMeta(feature);

  describe('output', () => {
    const input = createExtensionInput();
    const output = feature.output(input);

    itProvidesScripts(output.scripts, ['lint:markdown']);

    itDeclaresDevDependencies(output.devDependencies, ['markdownlint-cli']);
  });
});
