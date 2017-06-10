'use strict';
exports.register = function(server, options, next) {
    server.dependency('greeting', (server, after) => { return after();});
    
    server.route({
        method: 'GET',
        path: '/greeting/{name?}',
        handler: function(request, reply) {
            const message = server.plugins.greeting.sayGreeting(request.params.name);
            return reply(message);
        }
    });
    next();
};


exports.register.attributes = {
    name: 'hello'
}
