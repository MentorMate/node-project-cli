const feature = require('./audit-github-workflow');
const { itHasValidMeta, itCopiesAssets } = require('../utils/test/feature');
const { createExtensionInput } = require('../utils/test/mocks');

describe('audit-github-workflow', () => {
  itHasValidMeta(feature);

  describe('output', () => {
    const input = createExtensionInput();
    const output = feature.output(input);

    itCopiesAssets(output.assets, ['.github/workflows/audit.yaml']);
  });
});
