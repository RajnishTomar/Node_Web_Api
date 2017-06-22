const merchantRoute = require('./merchant');
//const utilityRoute = require('./utility');

module.exports = function(app, db) {
  merchantRoute(app, db);
  //utilityRoute(app, db);
  // Other route groups could go here, in the future
};