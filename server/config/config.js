var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  var config = require('./config.json');
  var envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[ key ] = envConfig[ key ];
  });
} else {
  process.env.MONGODB_URI = 'mongodb://heroku_6zrgk8xg:CUrocOnjohahum5@ds111922.mlab.com:11922/heroku_6zrgk8xg'
}
