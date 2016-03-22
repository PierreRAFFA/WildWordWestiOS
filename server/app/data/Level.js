/**
 * Module exports.
 */

module.exports = Level;

/**
 * Level constructor.
 *
 * @param { index} level index 0...4
 * @param {decrementPoints} number of points to decrease each ms
 * @param {minPoints} minimum number of points to access to the level
 */
function Level(index,decrementPoints, minPoints)
{
    this.index             = index;
    this.decrementPoints   = decrementPoints;
    this.minPoints         = minPoints;
}

Level.prototype.getIndex = function()               { return this.index; }
Level.prototype.getDecrementPoints = function()     { return this.decrementPoints; }
Level.prototype.getMinPoints = function()           { return this.minPoints; }