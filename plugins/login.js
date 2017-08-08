'use strict';
const Async = require('async');
const Bcrypt = require('bcrypt');
const Boom = require('boom');
const nconf = require('nconf');
const Joi = require('joi');
const AWS = require('aws-sdk');

const internals = {};


internals.applyRoutes = function (server, next) {

    const AuthAttempt = server.plugins['hapi-mongo-models'].AuthAttempt;
    const Session = server.plugins['hapi-mongo-models'].Session;
    const User = server.plugins['hapi-mongo-models'].User;


    server.route({
        method: 'POST',
        path: '/login',
        config: {
            validate: {
                payload: {
                    username: Joi.string().lowercase().required(),
                    password: Joi.string().required()
                }
            },
            pre: [{
                assign: 'abuseDetected',
                method: function (request, reply) {

                    const ip = request.info.remoteAddress;
                    const username = request.payload.username;

                    AuthAttempt.abuseDetected(ip, username, (err, detected) => {

                        if (err) {
                            return reply(err);
                        }

                        if (detected) {
                            return reply(Boom.badRequest('Maximum number of auth attempts reached. Please try again later.'));
                        }

                        reply();
                    });
                }
            }, {
                assign: 'user',
                method: function (request, reply) {

                    const username = request.payload.username;
                    const password = request.payload.password;

                    User.findByCredentials(username, password, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        reply(user);
                    });
                }
            }, {
                assign: 'logAttempt',
                method: function (request, reply) {

                    if (request.pre.user) {
                        return reply();
                    }

                    const ip = request.info.remoteAddress;
                    const username = request.payload.username;

                    AuthAttempt.create(ip, username, (err, authAttempt) => {

                        if (err) {
                            return reply(err);
                        }

                        return reply(Boom.badRequest('Username and password combination not found or account is inactive.'));
                    });
                }
            }, {
                assign: 'session',
                method: function (request, reply) {

                    Session.create(request.pre.user._id.toString(), (err, session) => {

                        if (err) {
                            return reply(err);
                        }

                        return reply(session);
                    });
                }
            }]
        },
        handler: function (request, reply) {

            const credentials = request.pre.session._id.toString() + ':' + request.pre.session.key;
            const authHeader = 'Basic ' + new Buffer(credentials).toString('base64');

            const result = {
                user: {
                    _id: request.pre.user._id,
                    username: request.pre.user.username,
                    email: request.pre.user.email,
                    roles: request.pre.user.roles
                },
                session: request.pre.session,
                authHeader
            };

            request.cookieAuth.set(result);
            /***********************************************************************************************************
                get AWS Cognito OpenID Connect Token that client component can use to exchange for temporary credential
            ************************************************************************************************************/
            AWS.config.update({region: 'ap-southeast-2'});
            AWS.config.apiVersions = {
                cognitoidentity: '2014-06-30',
                // other service API versions
            };
            /*
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'ap-southeast-2:e6f7fca1-bdf4-45dd-b783-951e03fa6c43',
            });
            */

            const cognitoidentity = new AWS.CognitoIdentity();
            const identityPoolId = 'ap-southeast-2:e6f7fca1-bdf4-45dd-b783-951e03fa6c43';
            var params = {
                IdentityPoolId: identityPoolId, /* required */
                Logins: { /* required */
                    'NTRR': JSON.stringify({id : request.pre.user._id,
                                            name: request.pre.user.name,
                                            email: request.pre.user.email,
                                            roles: request.pre.user.roles,
                                        }),
                },
                IdentityId: null 
            };
            cognitoidentity.getOpenIdTokenForDeveloperIdentity(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    console.log(`plugins/login.js retVal from getOpenIdTokenForDeveloperIdentity ${JSON.stringify(data)}`); 
                    /*
                    params = {
                        IdentityId: data.IdentityId, 
                        Logins: {
                            'cognito-identity.amazonaws.com': data.Token
                        }
                    };
*/


                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({

                        // either IdentityPoolId or IdentityId is required
                        // See the IdentityPoolId param for AWS.CognitoIdentity.getID (linked below)
                        // See the IdentityId param for AWS.CognitoIdentity.getCredentialsForIdentity
                        // or AWS.CognitoIdentity.getOpenIdToken (linked below)
                            IdentityPoolId: identityPoolId,
                            IdentityId: data.IdentityId,
                            // optional tokens, used for authenticated login
                            // See the Logins param for AWS.CognitoIdentity.getID (linked below)
                            Logins: {
                                'cognito-identity.amazonaws.com': data.Token
                            },
                        }, {
                        // optionally provide configuration to apply to the underlying service clients
                        // if configuration is not provided, then configuration will be pulled from AWS.config

                        // region should match the region your identity pool is located in
                        region: 'ap-southeast-2',

                        // specify timeout options
                        httpOptions: {
                            timeout: 100
                        }
                    });

/*
                    cognitoidentity.getCredentialsForIdentity(params, function(error, result) {
                        if (error) console.log(error, error.stack); // an error occurred
                        else     
                        {
                            const credentials = result.Credentials; 
*/
                            var albumBucketName = 'ntrr';
                            var s3 = new AWS.S3({
                                apiVersion: '2006-03-01',
                                params: {Bucket: albumBucketName},
//                                credentials: credentials
                            });

                            s3.listObjects({Prefix: 'emails'}, function(_err, _data) {
                                if (_err) {
                                    return console.log(_err, _err.stack)
                                } else {
                                    console.log(`plugins/login.js retVal from s3.listObjects ${JSON.stringify(_data)}`)
                                }
                            })
/*                        }
                    });
  */
                }
            });
            
            
            /******
             * End AWS
             */
            reply(result);
        }
    });


    server.route({
        method: 'POST',
        path: '/login/forgot',
        config: {
            validate: {
                payload: {
                    email: Joi.string().email().lowercase().required()
                }
            },
            pre: [{
                assign: 'user',
                method: function (request, reply) {

                    const conditions = {
                        email: request.payload.email
                    };

                    User.findOne(conditions, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        if (!user) {
                            return reply({ success: true }).takeover();
                        }

                        reply(user);
                    });
                }
            }]
        },
        handler: function (request, reply) {

            Async.auto({
                keyHash: function (done) {

                    Session.generateKeyHash(done);
                },
                user: ['keyHash', function (results, done) {

                    const id = request.pre.user._id.toString();
                    const update = {
                        $set: {
                            resetPassword: {
                                token: results.keyHash.hash,
                                expires: Date.now() + 10000000
                            }
                        }
                    };

                    User.findByIdAndUpdate(id, update, done);
                }],
                email: ['user', function (results, done) {

                    const emailOptions = {
                        subject: 'Reset your ' + nconf.get('projectName') + ' password',
                        to: request.payload.email,
                        replyTo: {
                            name: nconf.get('system:toAddress:name'),
                            address: nconf.get('system:toAddress:address')
                        }
                    };
                    const template = 'forgot-password';
                    const context = {
                        baseHref: nconf.get('web-client:base-url') + '/signin/reset',
                        email: results.user.email,
                        key: results.keyHash.key
                    };

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
                }]
            }, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply({ success: true });
            });
        }
    });


    server.route({
        method: 'POST',
        path: '/login/reset',
        config: {
            validate: {
                payload: {
                    key: Joi.string().required(),
                    email: Joi.string().email().lowercase().required(),
                    password: Joi.string().required()
                }
            },
            pre: [{
                assign: 'user',
                method: function (request, reply) {

                    const conditions = {
                        email: request.payload.email,
                        'resetPassword.expires': { $gt: Date.now() }
                    };

                    User.findOne(conditions, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        if (!user) {
                            return reply(Boom.badRequest('Invalid email or key.'));
                        }

                        reply(user);
                    });
                }
            }]
        },
        handler: function (request, reply) {

            Async.auto({
                keyMatch: function (done) {

                    const key = request.payload.key;
                    const token = request.pre.user.resetPassword.token;
                    Bcrypt.compare(key, token, done);
                },
                passwordHash: ['keyMatch', function (results, done) {

                    if (!results.keyMatch) {
                        return reply(Boom.badRequest('Invalid email or key.'));
                    }

                    User.generatePasswordHash(request.payload.password, done);
                }],
                user: ['passwordHash', function (results, done) {

                    const id = request.pre.user._id.toString();
                    const update = {
                        $set: {
                            password: results.passwordHash.hash
                        },
                        $unset: {
                            resetPassword: undefined
                        }
                    };

                    User.findByIdAndUpdate(id, update, done);
                }]
            }, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply({ success: true });
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
    name: 'login'
};
