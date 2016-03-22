/**
 * Module exports.
 */

module.exports = Block;

/**
 * Block constructor.
 *
 * @param { locale}
 * @param {numColumns}
 * @param {numRows}
 */
function Block(letter,type)
{
    this._letter = letter;
    this._type = type;
}

Block.prototype.getLetter = function()             { return this._letter; }
Block.prototype.setLetter = function(value)        { this._letter = value; }

Block.prototype.getType = function()               { return this._type; }

//Block.prototype.getSynchronized = function()       { return this.mSynchronized; }
//Block.prototype.setSynchronizedTrue = function()   { this.mSynchronized = true; }

Block.prototype.getColumn = function()
{
    return 0;
}
Block.prototype.getRow = function()
{
    return 0;
}