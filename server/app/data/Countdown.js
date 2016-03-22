var events      = require('events');
var EventEmitter = require('events').EventEmitter;

/**
 * Module exports.
 */

module.exports = Countdown;
////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
/**
 * Countdown constructor.
 *
 * @param {points} start points
 */
function Countdown(points)
{
    /**
     * Specifies if the countdown is running
     * @type {boolean}
     */
    this.mRunning = false;

    /**
     * start points
     * @type {number}
     */
    this.mPoints                    = points;

    /**
     * Number of points to decrement each milliseconds
     * @type {number}
     */
    this.mDecrementPoints           = 0;

    /**
     * Start Date
     * @type {Date}
     */
    this.mStartDate                 = new Date();

    /**
     * The last date where the points have been updated
     * @type {Date}
     */
    this.mPointsModificationDate    = new Date();

    /**
     * Timeout called to decrease the points
     * @type {null}
     */
    this.mTimeout = null;

}
// inherit events.EventEmitter
Countdown.prototype = Object.create(EventEmitter.prototype);
////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
Countdown.TIME_THRESHOLD = .8;
////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
Countdown.prototype.start = function()
{
    console.log("start");
    this.mRunning = true;
    this.mStartDate = new Date();
    this.decrementPoints();
}
////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// ADD POINTS
Countdown.prototype.addPoints = function(points)
{
    console.log("addPoints:"+points)
    this.mPoints += points;
    console.log("this.mPoints:"+this.mPoints);
}
////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// DECREMENT POINTS
/**
 * Decrements points depending on the current level with the optimized way ( TIME_THRESHOLD )
 * @return void
 */
Countdown.prototype.decrementPoints = function()
{
    //time in ms
    var lTimeBeforeGameOver = this.mPoints / this.mDecrementPoints;
    console.log("=================================");
    console.log("lTimeBeforeGameOver:"+lTimeBeforeGameOver);
    var lNextIntervalTime = lTimeBeforeGameOver * Countdown.TIME_THRESHOLD;
    console.log("lNextIntervalTime:"+lNextIntervalTime);



    if ( lNextIntervalTime < 100)
    {
        //get game duration
        var lCountdownTime = new Date() - this.mStartDate + lNextIntervalTime;
        console.log("lCountdownTime:"+lCountdownTime);

        //emit complete
        this.emit("complete" , lCountdownTime);
    }else{

        if ( this.mTimeout)
        {
            console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
            console.log(this.mTimeout);
        }
        //lNextIntervalTime = 500;
        this.mTimeout = setTimeout(this.doDecrementPoints.bind(this) , lNextIntervalTime);
    }
}

Countdown.prototype.doDecrementPoints = function(enableLoop)
{
    console.log("doDecrementPoints");
    this.mTimeout = null;

    //compute precisely the number of points to remove ( date1 - date2 )
    var lPointsToRemove = (new Date() - this.mPointsModificationDate) * this.mDecrementPoints;

    console.log("========================");
    console.log("this.mPoints:"+this.mPoints);
    console.log("lPointsToRemove:"+lPointsToRemove);
    console.log("========================");

    //remove the points
    this.mPoints -= lPointsToRemove;

    //update the points modification date
    this.mPointsModificationDate = new Date();

    //decrement points again
    //console.log("enableLoop:"+enableLoop);

    if ( enableLoop !== false)
        this.decrementPoints();
}
////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
Countdown.prototype.setDecrementPoints = function(value)
{
    console.log("setDecrementPoints");

    if ( this.mRunning)
    {
        //clear the timeout
        clearTimeout(this.mTimeout);

        //force to remove points of the current time and block the loop
        this.doDecrementPoints(false);

        //update the decrement points
        this.mDecrementPoints = value;

        //relaunch the countdown with the new decrement points
        this.decrementPoints();

    }else{
        this.mDecrementPoints = value;
    }
}
Countdown.prototype.getPoints = function()
{
    return this.mPoints;
}