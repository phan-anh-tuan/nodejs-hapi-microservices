'use strict';
const Hapi = require('hapi');
const inert = require('inert');
const server = new Hapi.Server();
const Good = require('good');
const blipp = require('blipp');

server.connection({port:3000, host:'localhost'});

server.route({
    method: 'GET',
    path: '/',
    handler: function(request,reply) { reply('Hello World!');}
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function(request,reply) { 
        reply('Hello ' + encodeURIComponent(request.params.name) + ' !');
    }
});



server.register([inert, blipp, {
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
}], (err) => {
    if (err) { throw err; }
    server.route({
        method: 'GET',
        path: '/hello',
        handler: function(request, reply) {
            reply.file('./public/hello.html');
        }
    });
    server.start((err) => {
            if (err) throw err;
            console.log('server is running at ' + server.info.uri);
                          });
})
/*
server.register({
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
}, (err) => {
     if (err) {
        throw err; // something bad happened loading the plugin
    }
    server.start((err) => {
                            if (err) throw err;
                            console.log('server is running at ' + server.info.uri);
                            });
});
*/