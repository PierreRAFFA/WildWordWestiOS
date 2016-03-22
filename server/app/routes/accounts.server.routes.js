'use strict';

/**
 * Module dependencies.
 */
var accounts = require('../../app/controllers/accounts.server.controller');

module.exports = function (app)
{
    app.route('/accounts/:locale/highest/time')
        .get(accounts.getHighestTime);

    app.route('/accounts/:platform/:gameCenterId')
        .get(accounts.read);

    // Finish by binding the account middleware
    //app.param(['platform','gameCenterId'], accounts.accountByGameCenterId);
};