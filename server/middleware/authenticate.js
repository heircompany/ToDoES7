var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  //fetch custom header for JWT
  var token = req.header('x-auth');
  //model methods on User - User.findByToken
  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};
