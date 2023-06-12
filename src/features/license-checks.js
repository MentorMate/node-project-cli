module.exports = {
  meta: {
    id: 'license-checks',
    name: 'License Checks',
  },
  output: () => ({
    scripts: {
      'license:check':
        "license-checker --summary --excludePrivatePackages --onlyAllow $(node ./licenses-allowed.js ';') > /dev/null",
      'license:for-review':
        "license-checker --summary --excludePrivatePackages --exclude $(node ./licenses-allowed.js ',')",
      'license:summary': 'license-checker --summary',
    },
    devDependencies: {
      'license-checker': '^25.0.1',
      'spdx-license-list': '^6.6.0',
    },
    assets: [
      {
        source: 'licenses/licenses-allowed.js',
        target: 'licenses-allowed.js',
      },
      {
        source: 'licenses/licenses-reviewed.js',
        target: 'licenses-reviewed.js',
      },
    ],
  }),
};
