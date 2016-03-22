'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	_ = require('lodash');

/**
 * Create a word
 */
exports.create = function(req, res) {
	var word = new Word(req.body);
	word.user = req.user;

	word.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(word);
		}
	});
};

/**
 * Show the current word
 */
exports.read = function(req, res) {
	res.json(req.word);
};

/**
 * Update a word
 */
exports.update = function(req, res) {
	var word = req.word;

	word = _.extend(word, req.body);

	word.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(word);
		}
	});
};

/**
 * Delete an word
 */
exports.delete = function(req, res) {
	var word = req.word;

	word.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(word);
		}
	});
};

/**
 * List of Words
 */
exports.list = function(req, res) {
	Word.find().sort('-created').populate('user', 'displayName').exec(function(err, words) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(words);
		}
	});
};

/**
 * Word middleware
 */
exports.wordByID = function(req, res, next, id) {
	Word.findById(id).populate('user', 'displayName').exec(function(err, word) {
		if (err) return next(err);
		if (!word) return next(new Error('Failed to load word ' + id));
		req.word = word;
		next();
	});
};

exports.promiseWordByName = function(word, locale) {

    var Word = require("../models/word.server.model")(locale);
    return Word.findOne({cleanedWord:word});
};

/**
 * Word authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.word.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};