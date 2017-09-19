var videoInput;
var videoOutput;
var webRtcPeer;

var registerName = null;
const NOT_REGISTERED = 0;
const REGISTERING = 1;
const REGISTERED = 2;
var registerState = null

function setRegisterState(nextState) {
	switch (nextState) {
	case NOT_REGISTERED:
		/*$('#register').attr('disabled', false);
		$('#call').attr('disabled', true);*/
		$('#terminate').attr('disabled', true);
		break;

	case REGISTERING:
		//$('#register').attr('disabled', true);
		break;

	case REGISTERED:
		//$('#register').attr('disabled', true);
		setCallState(NO_CALL);
		break;

	default:
		return;
	}
	registerState = nextState;
}

const NO_CALL = 0;
const PROCESSING_CALL = 1;
const IN_CALL = 2;
var audioCall = false;
var callState = null

function setCallState(nextState) {
	switch (nextState) {
	case NO_CALL:
		//$('#call').attr('disabled', false);
		$('#terminate').attr('disabled', true);
		audioCall = false
		break;

	case PROCESSING_CALL:
		//$('#call').attr('disabled', true);
		$('#terminate').attr('disabled', true);
		break;
	case IN_CALL:
		//$('#call').attr('disabled', true);
		$('#terminate').attr('disabled', false);
		break;
	default:
		return;
	}
	callState = nextState;
}

function resgisterResponse(message) {
	if (message.response == 'accepted') {
		setRegisterState(REGISTERED);
	} else {
		//what if end user refresh the page? should we handle window.onunload event ??
		setRegisterState(NOT_REGISTERED);
		var errorMessage = message.message ? message.message : 'Unknown reason for register rejection.';
		console.log(errorMessage);
		alert('Error registering user. See console for further information.');
	}
}

function callResponse(message) {
	if (message.response != 'accepted') {
		console.info('Call not accepted by peer. Closing call');
		var errorMessage = message.message ? message.message : 'Unknown reason for call rejection.';
		console.log(errorMessage);
		stop(true);
	} else {
		setCallState(IN_CALL);
		webRtcPeer.processAnswer(message.sdpAnswer);
	}
}

function startCommunication(message) {
	setCallState(IN_CALL);
	webRtcPeer.processAnswer(message.sdpAnswer);
}

function incomingCall(message) {
	// If bussy just reject without disturbing user
	if (callState != NO_CALL) {
		var response = {
			id : 'incomingCallResponse',
			from : message.from,
			callResponse : 'reject',
			message : 'bussy'

		};
		return sendMessage(response);
	}

	setCallState(PROCESSING_CALL);
	if (confirm('User ' + message.from
			+ ' is calling you. Do you accept the call?')) {
		showSpinner(videoInput, videoOutput);

		var options = {
			localVideo : videoInput,
			remoteVideo : videoOutput,
			onicecandidate : onIceCandidate,
			configuration: {
				iceServers:
				[{url:'stun:74.125.200.127:19302'}, {url:'turn:66.228.45.110',credential: 'muazkh', username: 'webrtc@live.com'}]
			}
		}

		webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
				function(error) {
					if (error) {
						console.error(error);
						setCallState(NO_CALL);
					}

					this.generateOffer(function(error, offerSdp) {
						if (error) {
							console.error(error);
							setCallState(NO_CALL);
						}
						var response = {
							id : 'incomingCallResponse',
							from : message.from,
							callResponse : 'accept',
							sdpOffer : offerSdp
						};
						sendMessage(response);
					});
				});

	} else {
		var response = {
			id : 'incomingCallResponse',
			from : message.from,
			callResponse : 'reject',
			message : 'user declined'
		};
		sendMessage(response);
		stop(true);
	}
}

function register(id) {

	setRegisterState(REGISTERING);

	var message = {
		id : 'register',
		name : id
	};
	sendMessage(message);
}

function call(peer, _audioCall = false) {
	audioCall = _audioCall;

	setCallState(PROCESSING_CALL);

	showSpinner(videoInput, videoOutput);

	var options = {
		localVideo : videoInput,
		remoteVideo : videoOutput,
		onicecandidate : onIceCandidate,
        configuration: {
            iceServers:
			[{url:'stun:74.125.200.127:19302'}, {url:'turn:66.228.45.110',credential: 'muazkh', username: 'webrtc@live.com'}]
        }
	}

	if (audioCall) {
		options.mediaConstraints = {
			audio : true,
			video : false
		}
	} 

	webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(
			error) {
		if (error) {
			console.error(error);
			setCallState(NO_CALL);
		}

		this.generateOffer(function(error, offerSdp) {
			if (error) {
				console.error(error);
				setCallState(NO_CALL);
			}
			var message = {
				id : 'call',
				from : window.username,
				to : peer,
				sdpOffer : offerSdp
			};
			sendMessage(message);
		});
	});

}

function stop(message) {
	setCallState(NO_CALL);
	if (webRtcPeer) {
		webRtcPeer.dispose();
		webRtcPeer = null;

		if (!message) {
			var message = {
				id : 'stop'
			}
			sendMessage(message);
		}
	}
	hideSpinner(videoInput, videoOutput);
}

function sendMessage(message) {
	var jsonMessage = JSON.stringify(message);
	console.log('Senging message: ' + jsonMessage);
	//socket.send(jsonMessage);
    socket.emit('webrtc:message',jsonMessage)
}

function onIceCandidate(candidate) {
	console.log('Local candidate' + JSON.stringify(candidate));

	var message = {
		id : 'onIceCandidate',
		candidate : candidate
	}
	sendMessage(message);
}

function showSpinner() {
	if (!audioCall) {
		for (var i = 0; i < arguments.length; i++) {
			arguments[i].poster = 'assets/img/transparent-1px.png';
			arguments[i].style.background = 'center transparent url("assets/img/spinner.gif") no-repeat';
		}
	}
}

function hideSpinner() {
	if (!audioCall) {
		for (var i = 0; i < arguments.length; i++) {
			arguments[i].src = '';
			arguments[i].poster = 'assets/img/webrtc.png';
			arguments[i].style.background = '';
		}
	}
}

