'use strict';
const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');
const nconf = require('nconf')
const internals = {};


internals.applyRoutes = function (server, next) {

    const Contact = server.plugins['hapi-mongo-models'].Contact;


    server.route({
        method: 'POST',
        path: '/contact',
        config: {
            validate: {
                payload: {
                    name: Joi.string().required(),
                    email: Joi.string().email().required(),
                    message: Joi.string().required()
                }
            },
            description: 'Send a message' ,
            tags: ['api']
        },
        handler: function (request, reply) {
            const {name, email, message} = request.payload;
            Async.auto({
                create_message: (cb) => {
                    Contact.create(name, email, message, cb);
                },
                send_message: ['create_message', (result, cb) => {
                    const mailer = request.server.plugins.mailer;

                    const emailOptions = {
                        subject: 'You got a new message',
                        to: nconf.get('system:toAddress'),
                        replyTo: {
                            name: name,
                            address: email
                        }
                    };
                    const template = 'contact';
                    const context = { from: name, email: email, message: message}
                
                    mailer.sendEmail(emailOptions, template, context,cb);
                }]
            }, (error, results) => {
                if (error) { return reply(error)}
                reply(results.create_message);
            })
        }
    });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'contact'
};
