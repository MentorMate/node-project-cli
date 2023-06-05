const getFeatures = require('./features');

module.exports = (framework, isPip3Avaialble) => ({
  framework,
  projectLanguage: 'TS',
  db: 'pg',
  features: getFeatures(isPip3Avaialble)
});
