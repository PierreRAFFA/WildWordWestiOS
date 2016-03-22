var Board   = require('./board.js');
var EventEmitter = require('events').EventEmitter;
var accounts = require('../../app/controllers/accounts.server.controller');

/**
 * Module exports.
 */

module.exports = Game;
////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// CONSTRUCTOR
function Game(numColumns, numRows, locale, platform, gameCenterId, name, avatar)
{
    /**
     * UUID send by the application ( Apple GameCenter, GooglePlay )
     */
    this._gameCenterId = gameCenterId;
    this._platform = platform;

    /**
     * Locale chosen by the player at start
     */
    this._locale = locale;

    /**
     * Game Board Model
     */
    this._board;

    this._updateAccount(platform, gameCenterId, name, avatar);

    this._createBoard(locale, numColumns, numRows);
}
// inherit events.EventEmitter
Game.prototype = Object.create(EventEmitter.prototype);
Game.prototype.constructor = Game;
////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// IDENTIFY USER
/**
 * Check if the user exists, otherwise we add him
 * @param uuid
 * @private
 */
Game.prototype._updateAccount = function(platform, gameCenterId, name, avatar)
{
    console.log('_updateAccount');

    var params = {
        platform: platform,
        gameCenterId: gameCenterId,
        name: name,
        avatar: avatar
    }
    accounts.createOrUpdate(params, function(success) {

        console.log('success');
        console.log(success);
    });
}
////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// CREATE BOARD
Game.prototype._createBoard = function(locale, numColumns, numRows)
{
    this._board = new Board(locale, numColumns, numRows);
    this._board.on('gameOver' , this._onGameOver.bind(this));

}

////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
/**
 * Auto-save the statistics if the account already exists.
 * Otherwise, wait for client-side to get the user name/email (createAccountAndSaveScore)
 *
 * @private
 */
Game.prototype._onGameOver = function()
{
    console.log('_onGameOver');
    this._saveStatistics();
}
////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// CREATE ACCOUNT
///**
// * Create an account, then save the statistics.
// *
// * @param name
// * @param email
// */
//Game.prototype.createAccountAndSaveScore = function(name, email)
//{
//    console.log('createAccountAndSaveScore');
//    var self = this;
//
//    var params = {
//        uuid: this._gameCenterId,
//        name: name,
//        email: email,
//        selectedLocale: this._locale
//    };
//
//    accounts.create(params, function(success) {
//
//        console.log(success);
//
//        if (success)
//        {
//            self._saveStatistics();
//        } else {
//            //@TODO
//        }
//    });
//}
////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// SAVE SCORE
/**
 * Saves the statistics of the user.
 * May create a new account if the uuid is unknown.
 * The new account is inactive until it is activated by the confirmation email
 *
 * @private
 */
Game.prototype._saveStatistics = function()
{
    var self = this;

    var params = {
        platform: this._platform,
        gameCenterId: this._gameCenterId,
        locale: this._locale,
        time: this._board.getScore(),
        points: this._board.getTotalPointsWon(),
        highestWord: this._board.getHighestWord(),
        highestWordPoints: this._board.getHighestWordPoints()
    };

    //create the account if needed
    console.log('params' , params);
    console.log('this._gameCenterId:' , this._gameCenterId);
    console.log('this._platform:' , this._platform);
    accounts.findByGameCenterId(this._platform, this._gameCenterId , function(account)
    {
        console.log('account');
        console.log(account);

        if (account)
        {
            self._doSaveStatistics(params);
        }else{
            accounts.create(params, function(success) {

                console.log(success);

                if (success)
                {
                    self._doSaveStatistics(params);
                } else {
                    //@TODO
                }
            });
        }
    });

}

Game.prototype._doSaveStatistics = function(params)
{
    var self = this;
    console.log('_doSaveStatistics');
    console.log(params);

    accounts.saveStatistics(params, function(result)
    {
        self.emit('statisticsSaved', result);
    });
}
////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// GETTER
Game.prototype.getBoard = function()
{
    return this._board;
}