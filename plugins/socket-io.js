'use strict';

const internals = {}
exports.register = function (server, options, next) {

    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    const io = internals.io = require('socket.io')(server.listener)
    
    io.engine.generateId = (request) => {
        const token = request._query.token
        let custom_id = randomString(24, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
        if (token) {
            custom_id = token
        }
        return "custom:id:" + custom_id; // custom id must be unique
    }

    //internals.chat = internals.io.of('/chat').on('connection', function(socket) {
    io.on('connection', function(socket) {
        socket.on('io:message', function(msg){
            const {from, to, message} = msg
            io.to(to).emit('chat:messages:latest', msg);
        });
    })
    
    server.expose('io',internals.io)
    //server.expose('chat',internals.chat)
    next();
};


exports.register.attributes = {
    name: 'socket-io'
};