'use strict';
const Boom = require('boom');


const internals = {};


internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/api/online/contact',
        config: {
            auth: {
                 strategy: 'session',
                scope: 'account'
            },
            description: 'Get online contact list' ,
            tags: ['api']
        },
        handler: function (request, reply) {
            reply(server.plugins['login'].get());
        }
    });
    next();
};


exports.register = function (server, options, next) {

    server.dependency(['login'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'online-contact'
};
