const feature = require('./license-checks');
const {
  itHasValidMeta,
  itDeclaresDevDependencies,
  itProvidesScripts,
  itCopiesAssets,
} = require('../utils/test/feature');
const { createExtensionInput } = require('../utils/test/mocks');

describe('license-checks', () => {
  itHasValidMeta(feature);

  describe('output', () => {
    const input = createExtensionInput();
    const output = feature.output(input);

    itProvidesScripts(output.scripts, [
      'license:check',
      'license:for-review',
      'license:summary',
    ]);

    itDeclaresDevDependencies(output.devDependencies, [
      'license-checker',
      'spdx-license-list',
    ]);

    itCopiesAssets(output.assets, [
      'licenses-allowed.js',
      'licenses-reviewed.js',
    ]);
  });
});
