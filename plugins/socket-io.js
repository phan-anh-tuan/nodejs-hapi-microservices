'use strict';

const internals = {}
exports.register = function (server, options, next) {

    internals.io = require('socket.io')(server.listener)
    internals.chat = internals.io.of('/chat').on('connection', function(socket) {
        console.log(`a user connected`);
        socket.on('chat message', function(msg){
            chat.emit('chat message', msg);
        });
    })
    
    server.expose('io',internals.io)
    server.expose('chat',internals.chat)
    next();
};


exports.register.attributes = {
    name: 'socket-io'
};