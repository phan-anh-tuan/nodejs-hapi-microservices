'use strict';
const Glue = require('glue');
const Path = require('path');
const Hoek = require('hoek');

module.exports = function(callback) {

    const dbOpts = {
        url: 'mongodb://localhost:27017/hapi_microservices',
        settings: {
            poolSize: 10
        },
        decorate: true
    };

    const manifest = {
        server: {},
        connections: [{port:3000, host:'localhost'}],
        registrations: 
        [
            { plugin: { register: 'inert'} },
            { 
              plugin: { 
                        register: 'good',
                        options: {
                            reporters: {
                                console: [{
                                    module: 'good-squeeze',
                                    name: 'Squeeze',
                                    args: [{
                                        response: '*',
                                        log: '*'
                                    }]
                                },{
                                    module: 'good-console'
                                },'stdout']
                            }
                        }
                      }
            },
            { plugin: { register: 'blipp' }},
            { plugin: { register: 'vision' }},
            { plugin: { register: 'hapi-swagger' }},
            {
              plugin: { 
                        register: 'hapi-mongodb',
                        options: dbOpts
                      }
            },
            { 
              plugin: { register: './plugins/hello.js' },
              options: { routes: {prefix:'/internal'}}
            },
            { 
              plugin: { 
                        register: './plugins/greeting.js',
                        options: { locale: 'fr-FR'}
                      }
            },
            { plugin: { register: './plugins/user-store.js' }},
            { plugin: { register: 'bell' }},
        ]
    };

    Glue.compose(manifest, { relativeTo: `${__dirname}/..` }, (err, server) => {
                    server.auth.strategy('facebook', 'bell', {
                        provider: 'facebook',
                        password: 'cookie_encryption_password_secure',
                        isSecure: false,
                        // You'll need to go to https://developers.facebook.com/ and set up a
                        // Website application to get started
                        // Once you create your app, fill out Settings and set the App Domains
                        // Under Settings >> Advanced, set the Valid OAuth redirect URIs to include http://<yourdomain.com>/bell/door
                        // and enable Client OAuth Login
                        clientId: '165624680642607',
                        clientSecret: '2b2a5ce058fbededb923e8bdfcde53bd',
                        location: server.info.uri
                    });
                    server.ext('onPreAuth', function (request, reply) {
                        //request.auth.credentials.scope = 'admin';
                        console.log(`authentication request`);
                        return reply.continue();
                    });
                    server.ext('onPostAuth', function (request, reply) {
                        //request.auth.credentials.scope = 'admin';
                        request.auth.scope = 'admin';
                        console.log(`credentials received: ${JSON.stringify(request.auth.facebook)}`);
                        return reply.continue();
                    });
                    server.views({
                        engines: {
                            html: {
                                module: require('handlebars')
                            }
                        },
                        relativeTo: `${__dirname}/..`,
                        path: 'templates'
                    });
                    // serve static contents from public folder
                    server.route({
                        method: 'GET',
                        path: '/{param*}',
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
                        path: '/hello', 
                        config: {
                                auth: {
                                    strategy: 'facebook',
                                    mode: 'try',
                                    /*access: {
                                        scope: ['admin']
                                    }*/
                                },
                                handler: function(request, reply) {
                                                reply.file('./public/hello.html');
                                            },
                                tags: ['api']
                        }
                        
                    }); 
                    server.route({
                        method: 'GET',
                        path: '/',
                        config: {
                                auth: {
                                    strategy: 'facebook',
                                    mode: 'try',
                                    /*access: {
                                        scope: ['admin']
                                    }*/
                                },
                                handler: function (request, reply) {
                                    if (!request.auth.isAuthenticated) {
                                        return reply('Authentication failed due to: ' + request.auth.error.message);
                                    }
                                    console.log('RETURNING');
                                    reply('<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>');
                                },
                                tags: ['api']
                            }
                    });    
                    server.route({
                        method: 'GET',
                        path: '/index',
                        config: {
                            handler: function(request, reply) {
                                let context = { title :'Hapi Templates!' };
                                reply.view('index', context);
                            },
                            tags: ['api']
                        }
                    });
                    
                    

        
                    server.start((err) => {
                        callback(err, server);
                   });
    });
}