'use strict';

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp');
const internals = {}
    

exports.register = function (server, options, next) {
    internals.Files = new Map();
    const BUFFER_SIZE = 10485760; //10 MB
    const CHUNK_SIZE = 524288; // 0.5 MB

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

        socket.on('Start', function (data) { 
            console.log(`plugins/socket-io Start message ${JSON.stringify(data)}`) 
            /******
                data: contains the variables that we passed through in the html file
                data = {Name, Size, From, To}
            *****/
            const _name = data['Name'];
            const _from = data['From'];
            const _to = data['To'];
            const _size = data['Size'];

            const Files = internals.Files;
            let _file = {}

            if (Files.has(`${_from}:${_to}:${_name}`)) {
                _file = Files.get(`${_from}:${_to}:${_name}`);
            } else {
                _file = {  //Create a new Entry in The Files Variable
                    FileSize : _size,
                    Data     : "",
                    Downloaded : 0,
                    socket: socket
                }
                Files.set(`${_from}:${_to}:${_name}`, _file)
            }
            
            //var Place = _file['Downloaded']/ CHUNK_SIZE;        
            let Place = 0;        
            mkdirp(`${__dirname}/../tmp/${_from}/${_to}`,function (err) {
                if (err) console.error(err)
                else {
                    try{
                        const Stat = fs.statSync(path.resolve(`${__dirname}/../tmp/${_from}/${_to}/${_name}`));
                        if(Stat.isFile())
                        {
                            _file['Downloaded'] = Stat.size;
                            Place = Stat.size / 524288;
                        }
                    }
                    catch(er){} //It's a New File
                    mkdirp(`${__dirname}/../tmp/${_from}/${_to}`);
                    fs.open(path.resolve(`${__dirname}/../tmp/${_from}/${_to}/${_name}`), "a", 493, function(err, fd){
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            _file['Handler'] = fd; //We store the file handler so we can write to it later
                            socket.emit('MoreData', { 'Place' : Place, Percent : 0, From: _from, To: _to, Name: _name});
                        }
                    });
                } 

            });
            //socket.emit('MoreData', { 'Place' : Place, Percent : 0, From: _from, To: _to, Name: _name});
        });

        socket.on('Upload', function (data){
            
             /******
                data: contains the variables that we passed through in the html file
                data = {Name, Data, From, To}
            *****/
            const _name = data['Name'];
            const _from = data['From'];
            const _fromUserName = data['FromUserName'];
            const _to = data['To'];
            const _data = data['Data'];
            const Files = internals.Files;
            const _file = Files.get(`${_from}:${_to}:${_name}`);
            console.log(`plugins/socket-io Upload message from: ${_from} to: ${_to} filename: ${_name} data length: ${_data.length}`) 
            _file['Downloaded'] += _data.length;
            _file['Data'] += _data;
            if(_file['Downloaded'] === _file['FileSize']) 
            {
                /* 
                    If File is Fully Uploaded
                    Notify the uploader
                */
                console.log(`plugins/socket-io File upload finished`)  
                fs.write(_file['Handler'], _file['Data'], null, 'Binary', function(err, Writen){
                    socket.emit('Done', {});
                    // notify recipient that file is ready for download
                    const url = `${_name} <a target="_blank" href="files/download/${_from}/${_to}/${_name}">Save As...</a>` 
                    const msg = {
                        from: `${_fromUserName}:${_from}`,
                        to: `custom:id:${_to}`,
                        message: url,
                        type: 'url'
                    }
                    io.to(`custom:id:${_to}`).emit('chat:messages:latest', msg);
                });
                //socket.emit('Done', {});
            }
            else if(_file['Data'].length >= BUFFER_SIZE){ 
                /* 
                    If the Data Buffer reaches 10MB
                        Stop and wait for downloader to take the data before resuming more data from uploader
                */
                fs.write(_file['Handler'], _file['Data'], null, 'Binary', function(err, Writen){
                    _file['Data'] = ""; //Reset The Buffer
                    var Place = _file['Downloaded'] / CHUNK_SIZE;
                    var Percent = (_file['Downloaded'] / _file['FileSize']) * 100;
                    socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent, From: _from, To: _to, Name: _name});
                });
            }
            else
            {
                const Place = _file['Downloaded'] / CHUNK_SIZE;
                const Percent = (_file['Downloaded'] / _file['FileSize']) * 100;
                socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent, From: _from, To: _to, Name: _name});
            }
        });
    })
/*
    internals.read = function(from, to, filename) {
        const Files = internals.Files;
        const _file = Files.get(`${from}:${to}:${filename}`);
        const data = _file['Data'].slice();
        _file['Data'] = ""; // reset buffer
        if (data.length >= BUFFER_SIZE) {
            const Place = _file['Downloaded'] / CHUNK_SIZE;
            const Percent = (_file['Downloaded'] / _file['FileSize']) * 100;
            _file.socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent, From: from, To: to, Name: filename}); // ask uploader to send more data
        }
        return {
                    data: data,
                    end: _file['Downloaded'] === _file['FileSize']
                };
    }
*/
    server.expose('io',internals.io)
    //server.expose('readData',internals.read)
    //server.expose('chat',internals.chat)
    next();
};


exports.register.attributes = {
    name: 'socket-io'
};