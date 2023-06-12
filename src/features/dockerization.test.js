const feature = require('./dockerization');
const {
  itHasValidMeta,
  itProvidesScripts,
  itRendersTemplates,
} = require('../utils/test/feature');
const { createExtensionInput } = require('../utils/test/mocks');

describe('dockerization', () => {
  itHasValidMeta(feature);

  describe('output', () => {
    const input = createExtensionInput();
    const output = feature.output(input);

    itProvidesScripts(output.scripts, [
      'image:build',
      'image:run',
      'lint:dockerfile',
    ]);

    itRendersTemplates(output.templates, ['Dockerfile', '.dockerignore']);
  });
});
