import WebRTC from 'react-native-webrtc';

import config from "../config/app.js";

let onFriendLeftCallback = null;
let onFriendConnectedCallback = null;
let onDataChannelMessageCallback = null;

const socketIOClient = require('socket.io-client');
let socket = socketIOClient('http://192.168.1.38:9999/', { transports: ['websocket'], jsonp: false });

var configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
var peerConnections = {}; //map of {socketId: socket.io id, RTCPeerConnection}
let localStream = null;
let friends = []; //list of {socketId, name}
let connected = false
let me = null; //{socketId, name}
let currentRoom = ""
let callbacks

function createPeerConnection(friend, isOffer, onDataChannelMessage) {
	let socketId = friend.socketId;
	var retVal = new WebRTC.RTCPeerConnection(configuration);

	peerConnections[socketId] = retVal;

	retVal.onicecandidate = function (event) {
		if (event.candidate) {
			alert('exchange: onicecandidate')
			socket.emit('exchange', { 'to': socketId, 'candidate': event.candidate });
		}
	};

	function createOffer() {
		retVal.createOffer(function (desc) {
			retVal.setLocalDescription(desc, function () {
				alert('exchange: createOffer: ' + retVal.localDescription)
				socket.emit('exchange', { 'to': socketId, 'sdp': retVal.localDescription });
			}, logError);
		}, logError);
	}

	retVal.onnegotiationneeded = function () {
		if (isOffer) {
			createOffer();
		}
	}

	retVal.oniceconnectionstatechange = function (event) {
		if (event.target.iceConnectionState === 'connected') {
			createDataChannel();
		}
	};

	retVal.onsignalingstatechange = function (event) {};

	retVal.onaddstream = function (event) {
		alert('onaddstream')
		if (onFriendConnectedCallback != null) {
			onFriendConnectedCallback(socketId, event.stream);
		}
	};

	retVal.addStream(localStream);

	function createDataChannel() {
		if (retVal.textDataChannel) {
			return;
		}
		var dataChannel = retVal.createDataChannel("text");

		dataChannel.onerror = function (error) {
			alert("dataChannel.onerror: " + JSON.stringify(error));
		};

		dataChannel.onmessage = function (event) {
			if (onDataChannelMessageCallback != null) {
				onDataChannelMessageCallback(JSON.parse(event.data));
			}
		};

		dataChannel.onopen = function () {};

		dataChannel.onclose = function () {};

		retVal.textDataChannel = dataChannel;
	}

	return retVal;
}

function exchange(data) {
	var fromId = data.from;
	var pc;
	if (fromId in peerConnections) {
		pc = peerConnections[fromId];
	} else {
		let friend = friends.filter((friend) => friend.socketId == fromId)[0];
		if (friend == null) {
			friend = {
				socketId: fromId,
				name: ""
			}
		}
		pc = createPeerConnection(friend, false);
	}

	alert(JSON.stringify(data))
	if (data.sdp) {
		//console.log('exchange sdp', data);
		alert('data.sdp')
		pc.setRemoteDescription(new WebRTC.RTCSessionDescription(data.sdp), function () {
			alert('setRemoteDescription: ' + pc.remoteDescription.type)
			if (pc.remoteDescription.type == "offer")
				pc.createAnswer(function (desc) {
					//console.log('createAnswer', desc);
					pc.setLocalDescription(desc, function () {
						//console.log('setLocalDescription', pc.localDescription);
						alert('exchange: sdp')
						socket.emit('exchange', { 'to': fromId, 'sdp': pc.localDescription });
					}, logError);
				}, logError);
		}, logError);
	} else {
		//console.log('exchange candidate', data);
		pc.addIceCandidate(new WebRTC.RTCIceCandidate(data.candidate));
	}
}

function leave(socketId) {
	var pc = peerConnections[socketId];
	pc.close();
	delete peerConnections[socketId];
	if (onFriendLeftCallback != null) {
		onFriendLeftCallback(socketId);
	}

	connected = false
}

socket.on('exchange', function (data) {
	exchange(data);
});

socket.on('leave', function (socketId) {
	leave(socketId);
});

socket.on('connect', function (data) {
	
});

// socket.on("join", function (friend) {
// 	//new friend:
// 	friends.push(friend);
// 	console.log("New friend joint conversation: ", friend);
// });

socket.on('chat start', function(data) {
	currentRoom = data.room
	friends.push({
		socketId: data.id,
		name: data.name
	});

	createPeerConnection({
		socketId: data.id,
		name: data.name
	}, true)

	if (callbacks.joined != null) {
		me = {
			socketId: socket.id,
			name: "me"
		}
		callbacks.joined();
	}

	connected = true
})

socket.on('chat end', function(data) {
    socket.leave(currentRoom)
	currentRoom = ''
	leave(data.peerID)
})

function logError(error) {
	console.log("logError", error);
}

//------------------------------------------------------------------------------
//  Utils

//------------------------------------------------------------------------------
// Services

function getLocalStream(isFront, callback) {
	WebRTC.MediaStreamTrack.getSources(sourceInfos => {
		console.log('sourceInfos', sourceInfos);
		let videoSourceId;
		for (const i = 0; i < sourceInfos.length; i++) {
			const sourceInfo = sourceInfos[i];
			if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
				videoSourceId = sourceInfo.id;
			}
		}
		WebRTC.getUserMedia({
			audio: true,
			video: {
				mandatory: {
					minWidth: config.video.minWidth,
					minHeight: config.video.minHeight,
					minFrameRate: 30
				},
				facingMode: (isFront ? "user" : "environment"),
				optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
			}
		}, function (stream) {
			localStream = stream;
			console.log("Got Local Stream");
			callback(stream);
		}, (error) => {
			console.log("Get LocalStream Fail: ", error);
		});
	});
}

function broadcastMessage(message) {
	for (var key in peerConnections) {
		var pc = peerConnections[key];
		pc.textDataChannel.send(JSON.stringify(message));
	}
}

function getSocketId() {
	return socket.id
}

function _disconnect() {
	socket.close()
}

/**
 *
 * callbacks: {
 *    joined: function of () => {},
 *    friendConnected: (socketId, stream) => {},
 *    friendLeft: (socketId) => {},
 *    dataChannelMessage: (message) => {}
 * }
 *
 */
function join(name, _callbacks) {
	if (connected) {
		socket.emit('leave room')
        socket.leave(currentRoom)
		currentRoom = ''
		connected = false
		join(name, _callbacks)
	}
	else {
		onFriendLeftCallback = _callbacks.friendLeft;
		onFriendConnectedCallback = _callbacks.friendConnected;
		onDataChannelMessageCallback = _callbacks.dataChannelMessage;
		callbacks = _callbacks
		socket.emit('join', { name }, function (result) {
			// friends = result;
			// console.log('Joins', friends);
			// friends.forEach((friend) => {
			// 	createPeerConnection(friend, true);
			// });
		});
	}
}
//------------------------------------------------------------------------------
// Exports

module.exports = {
	join,
	getLocalStream,
	broadcastMessage,
	getSocketId,
	leave,
	_disconnect
}
