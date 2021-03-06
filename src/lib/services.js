import WebRTC from 'react-native-webrtc';
import config from "../config/app.js";
import {globals} from "../../App/services/globals.js";
import api from '../../App/services/api';
import InCallManager from 'react-native-incall-manager';
import {Platform} from "react-native"
import { DeviceEventEmitter } from 'react-native';

let speaker = false ; 
let mic = false ; 
let onFriendConnectedCallback = null;
let onDataChannelMessageCallback = null;

const socketIOClient = require('socket.io-client');
let socket = socketIOClient('http://192.168.1.20:6001', { transports: ['websocket'], jsonp: false, autoConnect: true });

var configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
var peerConnections = {}; //map of {socketId: socket.io id, RTCPeerConnection}
let localStream = null;
let friends = null; //list of {socketId, name}
let me = null; //{socketId, name}
let myId = null;

function createPeerConnection(friend, isOffer, onDataChannelMessage) {
	let socketId = friend.socketId;
	var retVal = new WebRTC.RTCPeerConnection(configuration);

	peerConnections[socketId] = retVal;
	console.log(socketId)
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
		console.log('exchange sdp', data);
		pc.setRemoteDescription(new WebRTC.RTCSessionDescription(data.sdp), function () {
			if (pc.remoteDescription.type == "offer")
				pc.createAnswer(function (desc) {
					//console.log('createAnswer', desc);
					pc.setLocalDescription(desc, function () {
						console.log('setLocalDescription', pc.localDescription);
						socket.emit('exchange', { 'to': fromId, 'sdp': pc.localDescription });
					}, logError);
				}, logError);
		}, logError);
	} else {
		//console.log('exchange candidate', data);
		pc.addIceCandidate(new WebRTC.RTCIceCandidate(data.candidate));
	}
}



socket.on('exchange', function (data) {
	exchange(data);
});

socket.on('leave', function (socketId) {
	console.log("emitted")
	leave(socketId);
});

socket.on('connect', function (data) {
	console.log('connect')
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
	console.log("hola")
	WebRTC.MediaStreamTrack.getSources(sourceInfos => {
		console.log('sourceInfos',sourceInfos);
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
				optional: [{ sourceId: videoSourceId }]
			}
		}, function (stream) {
			localStream = stream;
			console.log("Got Local Stream",localStream);
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
	onFriendConnectedCallback = callbacks.friendConnected;
	onDataChannelMessageCallback = callbacks.dataChannelMessage;
	onFriendRequsted=callbacks.onFriendRequsted;
	socket.emit('join', { roomId, name }, function (result) {
		friends = result;
		console.log('Joins', friends);
		if (friends != []) {
			friends.forEach((friend) => {
			createPeerConnection(friend, true);
		});
		if (callbacks.joined != null) {
			me = {
				socketId: socket.id,
				name: name
			}
			callbacks.joined();
			inCallManagerHandler()
			
		}}
		else if(friends==[]){
			this.join(roomId, name, callbacks);
		}
	});
	// console.log("cortana")
}

function inCallManagerHandler(){
	if (Platform.OS === 'ios'){
		if (InCallManager.getIsWiredHeadsetPluggedIn()){
			InCallManager.start();
		}else{
			InCallManager.setForceSpeakerphoneOn(true)
		}
	}else if (Platform.OS === 'android'){
		InCallManager.start();
		InCallManager.setSpeakerphoneOn(true)
		InCallManager.setForceSpeakerphoneOn(speaker)
		InCallManager.setMicrophoneMute(mic)
		
	}
}

function exitCallFromOtherUser(accessToken,friend_id,callbacks){
	socket.emit("custom_message",{type:"exitCall",your_id:friend_id,callbacks})
	api.leave_room(accessToken,friend_id).then((response) => {
		console.log(response)
	})
}

function leave(socketId) {
	console.log('leave', socketId);
	var pc = peerConnections[socketId];
	if(pc){
		pc.close();
		InCallManager.stop();
	}
	delete peerConnections[socketId];
}

function exitCall(socketId){ 
	leave(socketId)
}
function mutateMicAndSpeaker (value) {
	if(value=="mic"){
		this.mic=!this.mic
		console.log(this.mic)
	}else if (value=="speaker"){
		this.speaker=!this.speaker
		console.log(this.speaker)
	}
}



//------------------------------------------------------------------------------
// Exports

module.exports = {
	join,
	countFriends,
	getLocalStream,
	broadcastMessage,
	leave,
	exitCallFromOtherUser,
	exitCall,
	mutateMicAndSpeaker

	
}
