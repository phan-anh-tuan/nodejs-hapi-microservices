'use strict'
const MongoModels = require('mongo-models')
const Bcrypt = require('bcrypt')
const Async = require('async')
const Joi =  require('joi')

class User extends MongoModels {
    constructor(attrs) {
         super (attrs)
    }
    
    static generatePasswordHash(password, callback) {
        Async.auto({
            salt: function(done) {
                    Bcrypt.genSalt(10, done);
                },
            hash: ['salt', function(result, done) {
                Bcrypt.hash(password, result.salt, done);
            }]
        }, (error, results) => {
            if (error) {
                callback(error)
            }
            callback(null, { password, hash: results.hash})
        })
    }

    static create(username, password, email, callback) {
        Async.auto({
            passwordHash: this.generatePasswordHash.bind(this,password),
            newUser: ['passwordHash', function(results,done) {
                        const document = {
                            isActive: true,
                            username: username.toLowerCase(),
                            password: results.passwordHash.hash,
                            email: email.toLowerCase(),
                            timeCreated: Date.now()
                        } 

                        User.insertOne(document, done);
                    }]
        }, (error, results) => {
            if (error) {
                callback(error);
            }
            results.newUser[0].password = results.passwordHash.password;
            callback(null, results.newUser[0]);
        })
    }

    static findByCredentials(username,password,callback) {
        Async.auto({
            user: function(done) {
                    const filter = { isActive: true };
                    if (username.indexOf('@') > -1) {
                        filter.email = username
                    } else {
                        filter.username = username
                    }
                    User.findOne(filter,done)
                },
            passwordMatch: ['user', function(result,done) {
                    if (!result.user) {
                        return done(null, false)
                    }

                    const source = result.user.password;
                    Bcrypt.compare(password, source, done);
                }]
        }, (error,results) => {
            if (error) {
                return callback(error)
            }
            if (results.passwordMatch) {
                return callback(null, results.user);
            }
            callback();
        })
    }
}

User.collection = 'users';

User.schema = Joi.object().keys({
    _id: Joi.object(),
    isActive: Joi.boolean().default(true),
    username: Joi.string().token().lowercase().required(),
    password: Joi.string(),
    email: Joi.string().email().lowercase().required(),
    roles: Joi.object().keys({
                admin: Joi.object().keys({
                            id: Joi.string().required(),
                            name: Joi.string().required()
                        }),
                account: Joi.object().keys({
                            id: Joi.string().required(),
                            name: Joi.string().required()
                        })
            }),
    resetPassword: Joi.object().keys({
                        token: Joi.string().required(),
                        expires: Joi.date().required()
                    }),
    timeCreated: Joi.date()
});

User.indexes = [
    {
        key: { username:1, unique: 1}
    },
    {
        key: { email:1, unique: 1}
    }
];

module.exports = User;