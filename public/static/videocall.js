var videoInput;
var videoOutput;
var videoScreenSharingInput;
var webRtcPeer;
var webRtcScreenSharingPeer;

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

var callMode = '';
var callState = null


function setCallState(nextState) {
	switch (nextState) {
	case NO_CALL:
		//$('#call').attr('disabled', false);
		$('#terminate').attr('disabled', true);
		callMode = '';
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

function screenSharingResponse(message) {
	
	if (message.response != 'accepted') {
		console.info('Screen sharing not accepted by peer. Closing call');
		var errorMessage = message.message ? message.message : 'Unknown reason for call rejection.';
		console.log(errorMessage);
		stopScreenSharing(true);
	} else {
		//setCallState(IN_CALL);
		webRtcScreenSharingPeer.processAnswer(message.sdpAnswer);
	}
	
}

function startCommunication(message) {
	setCallState(IN_CALL);
	webRtcPeer.processAnswer(message.sdpAnswer);
}

function startScreenSharing(message) {
	webRtcScreenSharingPeer.processAnswer(message.sdpAnswer);
}

function incomingCall(message) {
	// If bussy just reject without disturbing user
	
	if (callState != NO_CALL) {
		var response = {
			id : 'incomingCallResponse',
			from : message.from,
			callResponse : 'reject',
			message : 'busy'

		};
		return sendMessage(response);
	}

	setCallState(PROCESSING_CALL);
	if (confirm('User ' + message.from
			+ ' is calling you. Do you accept the call?')) {
		
		var options = {
			localVideo : videoInput,
			remoteVideo : videoOutput,
			mediaConstraints: generateMediaConstraints(message.mode),
			onicecandidate : onIceCandidate,
			configuration: {
				iceServers:
				[{url:'stun:74.125.200.127:19302'}, {url:'turn:66.228.45.110',credential: 'muazkh', username: 'webrtc@live.com'}]
			}
		}
		
		let videoAudioOnlyOutput = videoScreenSharingInput
		if (message.mode === 'audio') options.remoteVideo = videoAudioOnlyOutput; //reserve the videoOutput for screenSharing remote stream

		console.log(`videocall.js incomingCall ${JSON.stringify(options.mediaConstraints)}`)
		showSpinner(videoInput, videoOutput);

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


function screenSharing(message) {
	//setCallState(PROCESSING_CALL);
	
	//showSpinner(videoInput, videoOutput);


	var options = {
		//localVideo : videoInput,
		remoteVideo : videoOutput,
		//mediaConstraints: generateMediaConstraints(message.mode),
		onicecandidate : onScreenSharingIceCandidate,
		configuration: {
			iceServers:
			[{url:'stun:74.125.200.127:19302'}, {url:'turn:66.228.45.110',credential: 'muazkh', username: 'webrtc@live.com'}]
		}
	}
	console.log(`videocall.js incomingCall ${JSON.stringify(options.mediaConstraints)}`)
	//showSpinner(videoInput, videoOutput);
	
	if (webRtcScreenSharingPeer) webRtcScreenSharingPeer.dispose();
	webRtcScreenSharingPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
		function(error) {
			if (error) {
				console.error(error);
				//setCallState(NO_CALL);
			}

			this.generateOffer(function(error, offerSdp) {
				if (error) {
					console.error(error);
					//setCallState(NO_CALL);
				}
				var response = {
					id : 'screenSharingResponse',
					from : message.from,
					callResponse : 'accept',
					sdpOffer : offerSdp
				};
				sendMessage(response);
			});
		});
}

function register(id) {

	setRegisterState(REGISTERING);

	var message = {
		id : 'register',
		name : id
	};
	sendMessage(message);
}

function generateMediaConstraints(mode) {
	let constraints = {}
	callMode = mode
	switch(callMode) {
		case 'audio':
			constraints = {
				audio : true,
				video : false
			}
			break;
		case 'video' :
			constraints = {
				audio : true,
				video : true
			}
			break;
		case 'screen sharing' :
			constraints = {
				audio : false,
				video : true
			}
			break;
		default:
			constraints = {
				audio : true,
				video : true
			}
	}
	return constraints
}

function call(peer, mode = 'video') {

	var options = {
		localVideo : videoInput,
		remoteVideo : videoOutput,
		onicecandidate : onIceCandidate,
		mediaConstraints: generateMediaConstraints(mode),
        configuration: {
            iceServers:
			[{url:'stun:74.125.200.127:19302'}, {url:'turn:66.228.45.110',credential: 'muazkh', username: 'webrtc@live.com'}]
        }
	}
	
	setCallState(PROCESSING_CALL);
	showSpinner(videoInput, videoOutput);

	webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(error) {
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
				mode: mode, 
				//mode: 'video only', 
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
	stopScreenSharing()
	hideSpinner(videoInput, videoOutput);
}

function stopScreenSharing(message) {
	//setCallState(NO_CALL);
	if (webRtcScreenSharingPeer) {
		webRtcScreenSharingPeer.dispose();
		webRtcScreenSharingPeer = null;

		if (!message) {
			var message = {
				id : 'stopScreenSharing'
			}
			sendMessage(message);
		}
	}
	//hideSpinner(videoInput, videoOutput);
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

function onScreenSharingIceCandidate(candidate) {
	
	console.log('Local candidate' + JSON.stringify(candidate));

	var message = {
		id : 'onScreenSharingIceCandidate',
		candidate : candidate,
	}
	sendMessage(message);
}

function showSpinner() {
	if (callMode !== 'audio') {
		for (var i = 0; i < arguments.length; i++) {
			arguments[i].poster = 'assets/img/transparent-1px.png';
			arguments[i].style.background = 'center transparent url("assets/img/spinner.gif") no-repeat';
		}
	}
}

function hideSpinner() {
	if (callMode !== 'audio') {
		for (var i = 0; i < arguments.length; i++) {
			arguments[i].src = '';
			arguments[i].poster = 'assets/img/webrtc.png';
			arguments[i].style.background = '';
		}
	}
}

function startScreenSharing(recipient) {
	

	if (webRtcScreenSharingPeer) webRtcScreenSharingPeer.dispose();

	//const peer = webRtcPeer.peerConnection
	/******** screen sharing start */
	/*peer.getLocalStreams().forEach(function(stream) {
		peer.removeStream(stream);
	});*/	
	getScreenId(function (error, sourceId, screen_constraints) {
		// error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
		// sourceId == null || 'string' || 'firefox'
	
		console.log(`videocall.js sourceId ${sourceId}`)
		if(sourceId && sourceId !== 'firefox') {
			screen_constraints = {
				audio: false,
				video: {
					mandatory: {
						chromeMediaSource: 'screen',
						maxWidth: 1920,
						maxHeight: 1080,
						minAspectRatio: 1.77
					},
					optional: [{
						googTemporalLayeredScreencast: true
					}]
				}
			};
	
			if (error === 'permission-denied') return alert('Permission is denied.');
			if (error === 'not-chrome') return alert('Please use chrome.');
	
			if (!error && sourceId) {
				screen_constraints.video.mandatory.chromeMediaSource = 'desktop';
				screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;
			}
		}
	
		navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
		navigator.getUserMedia(screen_constraints, function (stream) {
			videoInput.src = URL.createObjectURL(stream); //use screensharing stream instead of stream from local media
			//peer.addStream(stream);
			
			var options = {
				localVideo : videoScreenSharingInput,
				//remoteVideo : videoOutput,
				onicecandidate : onScreenSharingIceCandidate,
				mediaConstraints: generateMediaConstraints('screen sharing'),
				configuration: {
					iceServers:
					[{url:'stun:74.125.200.127:19302'}, {url:'turn:66.228.45.110',credential: 'muazkh', username: 'webrtc@live.com'}]
				}
			}
			options.videoStream = stream;
			//setCallState(PROCESSING_CALL);
			//showSpinner(videoInput, videoOutput);
		
			webRtcScreenSharingPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
				if (error) {
					console.error(error);
					//setCallState(NO_CALL);
				}
		
				this.generateOffer(function(error, offerSdp) {
					if (error) {
						console.error(error);
						//setCallState(NO_CALL);
					}
					var message = {
						id : 'screenSharing',
						from : window.username,
						to : recipient,
						mode: 'screen sharing',
						sdpOffer : offerSdp
					};
					sendMessage(message);
				});
			});
			

		}, function (error) {
			console.error('getScreenId error', error);
			alert('Failed to capture your screen. Please check Chrome console logs for further information.');
		});
	});
	/******** screen sharing end ***/
}