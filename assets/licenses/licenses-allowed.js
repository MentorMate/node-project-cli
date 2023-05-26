const spdxLicenses = require('spdx-license-list');

const separator = process.argv[2];

const osiApprovedLicenses = Object.entries(spdxLicenses)
  .filter(([, value]) => value.osiApproved)
  .map(([k]) => k);

const reviewedLicenses = require('./licenses-reviewed');

console.log(osiApprovedLicenses.concat(reviewedLicenses).join(separator));
