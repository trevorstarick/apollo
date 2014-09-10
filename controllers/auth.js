/*jslint node: true */
'use strict';

var mongoose = require('mongoose'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10;

var conn = mongoose.createConnection('mongodb://localhost/users');
var Schema = mongoose.Schema;

// User Schema
var userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	}
});

// Seed a user
var User = conn.model('User', userSchema);

// Bcrypt middleware
userSchema.pre('save', function(next) {
	var user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		// hash the password along with our new salt
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

// PassportJS serialization methods
passport.serializeUser(function(user, done) {
	done(null, user.email);
});

passport.deserializeUser(function(email, done) {
	User.findOne({
		email: email
	}, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy({
		usernameField: 'email'
	}, function(username, password, done) {
		User.findOne({
			username: username
		}, function(err, user) {
			if (err) {
				return done(err);
			}
			
			if (!user) {
				return done(null, false, {
					message: 'Unknown user ' + username
				});
			}

			user.comparePassword(password, function(err, isMatch) {
				if (err) return done(err);
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {
						message: 'Invalid password'
					});
				}
			});
		});
	}));

module.exports = {
	authUser: passport,
	newUser: function(object) {
		new User(object).save();
	}
};