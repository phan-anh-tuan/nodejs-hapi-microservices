'use strict';       

const Server = require('./lib');
Server((err,server) => {
                           if (err) { throw err };
                           console.log('server is running at ' + server.info.uri);
                       });
/*
const Hapi = require('hapi');
const Inert = require('inert');  
const server = new Hapi.Server(); 
const Good = require('good'); 
const blipp = require('blipp');
const Path = require('path');
const Vision = require('vision');
const Hello = require('./plugins/hello.js');
const Greeting = require('./plugins/greeting.js');
const UserStore = require('./plugins/user-store.js')
server.connection({port:3000, host:'localhost'});
   
const dbOpts = {
    url: 'mongodb://localhost:27017/hapi_microservices',
    settings: {
        poolSize: 10
    },
    decorate: true
};
server.register(
    [   Inert, blipp, 
        {
            register: Good,
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
        }, 
        { 
            register: require('hapi-mongodb'),
            options: dbOpts
        }, 
        {
            register: Hello,
            routes: {prefix:'/internal'}
        },
        { 
            register: Greeting,
            options: { locale: 'fr-FR'}
        },
         
        Vision,UserStore], 
        (err) => {
                    if (err) { throw err; }
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
                            //server.plugins['UserStore'].db = server.mongo.db;
                            //server.plugins['UserStore'].ObjectID = server.mongo.ObjectID;
                           
                            if (err) { throw err };
                            console.log('server is running at ' + server.info.uri);
                            });
                 })
*/