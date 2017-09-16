'use strict'
/*
 * Definition of helper classes
 */

// Represents caller and callee sessions
function UserSession(id, name, ws) {
    this.id = id;
    this.name = name;
    this.ws = ws;
    this.peer = null;
    this.sdpOffer = null;
}

UserSession.prototype.sendMessage = function(message) {
    //this.ws.send(JSON.stringify(message));
    console.log(`user-session send user message ${JSON.stringify(message)} to ${this.ws.id}`)
    this.ws.emit('webrtc:message',JSON.stringify(message));
}

module.exports = UserSession;