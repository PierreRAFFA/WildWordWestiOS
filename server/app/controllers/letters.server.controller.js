'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	_ = require('lodash');

/**
 * Create a letter
 */
exports.create = function(req, res) {
	var letter = new Letter(req.body);
	letter.user = req.user;

	letter.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(letter);
		}
	});
};

/**
 * Show the current letter
 */
exports.read = function(req, res) {
	res.json(req.letter);
};

/**
 * Update a letter
 */
exports.update = function(req, res) {
	var letter = req.letter;

	letter = _.extend(letter, req.body);

	letter.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(letter);
		}
	});
};

/**
 * Delete an letter
 */
exports.delete = function(req, res) {
	var letter = req.letter;

	letter.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(letter);
		}
	});
};

/**
 * List of Letters
 */
exports.list = function(req, res, locale) {

	Letter.find().sort('-created').populate('user', 'displayName').exec(function(err, letters) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(letters);
		}
	});
};

exports.promiseList = function(locale)
{

    var Letter = require("../models/letter.server.model")(locale);
    return Letter.find();
}

/**
 * Letter middleware
 */
exports.letterByID = function(req, res, next, id) {
	Letter.findById(id).populate('user', 'displayName').exec(function(err, letter) {
		if (err) return next(err);
		if (!letter) return next(new Error('Failed to load letter ' + id));
		req.letter = letter;
		next();
	});
};

/**
 * Letter authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.letter.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};