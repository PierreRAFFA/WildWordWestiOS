var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Letter = mongoose.Schema({
    letter: String,
    frequency: Number
});

module.exports = function(locale)
{
    var tableName = locale.toLowerCase().replace("_" , "-") + "-letters";
    return mongoose.model('Letter', Letter , tableName);
}

