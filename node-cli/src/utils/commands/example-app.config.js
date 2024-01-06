const getFeatures = require('./features');

module.exports = (framework, isPip3Avaialble) => ({
  framework,
  projectLanguage: 'TS',
  features: getFeatures(isPip3Avaialble)
});
