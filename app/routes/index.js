const merchantRoute = require('./merchant');

module.exports = function(app, db) {
  merchantRoute(app, db);
  // Other route groups could go here, in the future
};