'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Platform Schema
 * @type {mongoose.Schema}
 */
var UserPlatformSchema = new Schema({
    gameCenterId: { type: String, default: '', require: true},
    name: { type: String, default: '', require: true},
    avatar: { type: String, default: ''},
    version: { type: String, default: '', require: true}
});
mongoose.model('UserPlatformSchema', UserPlatformSchema);

/**
 * Statistics Schema
 * @type {mongoose.Schema}
 */
var StatisticsSchema = new Schema({
    highestTime:        { type: Number, default: 0},
    highestWord:        { type: String, default: ''},
    highestWordPoints:  { type: Number, default: 0},
    totalNumLetters:    { type: Number, default: 0},
    totalNumWords:      { type: Number, default: 0},
    totalNumGames:      { type: Number, default: 0},
    totalTime:          { type: Number, default: 0},
    totalPoints:        { type: Number, default: 0},
});
mongoose.model('Statistics', StatisticsSchema);
/**
 * Account Schema
 * @type {mongoose.Schema}
 */
var AccountSchema = new Schema({
    name: String,
    platforms: {
        ios: UserPlatformSchema,
        android: UserPlatformSchema
    },
    email: String,
    selectedLocale: String,
    level: { type: Number, default: 1},
    statistics: {
        en_GB: StatisticsSchema,
        fr_FR: StatisticsSchema,
    },
    achievements: { type: Number, default: 0}, //@TODO
    weapons: {
        numBombs: { type: Number, default: 7},
        numNitros: { type: Number, default: 3},
        numFreezes: { type: Number, default: 3},
        numBonusMultipliers: { type: Number, default: 2},
        numRecycles: { type: Number, default: 0},
    },
    balance: { type: Number, default: 0},
    activationCode: String,
    active : { type: Boolean, default: false},
    token: String,
    premium: Boolean,
    numGamesRemainingPerDay: { type: Number, default: 5},
});



AccountSchema.statics.findByGameCenterId = function(platform, gameCenterId, callback)
{
    var clauses = {};
    clauses['platforms.' + platform + '.gameCenterId'] = gameCenterId;
    return this.findOne(clauses , callback);
}
mongoose.model('Account', AccountSchema);

