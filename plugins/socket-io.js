'use strict';

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp');
const internals = {}
const UserSession = require('../lib/user-session')
const UserRegistry = require('../lib/user-registry')
const kurento = require('kurento-client');

exports.register = function (server, options, next) {
    internals.Files = new Map();
    let idCounter = internals.idCounter = 0;

    let userRegistry = internals.userRegistry = new UserRegistry();
    let pipelines= internals.pipelines = {};

    let candidatesQueue = {};
    let kurentoClient = null;
    let ws_uri = "ws://localhost:8888/kurento"

    const BUFFER_SIZE = 10485760; //10 MB
    const CHUNK_SIZE = 524288; // 0.5 MB

    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    function fileUploadStartHandler(data) {
        console.log(`plugins/socket-io Start message ${JSON.stringify(data)}`) 
        /************************************************************************
            data: contains the variables that we passed through in the html file
            data = {Name, Size, From, To}
        *************************************************************************/
        const socket = this; 
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
                        socket.emit('fileupload:moredata', { 'Place' : Place, Percent : 0, From: _from, To: _to, Name: _name});
                    }
                });
            } 

        });
    }
    
    function fileUploadHandler(data){
            
        /***********************************************************************
            data: contains the variables that we passed through in the html file
            data = {Name, Data, From, To}
        *************************************************************************/
        const socket = this; 
        const _name = data['Name'];
        const _from = data['From'];
        const _fromUserName = data['FromUserName'];
        const _to = data['To'];
        const _data = data['Data'];
        const Files = internals.Files;
        const _file = Files.get(`${_from}:${_to}:${_name}`);
        console.log(`plugins/socket-io fileupload:upload message from: ${_from} to: ${_to} filename: ${_name} data length: ${_data.length}`) 
        _file['Downloaded'] += _data.length;
        _file['Data'] += _data;
        if(_file['Downloaded'] === _file['FileSize']) 
        {
            /******************************* 
                If File is Fully Uploaded
                Notify the uploader
            ********************************/
            console.log(`plugins/socket-io File upload finished`)  
            fs.write(_file['Handler'], _file['Data'], null, 'Binary', function(err, Writen){
                socket.emit('fileupload:done', {});
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
        }
        else if(_file['Data'].length >= BUFFER_SIZE){ 
            /******************************************************************************************** 
                If the Data Buffer reaches 10MB
                    Stop and wait for downloader to take the data before resuming more data from uploader
            *********************************************************************************************/
            fs.write(_file['Handler'], _file['Data'], null, 'Binary', function(err, Writen){
                _file['Data'] = ""; //Reset The Buffer
                var Place = _file['Downloaded'] / CHUNK_SIZE;
                var Percent = (_file['Downloaded'] / _file['FileSize']) * 100;
                socket.emit('fileupload:moredata', { 'Place' : Place, 'Percent' :  Percent, From: _from, To: _to, Name: _name});
            });
        }
        else
        {
            const Place = _file['Downloaded'] / CHUNK_SIZE;
            const Percent = (_file['Downloaded'] / _file['FileSize']) * 100;
            socket.emit('fileupload:moredata', { 'Place' : Place, 'Percent' :  Percent, From: _from, To: _to, Name: _name});
        }
    }

    function nextUniqueId() {
        idCounter++;
        return idCounter.toString();
    }

    const io = internals.io = require('socket.io')(server.listener)
    
    io.engine.generateId = (request) => {
        const token = request._query.token // token === id of connecting user and must be unique
        let custom_id = randomString(24, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
        if (token) {
            custom_id = token
        }
        return "custom:id:" + custom_id;
    }

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

        socket.on('fileupload:start', fileUploadStartHandler);

        socket.on('fileupload:upload', fileUploadHandler)
        /**************************************************************
            Handle signaling message of WebRTC
        ***************************************************************/
        //const sessionId = nextUniqueId();
        const sessionId = socket.id.split(':')[2]
        console.log('Connection received with sessionId ' + sessionId);

        socket.on('error', function(error) {
            console.log('Connection ' + sessionId + ' error');
            stop(sessionId);
        });

        socket.on('disconnect', function() {
            console.log('Connection ' + sessionId + ' closed');
            stop(sessionId);
            userRegistry.unregister(sessionId);
        });

        socket.on('webrtc:message', function(_message) {
            var message = JSON.parse(_message);
            const ws = this;
            console.log('Connection ' + sessionId + ' received message ', message);

            switch (message.id) {
                case 'register':
                    register(sessionId, message.name, ws);
                    break;

                case 'call':
                    call(sessionId, message.to, message.from, message.sdpOffer, message.audio);
                    break;

                case 'incomingCallResponse':
                    incomingCallResponse(sessionId, message.from, message.callResponse, message.sdpOffer, ws);
                    break;

                case 'stop':
                    stop(sessionId);
                    break;

                case 'onIceCandidate':
                    onIceCandidate(sessionId, message.candidate);
                    break;

                default:
                    ws.emit('webrtc:message',JSON.stringify({
                        id : 'error',
                        message : 'Invalid message ' + message
                    }));
                    break;
                }
        });
    });
    

  

    function stop(sessionId) {
        if (!pipelines[sessionId]) {
            return;
        }

        var pipeline = pipelines[sessionId];
        delete pipelines[sessionId];
        pipeline.release();
        var stopperUser = userRegistry.getById(sessionId);
        var stoppedUser = userRegistry.getByName(stopperUser.peer);
        stopperUser.peer = null;

        if (stoppedUser) {
            stoppedUser.peer = null;
            delete pipelines[stoppedUser.id];
            var message = {
                id: 'stopCommunication',
                message: 'remote user hanged out'
            }
            stoppedUser.sendMessage(message)
        }

        clearCandidatesQueue(sessionId);
    }

    function incomingCallResponse(calleeId, from, callResponse, calleeSdp, ws) {
        var pipeline;
        clearCandidatesQueue(calleeId);

        function onError(callerReason, calleeReason) {
            if (pipeline) pipeline.release();
            if (caller) {
                var callerMessage = {
                    id: 'callResponse',
                    response: 'rejected'
                }
                if (callerReason) callerMessage.message = callerReason;
                caller.sendMessage(callerMessage);
            }

            var calleeMessage = {
                id: 'stopCommunication'
            };
            if (calleeReason) calleeMessage.message = calleeReason;
            callee.sendMessage(calleeMessage);
        }

        var callee = userRegistry.getById(calleeId);
        if (!from || !userRegistry.getByName(from)) {
            return onError(null, 'unknown from = ' + from);
        }
        var caller = userRegistry.getByName(from);

        if (callResponse === 'accept') {
            pipeline = new CallMediaPipeline();
            pipelines[caller.id] = pipeline;
            pipelines[callee.id] = pipeline;

            pipeline.createPipeline(caller.id, callee.id, ws, function(error) {
                if (error) {
                    return onError(error, error);
                }

                pipeline.generateSdpAnswer(caller.id, caller.sdpOffer, function(error, callerSdpAnswer) {
                    if (error) {
                        return onError(error, error);
                    }

                    pipeline.generateSdpAnswer(callee.id, calleeSdp, function(error, calleeSdpAnswer) {
                        if (error) {
                            return onError(error, error);
                        }

                        var message = {
                            id: 'startCommunication',
                            sdpAnswer: calleeSdpAnswer
                        };
                        callee.sendMessage(message);

                        message = {
                            id: 'callResponse',
                            response : 'accepted',
                            sdpAnswer: callerSdpAnswer
                        };
                        caller.sendMessage(message);
                    });
                });
            });
        } else {
            var decline = {
                id: 'callResponse',
                response: 'rejected',
                message: 'user declined'
            };
            caller.sendMessage(decline);
        }
    }

    function call(callerId, to, from, sdpOffer, isAudio) {
        clearCandidatesQueue(callerId);

        var caller = userRegistry.getById(callerId);
        var rejectCause = 'User ' + to + ' is not registered';
        if (userRegistry.getByName(to)) {
            var callee = userRegistry.getByName(to);
            caller.sdpOffer = sdpOffer
            callee.peer = from;
            caller.peer = to;
            var message = {
                id: 'incomingCall',
                from: from,
                audio: isAudio
            };
            try{
                return callee.sendMessage(message);
            } catch(exception) {
                rejectCause = "Error " + exception;
            }
        }
        var message  = {
            id: 'callResponse',
            response: 'rejected: ',
            message: rejectCause
        };
        caller.sendMessage(message);
    }

    function register(id, name, ws, callback) {
        function onError(error) {
            ws.emit('webrtc:message',JSON.stringify({id:'registerResponse', response : 'rejected ', message: error}));
        }

        if (!name) {
            return onError("empty user name");
        }

        if (userRegistry.getByName(name)) {
            return onError("User " + name + " is already registered");
        }

        userRegistry.register(new UserSession(id, name, ws));
        try {
            ws.emit('webrtc:message',JSON.stringify({id: 'registerResponse', response: 'accepted'}));
        } catch(exception) {
            onError(exception);
        }
    }

    function clearCandidatesQueue(sessionId) {
        if (candidatesQueue[sessionId]) {
            delete candidatesQueue[sessionId];
        }
    }

    function onIceCandidate(sessionId, _candidate) {
        var candidate = kurento.getComplexType('IceCandidate')(_candidate);
        var user = userRegistry.getById(sessionId);

        if (pipelines[user.id] && pipelines[user.id].webRtcEndpoint && pipelines[user.id].webRtcEndpoint[user.id]) {
            var webRtcEndpoint = pipelines[user.id].webRtcEndpoint[user.id];
            webRtcEndpoint.addIceCandidate(candidate);
        }
        else {
            if (!candidatesQueue[user.id]) {
                candidatesQueue[user.id] = [];
            }
            candidatesQueue[sessionId].push(candidate);
        }
    }





    // Recover kurentoClient for the first time.
    function getKurentoClient(callback) {
        if (kurentoClient !== null) {
            return callback(null, kurentoClient);
        }

        kurento(ws_uri, function(error, _kurentoClient) {
            if (error) {
                var message = 'Could not find media server at address ' + ws_uri;
                return callback(message + ". Exiting with error " + error);
            }

            kurentoClient = _kurentoClient;
            callback(null, kurentoClient);
        });
    }

    // Represents a B2B active call
    function CallMediaPipeline() {
        this.pipeline = null;
        this.webRtcEndpoint = {};
    }

    CallMediaPipeline.prototype.createPipeline = function(callerId, calleeId, ws, callback) {
        var self = this;
        getKurentoClient(function(error, kurentoClient) {
            if (error) {
                return callback(error);
            }

            kurentoClient.create('MediaPipeline', function(error, pipeline) {
                if (error) {
                    return callback(error);
                }

                pipeline.create('WebRtcEndpoint', function(error, callerWebRtcEndpoint) {
                    if (error) {
                        pipeline.release();
                        return callback(error);
                    }

                    if (candidatesQueue[callerId]) {
                        while(candidatesQueue[callerId].length) {
                            var candidate = candidatesQueue[callerId].shift();
                            callerWebRtcEndpoint.addIceCandidate(candidate);
                        }
                    }

                    callerWebRtcEndpoint.on('OnIceCandidate', function(event) {
                        var candidate = kurento.getComplexType('IceCandidate')(event.candidate);
                        userRegistry.getById(callerId).ws.emit('webrtc:message',JSON.stringify({
                            id : 'iceCandidate',
                            candidate : candidate
                        }));
                    });

                    pipeline.create('WebRtcEndpoint', function(error, calleeWebRtcEndpoint) {
                        if (error) {
                            pipeline.release();
                            return callback(error);
                        }

                        if (candidatesQueue[calleeId]) {
                            while(candidatesQueue[calleeId].length) {
                                var candidate = candidatesQueue[calleeId].shift();
                                calleeWebRtcEndpoint.addIceCandidate(candidate);
                            }
                        }

                        calleeWebRtcEndpoint.on('OnIceCandidate', function(event) {
                            var candidate = kurento.getComplexType('IceCandidate')(event.candidate);
                            userRegistry.getById(calleeId).ws.emit('webrtc:message',JSON.stringify({
                                id : 'iceCandidate',
                                candidate : candidate
                            }));
                        });

                        callerWebRtcEndpoint.connect(calleeWebRtcEndpoint, function(error) {
                            if (error) {
                                pipeline.release();
                                return callback(error);
                            }

                            calleeWebRtcEndpoint.connect(callerWebRtcEndpoint, function(error) {
                                if (error) {
                                    pipeline.release();
                                    return callback(error);
                                }
                            });

                            self.pipeline = pipeline;
                            self.webRtcEndpoint[callerId] = callerWebRtcEndpoint;
                            self.webRtcEndpoint[calleeId] = calleeWebRtcEndpoint;
                            callback(null);
                        });
                    });
                });
            });
        })
    }

    CallMediaPipeline.prototype.generateSdpAnswer = function(id, sdpOffer, callback) {
        this.webRtcEndpoint[id].processOffer(sdpOffer, callback);
        this.webRtcEndpoint[id].gatherCandidates(function(error) {
            if (error) {
                return callback(error);
            }
        });
    }

    CallMediaPipeline.prototype.release = function() {
        if (this.pipeline) this.pipeline.release();
        this.pipeline = null;
    }

    server.expose('io',internals.io)
    next();
};


exports.register.attributes = {
    name: 'socket-io'
};