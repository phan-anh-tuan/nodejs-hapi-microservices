
const Path = require('path');
const internals = {}

internals.applyRoutes = function(server,next) {
    server.views({
        engines: {
            html: {
                module: require('handlebars')
            }
        },
        relativeTo: `${__dirname}/..`,
        path: 'views',
        layoutPath: 'views/layout',
        layout: 'default',
        helpersPath: 'views/helpers',
        partialsPath: 'views/partials'
    });

    // serve static contents from public folder
    server.route({
        method: 'GET',
        path: '/assets/{param*}', 
        handler: {
            directory: {
                path: Path.resolve(__dirname,'../public'),
                redirectToSlash: true,
                index: true
            }
        }
    });
    server.route({
                method: 'GET',
                path: '/signup',
                config: {
                    handler: function(request, reply) {
                        let context = { user: { role: 'user'},
                                        script: { url: '/assets/js/signup.js'} };
                        reply.view('index',context);
                    },
                }
            });
                    
    server.route({
        method: 'GET',
        path: '/signin/{path*}',
        config: {
            handler: function(request, reply) {
                let context = { user: { role: 'user'},
                                script: { url: '/assets/js/login.js'} };
                reply.view('index',context);
            },
        }
    });
/*
    server.route({
        method: 'GET',
        path: '/resource/request',
        config: {
            auth: {
                strategy: 'session',
                scope: 'account'
            },
            handler: function(request, reply) {
                let context = { user: { role: 'user'},
                                script: { url: '/assets/js/bundle.js'} };
                reply.view('index', context);
            }
        }
    });
*/
    server.route({
        method: 'GET',
        path: '/{path*}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'account'
            },
            handler: function(request, reply) {
                let context = { user: { role: 'user'},
                                script: { url: '/assets/js/bundle.js'} };
                reply.view('index', context);
            }
        }
    });
    next();
                    
}

exports.register = function(server,options,next) {
    server.dependency('auth', internals.applyRoutes);
    next();
}

exports.register.attributes = {
    name: 'web'
}