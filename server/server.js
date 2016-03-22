//'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
    http = require('http'),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

// Init the express application
var app = require('./config/express')(mongoose.connection);

// Socket initialisation
var server = http.Server(app);
server.listen(config.port);
//var io = require('socket.io')(server);

//create the socket and link to the server
require("./config/socket").setServer(server);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
//app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);