'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * WeaponLevel Schema
 * @type {mongoose.Schema}
 */
var WeaponLevelSchema = new Schema({
    level: Number,
    value: Number
});

/**
 * Weapon Schema
 * @type {mongoose.Schema}
 */
var WeaponSchema = new Schema({
    name: String,
    levels: [WeaponLevelSchema]
});
mongoose.model('Weapon', WeaponSchema);

