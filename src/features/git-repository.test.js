const feature = require('./git-repository');
const { itHasValidMeta, itCopiesAssets } = require('../utils/test/feature');
const { createExtensionInput } = require('../utils/test/mocks');

describe('git-repository', () => {
  itHasValidMeta(feature);

  describe('output', () => {
    const input = createExtensionInput();
    const output = feature.output(input);

    itCopiesAssets(output.assets, ['.gitignore']);
  });
});
