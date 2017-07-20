'use strict';
/**
 * boom provides a set of utilities for returning HTTP errors. 
 * https://www.npmjs.com/package/boom
 */
const Boom = require('boom');
/**
 * This is joi, joi allows you to create blueprints or 
 * schemas for JavaScript objects (an object that stores information) 
 * to ensure validation of key information.
 * https://www.npmjs.com/package/joi
 */
const Joi = require('joi');
const Async = require('async');

const internals = {};

internals.applyRoutes = function(server,next) {
    const User = server.plugins['hapi-mongo-models'].User;

    server.route({
            method: 'POST',
            path: '/user',
            config: {
                validate: {
                    payload: {
                        name: Joi.string().required(),
                        email: Joi.string().email().lowercase().required(),
                        username: Joi.string().token().lowercase().required(),
                        password: Joi.string().required()
                    },
                },
                pre: [{
                        assign: 'usernameCheck',
                        method: function (request, reply) {

                            const conditions = {
                                username: request.payload.username
                            };

                            User.findOne(conditions, (err, user) => {

                                if (err) {
                                    return reply(err);
                                }

                                if (user) {
                                    return reply(Boom.conflict('Username already in use.'));
                                }

                                reply(true);
                            });
                        }
                    }, 
                    {
                        assign: 'emailCheck',
                        method: function (request, reply) {
                            const conditions = {
                                email: request.payload.email
                            };

                            User.findOne(conditions, (err, user) => {

                                if (err) {
                                    return reply(err);
                                }

                                if (user) {
                                    return reply(Boom.conflict('Email already in use.'));
                                }

                                reply(true);
                            });
                        }
                    }],
                description: 'Create a user' ,
                tags: ['api']
            },
            handler: function(request, reply) {
                Async.auto({
                    user: function(done) {
                        const username = request.payload.username;
                        const password = request.payload.password;
                        const email = request.payload.email;

                        User.create(username, password, email, done);
                    }
                }, (error, results) => {
                    if (error) {
                        return reply(error);
                    }

            
                    const result = {
                        user: {
                            _id: results.user._id,
                            username: results.user.username,
                            email: results.user.email
                        },
                    };
                    reply(result);
                })
            }
    })

     server.route({
            method: 'POST',
            path: '/user/{id}',
            config: {
                validate: {
                    params: {
                        id: Joi.string().invalid('000000000000000000000000')
                    },
                    payload: {
                        username: Joi.string().token().lowercase().required(),
                        email: Joi.string().email().lowercase().required(),
                        isActive: Joi.boolean().required()
                    },
                },
                pre: [{
                        assign: 'usernameCheck',
                        method: function (request, reply) {

                            const username = request.payload.username
                            const id = request.params.id
                            const filter = {
                                username,
                                _id: { $ne: User._idClass(id)}
                            }
                            User.find(filter, (err, user) => {

                                if (err) {
                                    return reply(err);
                                }

                                if (!user) {
                                    return reply(Boom.conflict('Username already in use'));
                                }

                                reply(true);
                            });
                        }
                    },
                    {
                        assign: 'emailCheck',
                        method: function (request, reply) {

                            const email = request.payload.email
                            const id = request.params.id
                            const filter = {
                                email,
                                _id: { $ne: User._idClass(id)}
                            }
                            User.find(filter, (err, user) => {

                                if (err) {
                                    return reply(err);
                                }

                                if (!user) {
                                    return reply(Boom.conflict('Email already in use'));
                                }

                                reply(true);
                            });
                        }
                    },
                ],
                description: 'Update a user' ,
                tags: ['api']
            },
            handler: function(request, reply) {
                const id = request.params.id
                const username = request.payload.username
                const email = request.payload.email
                const isActive = request.payload.isActive
                const update = {
                                $set: {
                                    username,
                                    email,
                                    isActive
                                }};
                User.findByIdAndUpdate(id,update,(err,user) => {
                    if (err) {
                        reply(err);
                    }
                    if (!user) {
                        return reply(Boom.notFound('Document not found.'));
                    }
                    reply(user);
                })
            }
    })

    server.route({
            method: 'POST',
            path: '/login',
            config: {
                validate: {
                    payload: {
                        username: Joi.string().lowercase().required(),
                        password: Joi.string().required()
                    },
                },
                pre: [{
                        assign: 'user',
                        method: function (request, reply) {

                            const username = request.payload.username
                            const password = request.payload.password

                            User.findByCredentials(username, password, (err, user) => {

                                if (err) {
                                    return reply(err);
                                }

                                if (!user) {
                                    return reply(Boom.conflict('Invalid username or password'));
                                }

                                reply(user);
                            });
                        }
                    }],
                description: 'Authenticate a user' ,
                tags: ['api']
            },
            handler: function(request, reply) {
                if (request.pre.user) {
                    reply(request.pre.user);
                }
            }
    })
    next();
}

exports.register = function(server, options, next) {
    server.dependency('hapi-mongo-models', internals.applyRoutes);
    next();
}

//exports._internals = internals;

exports.register.attributes = {
    name: 'UserStore'
};