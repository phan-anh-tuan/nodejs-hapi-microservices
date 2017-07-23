'use strict';
const Async = require('async');
const Boom = require('boom');
const nconf = require('nconf'); //manage configuration in json file, see details at https://github.com/indexzero/nconf
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Account = server.plugins['hapi-mongo-models'].Account;
    const Session = server.plugins['hapi-mongo-models'].Session;
    const User = server.plugins['hapi-mongo-models'].User;


    server.route({
        method: 'POST',
        path: '/signup',
        config: {
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false //must set redirectTo: false when use with auth try mode, see details at https://github.com/hapijs/hapi-auth-cookie
                }
            },
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    email: Joi.string().email().lowercase().required(),
                    username: Joi.string().token().lowercase().required(),
                    password: Joi.string().required()
                }
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
            }, {
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
            description: 'Sign a user up' ,
            tags: ['api']
        },
        handler: function (request, reply) {

            const mailer = request.server.plugins.mailer;

            Async.auto({
                user: function (done) {

                    const username = request.payload.username;
                    const password = request.payload.password;
                    const email = request.payload.email;

                    User.create(username, password, email, done);
                },
                account: ['user', function (results, done) {

                    const name = request.payload.name;

                    Account.create(name, done);
                }],
                linkUser: ['account', function (results, done) {

                    const id = results.account._id.toString();
                    const update = {
                        $set: {
                            user: {
                                id: results.user._id.toString(),
                                name: results.user.username
                            }
                        }
                    };

                    Account.findByIdAndUpdate(id, update, done);
                }],
                linkAccount: ['account', function (results, done) {

                    const id = results.user._id.toString();
                    const update = {
                        $set: {
                            roles: {
                                account: {
                                    id: results.account._id.toString(),
                                    name: results.account.name.first + ' ' + results.account.name.last
                                }
                            }
                        }
                    };

                    User.findByIdAndUpdate(id, update, done);
                }],
                welcome: ['linkUser', 'linkAccount', function (results, done) {

                    const emailOptions = {
                        subject: 'Your NTRR account',
                        to: {
                            name: request.payload.name,
                            address: request.payload.email
                        },
                        replyTo: {
                            name: nconf.get('system:toAddress:name'),
                            address: nconf.get('system:toAddress:address')
                        }
                    };
                    const template = 'welcome';
                    const context = { username: request.payload.username, email: request.payload.email};
                    const taskDetail = {
                        type: 'email',
                        data: {
                                emailOptions: emailOptions,
                                template: template,
                                context: context
                            },
                        status: 'open'
                    };
                    server.plugins['TasksStore'].createTask(taskDetail,done);
                }],
                session: ['linkUser', 'linkAccount', function (results, done) {

                    Session.create(results.user._id.toString(), done);
                }]
            }, (err, results) => {

                if (err) {
                    return reply(err);
                }

                const user = results.linkAccount;
                const credentials = user.username + ':' + results.session.key;
                const authHeader = 'Basic ' + new Buffer(credentials).toString('base64');
                const result = {
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        roles: user.roles
                    },
                    session: results.session,
                    authHeader
                };

                request.cookieAuth.set(result);
                reply(result);
            });
        }
    });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['mailer', 'hapi-mongo-models', 'TasksStore'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'signup'
};
