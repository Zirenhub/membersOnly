const passport = require('passport');

exports.index = (req, res) => res.render('log-in-form');
exports.log_user = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/log-in',
});
