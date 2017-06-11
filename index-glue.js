'use strict';
const Glue = require('glue');
const Path = require('path');
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
        { plugin: { register: './plugins/user-store.js' }}
    ]
};

Glue.compose(manifest, { relativeTo: __dirname }, (err, server) => {
                server.views({
                    engines: {
                        html: {
                            module: require('handlebars')
                        }
                    },
                    relativeTo: __dirname,
                    path: 'templates'
                });

                server.route({
                    method: 'GET',
                    path: '/hello', 
                    handler: function(request, reply) {
                        reply.file('./public/hello.html');
                    }
                }); 
                server.route({
                    method: 'GET',
                    path: '/',
                    handler: function(request,reply) { reply('Hello World!');}
                });    
                server.route({
                    method: 'GET',
                    path: '/index',
                    handler: function(request, reply) {
                        let context = { title :'Hapi Templates!' };
                        reply.view('index', context);
                    }
                });
                server.start((err) => {
                    server.plugins['UserStore'].db = server.mongo.db;
                    server.plugins['UserStore'].ObjectID = server.mongo.ObjectID;

                    if (err) { throw err };
                    console.log('server is running at ' + server.info.uri);
                });
});