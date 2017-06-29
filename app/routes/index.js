const merchantRoute = require('./merchant');
const patanjaliRoute = require('./patanjali');

module.exports = function(app, db) {
  merchantRoute(app, db);
  patanjaliRoute(app, db);
  // Other route groups could go here, in the future
};