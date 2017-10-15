'use strict';
const Glue = require('glue');
const fs = require('fs');
const Path = require('path');
const Hoek = require('hoek'); //Utility methods for the hapi ecosystem
const nconf = require('nconf'); //manage configuration in json file, see details at https://github.com/indexzero/nconf

nconf.argv().env().file({ file: Path.resolve(__dirname,'../application-configuration.json')});

module.exports = function(callback) {

    const dbOpts = {
        //url: 'mongodb://localhost:27017/NTRR',
        url: `${nconf.get('database-server:protocol')}://${nconf.get('database-server:host')}:${nconf.get('database-server:port')}/${nconf.get('database-server:database')}`,
        settings: {
            poolSize: 10
        },
        decorate: true
    };

    const options = {
        key:  fs.readFileSync(Path.resolve('lib/keys/server.key')),
        cert: fs.readFileSync(Path.resolve('lib/keys/server.crt'))
    };

    const manifest = {
        server: {},
        connections: [{port:nconf.get('web-server:port'), host:nconf.get('web-server:host')}],
        //connections: [{port:nconf.get('web-server:port'), host:nconf.get('web-server:host'), tls: options}],
        registrations: 
        [
            { plugin: { register: 'inert' }}, //inert provides new handler methods for serving static files and directories, as well as decorating the reply interface with a file method for serving file based resources. https://www.npmjs.com/package/inert
            { plugin: { register: 'hapi-auth-cookie' }},
            { 
              plugin: { 
                        register: 'good', //good is a hapi plugin to monitor and report on a variety of hapi server events as well as ops information from the host machine. https://www.npmjs.com/package/good
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
            { plugin: { register: 'blipp' }}, //blipp is a simple hapi plugin to display the routes table to console at startup. https://www.npmjs.com/package/blipp
            { plugin: { register: 'vision' }}, //vision decorates the server, request, and reply interfaces with additional methods for managing view engines that can be used to render templated responses. https://www.npmjs.com/package/vision#handlebars
            { plugin: { register: 'hapi-swagger' }}, //This is a OpenAPI (aka Swagger) plug-in for HAPI When installed it will self document the API interface in a project. https://www.npmjs.com/package/hapi-swagger
            {
              plugin: { 
                        register: 'hapi-mongodb', //https://www.npmjs.com/package/hapi-mongodb
                        options: dbOpts
                      }
            },
            /*
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
            */
            {   plugin: { register: './plugins/mailer.js' }},
            {   plugin: { register: './plugins/socket-io.js' }},
            {   plugin: { register: './plugins/auth.js' }},
            {   plugin: { register: './plugins/web.js' }},
            {   plugin: { register: './plugins/online-contact.js' }},
            {   plugin: { register: './plugins/account.js' },
                options: { routes: {prefix:'/api'}}            
            },
            {   plugin: { register: './plugins/user-store.js' },
                options: { routes: {prefix:'/api'}}            
            },
            {   plugin: { register: './plugins/tasks.js' }},
            { 
                plugin: { register: './plugins/resource-request-store.js' },
                options: { routes: {prefix:'/api'}}
            },
            { 
                plugin: { register: './plugins/signup.js' },
                options: { routes: {prefix:'/api'}}
            },
            { 
                plugin: { register: './plugins/login.js' },
                options: { routes: {prefix:'/api'}}
            },
            { 
                plugin: { register: './plugins/logout.js' },
                options: { routes: {prefix:'/api'}}
            },
            { 
                plugin: { register: './plugins/contact.js' },
                options: { routes: {prefix:'/api'}}
            },
            {
                plugin: {
                    register: 'hapi-mongo-models',
                    options: {
                        mongodb: nconf.get('database-server:mongodb'),
                        models: {
                            User: 'models/user',
                            Account: 'models/account',
                            Status: 'models/status',
                            Session: 'models/session',
                            AuthAttempt: 'models/auth-attempt',
                            Contact: 'models/contact',
                            /*            
                            AdminGroup: './server/models/admin-group',
                            Admin: './server/models/admin',
                            
                            */                                
                        },
                        autoIndex: nconf.get('database-server:autoIndex')
                    }
                }
            },
            { plugin: { register: 'bell' }},
        ]
    };

    Glue.compose(manifest, { relativeTo: `${__dirname}/..` }, (err, server) => {
        server.start((err) => {
            callback(err, server);
        });
    });
}