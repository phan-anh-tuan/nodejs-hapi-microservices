'use strict';
const Async = require('async');
const Boom = require('boom');
const nconf = require('nconf');


const internals = {};


internals.applyStrategy = function (server, next) {

    const Session = server.plugins['hapi-mongo-models'].Session;
    const User = server.plugins['hapi-mongo-models'].User;

    server.auth.strategy('session', 'cookie', {
        password: nconf.get('cookieSecret'),
        cookie: 'sid-ntrr',
        isSecure: false,
        isHttpOnly: false,
        redirectTo: '/signin',
        appendNext: 'returnUrl',
        validateFunc: function (request, data, callback) {

            Async.auto({
                session: function (done) {

                    const id = data.session._id;
                    const key = data.session.key;

                    Session.findByCredentials(id, key, done);
                },
                user: ['session', function (results, done) {

                    if (!results.session) {
                        return done();
                    }

                    User.findById(results.session.userId, done);
                }],
                roles: ['user', function (results, done) {

                    if (!results.user) {
                        return done();
                    }

                    results.user.hydrateRoles(done);
                }],
                scope: ['user', function (results, done) {

                    if (!results.user || !results.user.roles) {
                        return done();
                    }

                    done(null, Object.keys(results.user.roles));
                }]
            }, (err, results) => {
                const onlines = server.plugins['login'].onlines
                if (err) {
                    return callback(err);
                }

                if (!results.session) {
                    if (!request.auth.isAuthenticated && onlines.has(results.user._id.toString())) {
                        //onlines.delete(results.user._id.toString())
                        server.plugins['login'].delete(results.user._id.toString())
                    }
                    return callback(null, false);
                }
               
                if (request.auth.isAuthenticated && !onlines.has(results.user._id.toString())) {
                    //onlines.set(results.user._id.toString(),results.user.username)
                    console.log(`auth.js why i am here ${results.user._id.toString()} ${results.user.username}`)
                    console.log(request)
                    server.plugins['login'].set(results.user._id.toString(),results.user.username)
                }
                callback(null, Boolean(results.user), results);
            });
        }
    });


    next();
};


internals.preware = {
    ensureNotRoot: {
        assign: 'ensureNotRoot',
        method: function (request, reply) {

            if (request.auth.credentials.user.username === 'root') {
                const message = 'Not permitted for root user.';

                return reply(Boom.badRequest(message));
            }

            reply();
        }
    },
    ensureAdminGroup: function (groups) {

        return {
            assign: 'ensureAdminGroup',
            method: function (request, reply) {

                if (Object.prototype.toString.call(groups) !== '[object Array]') {
                    groups = [groups];
                }

                const groupFound = groups.some((group) => {

                    return request.auth.credentials.roles.admin.isMemberOf(group);
                });

                if (!groupFound) {
                    const message = `Missing admin group membership to [${groups.join(' or ')}].`;

                    return reply(Boom.badRequest(message));
                }

                reply();
            }
        };
    }
};


exports.register = function (server, options, next) {

    server.dependency(['hapi-mongo-models'], internals.applyStrategy);

    next();
};


exports.preware = internals.preware;


exports.register.attributes = {
    name: 'auth'
};
