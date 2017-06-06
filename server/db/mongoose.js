var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://heroku_6zrgk8xg:CUrocOnjohahum5@ds111922.mlab.com:11922/heroku_6zrgk8xg');

module.exports = { mongoose };
