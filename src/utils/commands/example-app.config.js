const getFeatures = require('./features');

module.exports = (isPip3Avaialble) => ({
  framework: 'express',
  projectLanguage: 'TS',
  db: 'pg',
  features: getFeatures(isPip3Avaialble)
});
