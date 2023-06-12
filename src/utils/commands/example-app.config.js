const features = require('./features');
const language = require('./language');
const postgresql = require('../../features/postgresql');

module.exports = {
  projectLanguage: language.TS,
  db: postgresql.meta.id,
  features
};
