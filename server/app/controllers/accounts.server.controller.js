'use strict';

var locales = ['en_GB' , 'fr_FR'];

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Account = mongoose.model('Account'),
    Level = mongoose.model('Level'),
    Statistics = mongoose.model('Statistics'),
    _ = require('lodash');


//////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////Exposed for API
/**
 * Returns some info about the account
 * @param req
 * @param res
 */
exports.read = function (req, res) {

    var account = null;
    console.log(req.params);

    exports.findByGameCenterId(req.params.platform, req.params.gameCenterId, function(account)
    {
        if (!account)
        {
            account = new Account(req.params);
            console.log('create account');
        }

        console.log(account);

        var totalPoints = 0;

        for (var i = 0; i < locales.length; i++) {
            var locale = locales[i];

            if (account.statistics[locale])
            {
                console.log(account.statistics[locale]);
                totalPoints += account.statistics[locale].totalPoints;
            }
        }

        Level.getLevelPercent(totalPoints, function(levelPercent)
        {
            res.json({
                name: account.name,
                platform: account.platforms[req.params.platform],
                statistics: account.statistics,
                level: account.level,
                levelPercent: levelPercent,
                balance: account.balance,
                selectedLocale: account.selectedLocale,
                weapons: account.weapons,
                active: account.active
            });
        });
    });
}

exports.getHighestTime = function (req, res) {

    if (req.params.hasOwnProperty('locale'))
    {
        var localeStatisticsField = 'statistics.' + req.params.locale;

        var clauses = {};
        clauses[localeStatisticsField] = { $exists: true };
        //clauses.active = true;
        console.log(clauses);

        var select = '-_id name platforms ' + localeStatisticsField + '.highestTime';
        console.log(select);

        var sort = {};
        sort[localeStatisticsField + '.highestTime'] = -1;
        console.log(sort);

        Account
            .find(clauses)
            .select(select)
            .sort(sort)
            .limit(30)
            .exec(function(err, accounts) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

                var json = [];
                _.forEach(accounts, function(account)
                {
                    json.push({
                        name: account.name,
                        highestTime:  account.statistics[req.params.locale].highestTime,
                        avatar: account.platforms.ios.avatar, // @TODO because the platform name is hardcoded as 'ios'
                    });
                });

                res.json(json);
            }
        });
    }else{
        res.json({});
    }

}


/**
 * Article middleware
 */
exports.accountByGameCenterId = function(req, res, next, value) {
    console.log('value:'+value);
    Account.findByGameCenterId(platform, gameCenterId).exec(function(err, account) {
        if (err) return next(err);
        //if (!account) return next(new Error('Failed to load account ' + uuid));
        req.account = account;
        next();
    });
};
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// NOT Exposed for API
/**
 * Creates a new account
 *
 * @param params {uuid, name, email}
 * @param callback
 */
exports.create = function (params, callback)
{
    console.log('create');

    //check if an account with the same uuid was already created
    //@TODO check the name as well.
    Account.findByGameCenterId(params.platform, params.gameCenterId).exec(function(err, account)
    {
        if (!account)
        {
            var newAccount = new Account(params);
            newAccount.platforms[params.platform] = {
                gameCenterId: params.gameCenterId,
                name: params.name,
                avatar: params.avatar,
            };

            newAccount.save(function(err) {

                console.log('err');
                console.log(err);
                if (err) {
                    callback.call(null, false, errorHandler.getErrorMessage(err));
                } else {
                    callback.call(null, true);
                }
            });
        }
    });
};

exports.findByGameCenterId = function(platform, gameCenterId, callback)
{
    Account.findByGameCenterId(platform, gameCenterId).exec(function(err, account)
    {
        callback.call(null, account);
    });
};

/**
 * Creates an account with gameCenterId, platform and name or updated the account with potentially a new name
 * This name can be changed
 * @param params
 * @param callback
 */
exports.createOrUpdate = function(params, callback)
{
    console.log('createOrUpdate');
    console.log(params);
    if ( params.hasOwnProperty('platform') && params.hasOwnProperty('gameCenterId'))
    {
        Account.findByGameCenterId(params.platform, params.gameCenterId).exec(function(err, account)
        {
            //account does not exist
            if (!account)
            {
                exports.create(params, callback);
            }else{

                if ( params.hasOwnProperty('name'))
                {
                    //update the name for the specific platform
                    account.platforms[params.platform].name = params.name;
                    account.platforms[params.platform].avatar = params.avatar;

                    account.save(function(err)
                    {
                        if (err)
                        {
                            callback.call(null, false);
                        } else {
                            callback.call(null, true);
                        }
                    });
                }
            }
        });
    }else{
        callback.call(null, false);
    }
};

/**
 * Saves the statistics, update some account fields and calls the callback with an update as Object
 *
 * @param params { uuid, locale, time, points }
 * @param callback
 */
exports.saveStatistics = function(params, callback)
{
    console.log('saveStatistics');
    console.log(params);
    Account.findByGameCenterId(params.platform, params.gameCenterId).exec(function(err, account)
    {
        if (account)
        {
            //create the result for the callback
            var result = {};
            result.highestTimeImproved = false;

            //create locale statistics if not exists
            if (! account.statistics[params.locale])
            {
                //to preserve default values of Statistics
                var newStatistics = new Statistics();

                account.statistics[params.locale] = {
                    highestTime: newStatistics.highestTime,
                    highestWord: newStatistics.highestWord,
                    highestWordPoints: newStatistics.highestWordPoints,
                    totalPoints: newStatistics.totalPoints,
                }
            }

            //get localStatistics
            var localeStatistics = account.statistics[params.locale];

            //update highestTime if necessary
            if ( localeStatistics.highestTime < params.time)
            {
                if (localeStatistics.highestTime > 0)
                {
                    result.highestTimeImproved = true;
                }
                localeStatistics.highestTime = params.time;
            }

            //update bestWordPoints/bestWord
            if ( localeStatistics.highestWordPoints < params.highestWordPoints)
            {
                if (localeStatistics.highestWordPoints > 0)
                {
                    result.highestWordPointsImproved = true;
                }
                localeStatistics.highestWordPoints = params.highestWordPoints;
                localeStatistics.highestWord = params.highestWord;
            }

            //update numGamesPlayed
            localeStatistics.totalNumGames++;

            //update totalPoints
            localeStatistics.totalPoints += params.points;

            //update the general totalPoints
            account.totalPoints += params.points;

            //update balance
            var numCoinsWon = Math.round(params.points / 1000);
            account.balance += numCoinsWon;
            result.numCoinsWon = numCoinsWon;

            //update selectedLocale
            account.selectedLocale = params.locale;

            //update numGamesRemaining
            account.numGamesRemainingPerDay--;

            console.log(account);

            //save
            account.save(function(err)
            {
                if (err)
                {
                    console.log('not saved');
                    result.success = false;
                    result.error = errorHandler.getErrorMessage(err);
                } else {
                    console.log('saved');
                    result.success = true;
                }

                console.log(result);
                callback.call(null, result);
            });
        }
    });
}