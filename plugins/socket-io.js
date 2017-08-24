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
        const PUBLIC_ROOM = 'custom:id:room_public'
        socket.on('io:message', function(msg){
            console.log(`plugins/socket-io receive message ${JSON.stringify(msg)}`) 
            const {from, to, message} = msg
            io.to(to).emit('chat:messages:latest', msg);
        });
        socket.join(PUBLIC_ROOM, (error) => {
            if (error) console.log(error)
            //io.to(PUBLIC_ROOM).emit('chat:messages:latest','a new user has joined the room'); // broadcast to everyone in the room   
        });
    })
    
    server.expose('io',internals.io)
    //server.expose('chat',internals.chat)
    next();
};


exports.register.attributes = {
    name: 'socket-io'
};