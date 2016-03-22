'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Level Schema
 * @type {mongoose.Schema}
 */
var LevelSchema = new Schema({
    name: String,
    points: Number
});


LevelSchema.statics.getLevelPercent = function(points, callback)
{
    this.find({} , function(err, levels)
    {
        var currentLevel = levels.length - 1;
        if (currentLevel >= 0) {
            while(levels[currentLevel].points > points)
                currentLevel--;

            var currentLevelPoints = levels[currentLevel].points;
            var nextLevelPoints = levels[currentLevel+1].points;

            var a = 100 / (nextLevelPoints - currentLevelPoints);
            var b = - ( currentLevelPoints * 100) / (nextLevelPoints - currentLevelPoints);
            var levelPercent = a * points + b;
        }else{
            levelPercent = 0;
        }


        callback.call(null, levelPercent);
    });
}

mongoose.model('Level', LevelSchema);


