import WebRTC from 'react-native-webrtc';
import config from "../config/app.js";
import {globals} from "../../App/services/globals.js";

let onFriendLeftCallback = null;
let onLeave = null;
let onFriendConnectedCallback = null;
let onDataChannelMessageCallback = null;

const socketIOClient = require('socket.io-client');
let socket = socketIOClient('http://192.168.1.38:9999/', { transports: ['websocket'], jsonp: false, autoConnect: true });

var configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
var peerConnections = {}; //map of {socketId: socket.io id, RTCPeerConnection}
let localStream = null;
let friends = null; //list of {socketId, name}
let me = null; //{socketId, name}

function createPeerConnection(friend, isOffer, onDataChannelMessage) {
	let socketId = friend.socketId;
	var retVal = new WebRTC.RTCPeerConnection(configuration);

	peerConnections[socketId] = retVal;

	retVal.onicecandidate = function (event) {
		console.log('onicecandidate');
		if (event.candidate) {
			socket.emit('exchange', { 'to': socketId, 'candidate': event.candidate });
		}
	};

	function createOffer() {
		retVal.createOffer(function (desc) {
			console.log('createOffer', desc);
			retVal.setLocalDescription(desc, function () {
				console.log('setLocalDescription', retVal.localDescription);
				socket.emit('exchange', { 'to': socketId, 'sdp': retVal.localDescription });
			}, logError);
		}, logError);
	}

	retVal.onnegotiationneeded = function () {
		console.log('onnegotiationneeded');
		if (isOffer) {
			createOffer();
		}
	}

	retVal.oniceconnectionstatechange = function (event) {
		console.log('oniceconnectionstatechange');
		if (event.target.iceConnectionState === 'connected') {
			createDataChannel();
		}
	};

	retVal.onsignalingstatechange = function (event) {
		console.log('onsignalingstatechange');
	};

	retVal.onaddstream = function (event) {
		console.log('onaddstream');
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
			console.log("dataChannel.onerror", error);
		};

		dataChannel.onmessage = function (event) {
			console.log("dataChannel.onmessage:", event.data);
			if (onDataChannelMessageCallback != null) {
				onDataChannelMessageCallback(JSON.parse(event.data));
			}
		};

		dataChannel.onopen = function () {
			console.log('dataChannel.onopen');
		};

		dataChannel.onclose = function () {
			console.log("dataChannel.onclose");
		};

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

	if (data.sdp) {
		//console.log('exchange sdp', data);
		pc.setRemoteDescription(new WebRTC.RTCSessionDescription(data.sdp), function () {
			if (pc.remoteDescription.type == "offer")
				pc.createAnswer(function (desc) {
					//console.log('createAnswer', desc);
					pc.setLocalDescription(desc, function () {
						//console.log('setLocalDescription', pc.localDescription);
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
	console.log('leave', socketId);
	var pc = peerConnections[socketId];
	pc.close();
	delete peerConnections[socketId];
	if (onFriendLeftCallback != null) {
		onFriendLeftCallback(socketId);
	}
	if (onLeave != null) {
		onLeave();
	}
}

socket.on('exchange', function (data) {
	exchange(data);
});

socket.on('leave', function (socketId) {
	leave(socketId);
});

socket.on('connect', function (data) {
	globals.mainSocket = socket;
});

socket.on("join", function (friend) {
	//new friend:
	friends.push(friend);
	console.log("New friend joint conversation: ", friend);
});

function logError(error) {
	console.log("logError", error);
}

//------------------------------------------------------------------------------
//  Utils

//------------------------------------------------------------------------------
// Services
function countFriends(roomId, callback) {
	socket.emit("count", roomId, (count) => {
		console.log("Count friends result: ", count);
		callback(count);
	});
}

function getLocalStream(isFront, callback) {
	WebRTC.MediaStreamTrack.getSources(sourceInfos => {
		console.log(sourceInfos);
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
function join(roomId, name, callbacks) {
	onFriendLeftCallback = callbacks.friendLeft;
	onLeave = callbacks.leave;
	onFriendConnectedCallback = callbacks.friendConnected;
	onDataChannelMessageCallback = callbacks.dataChannelMessage;
	socket.emit('join', { roomId, name }, function (result) {
		friends = result;
		console.log('Joins', friends);
		friends.forEach((friend) => {
			createPeerConnection(friend, true);
		});
		if (callbacks.joined != null) {
			me = {
				socketId: socket.id,
				name: name
			}
			callbacks.joined();
		}
	});
}
//------------------------------------------------------------------------------
// Exports

module.exports = {
	join,
	countFriends,
	getLocalStream,
	broadcastMessage
}
