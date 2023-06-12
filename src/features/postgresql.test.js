const feature = require('./postgresql');
const {
  itHasValidMeta,
  inProvidesEnvVars,
  itDeclaresDependencies,
  itDeclaresDevDependencies,
  itProvidesServiceConfiguration,
} = require('../utils/test/feature');
const { createExtensionInput } = require('../utils/test/mocks');

describe('postgresql', () => {
  itHasValidMeta(feature);

  describe('output', () => {
    const input = createExtensionInput();
    const output = feature.output(input);

    inProvidesEnvVars(output.envVars, [
      'PGHOST',
      'PGPORT',
      'PGUSER',
      'PGPASSWORD',
      'PGDATABASE',
    ]);

    itDeclaresDependencies(output.dependencies, ['pg']);

    itDeclaresDevDependencies(output.devDependencies, ['@types/pg']);

    itProvidesServiceConfiguration(output.dockerComposeServices, ['db']);
  });
});
