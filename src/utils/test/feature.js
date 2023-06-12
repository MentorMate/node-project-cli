const itHasValidMeta = (feature) => {
  describe('meta', () => {
    it('should be an object', () => {
      expect(typeof feature.meta).toBe('object');
    });

    const metaFields = [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
    ];

    it.each(metaFields)(
      'should have a field "$name" of type "$type"',
      ({ name, type }) => {
        // eslint-disable-next-line security/detect-object-injection
        const value = feature.meta[name];
        expect(typeof value).toBe(type);
        expect(value.length).toBeGreaterThan(0);
      }
    );
  });
};

const inProvidesEnvVars = (envVars, names) => {
  describe('envVars', () => {
    it('should be an object', () => {
      expect(typeof envVars).toBe('object');
    });

    it.each(names)('should have env var "%s"', (envVar) => {
      expect(envVars).toHaveProperty(envVar);
    });
  });
};

const itProvidesScripts = (scripts, names) => {
  describe('scripts', () => {
    it('should be an object', () => {
      expect(typeof scripts).toBe('object');
    });

    it.each(names)('should have a field "%s"', (name) => {
      expect(scripts).toHaveProperty(name);
    });
  });
};

const itDeclaresDependencies = (dependencies, names) => {
  describe('dependencies', () => {
    it('should be an object', () => {
      expect(typeof dependencies).toBe('object');
    });

    it.each(names)('should declare dependency on "%s"', (name) => {
      expect(dependencies).toHaveProperty(name);
    });
  });
};

const itDeclaresDevDependencies = (devDependencies, names) => {
  describe('devDependencies', () => {
    it('should be an object', () => {
      expect(typeof devDependencies).toBe('object');
    });

    it.each(names)('should declare dev dependency on "%s"', (name) => {
      expect(devDependencies).toHaveProperty(name);
    });
  });
};

const itRendersTemplates = (templates, targets) => {
  describe('templates', () => {
    it('should be an array', () => {
      expect(Array.isArray(templates)).toBe(true);
    });

    it.each(targets)('should contain a template "%s"', (target) => {
      const template = templates.find((template) => template.target === target);
      expect(template).toBeDefined();
    });
  });
};

const itCopiesAssets = (assets, targets) => {
  describe('assets', () => {
    it('should be an array', () => {
      expect(Array.isArray(assets)).toBe(true);
    });

    it.each(targets)('should contain an asset "%s"', (target) => {
      const asset = assets.find((asset) => asset.target === target);
      expect(asset).toBeDefined();
    });
  });
};

const itProvidesServiceConfiguration = (services, names) => {
  describe('services', () => {
    it('should be an object', () => {
      expect(typeof services).toBe('object');
    });

    it.each(names)('should provide service configuration for "%s"', (name) => {
      expect(services).toHaveProperty(name);
    });
  });
};

module.exports = {
  itHasValidMeta,
  inProvidesEnvVars,
  itProvidesScripts,
  itDeclaresDependencies,
  itDeclaresDevDependencies,
  itRendersTemplates,
  itCopiesAssets,
  itProvidesServiceConfiguration,
};
