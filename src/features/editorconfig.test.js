const feature = require('./editorconfig');
const { itHasValidMeta, itCopiesAssets } = require('../utils/test/feature');
const { createExtensionInput } = require('../utils/test/mocks');

describe('editorconfig', () => {
  itHasValidMeta(feature);

  describe('output', () => {
    const input = createExtensionInput();
    const output = feature.output(input);

    itCopiesAssets(output.assets, ['.editorconfig']);
  });
});
