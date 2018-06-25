import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, View, ListView, Image, TextInput, DeviceEventEmitter,BackHandler,TouchableOpacity } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { Button, Text, Icon, Spinner } from 'native-base';
import Thumbnails from "../../src/components/Thumbnails.js";
import FullScreenVideo from "../../src/components/FullScreenVideo.js";
import Commons from "../../src/lib/commons.js";
import styles from "../../style/app.js";
import config from "../../src/config/app.js";
import InCallManager from 'react-native-incall-manager';
import storage from '../services/storage'
import webRTCServices from '../../src/lib/services.js';
import {Dimensions} from 'react-native';
import Pulse from 'react-native-pulse';
import Colors from '../AppGlobalConfig/Colors/Colors';
import api from '../services/api';
import { EventRegister } from 'react-native-event-listeners'


//const sampleFullScreenURL = require("./image/sample-image-2.jpg");
const logo = require("../../image/logo.png");
const FRONT_CAMERA = true;
const VIDEO_CONFERENCE_ROOM = "video_conference";

const SELF_STREAM_ID = "self_stream_id";
const iconWidth = (width * 52) / 100;

const langChat = require('../../assets/langchat.png');
const doubleTapImage = require('../../assets/double_tap.png');
import { globals } from "../services/globals";
const socketIOClient = require('socket.io-client');
let socket = socketIOClient('http://192.168.1.30:9999/', { transports: ['websocket'], jsonp: false, autoConnect: true });

var configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };


export default class MainAppScreen extends Component {

	constructor(props) {
		super(props);
		this.state = {
			activeStreamId: null,
			streamURLs: [],
			streams: [], //list of (id, url: friend Stream URL). Id = socketId
			joinState: "ready", //joining, joined
			name: "",
			hideInfo: false,
			accessToken: '',
			alreadyFriends:true,
			friendRequsted:null,
			socketId:null,
			friendId:null,
		}
	}

	async componentWillMount() {
		this.getLocalStream();
		await storage.getItem(storage.keys.accessToken).then((accessToken) => {
			this.setState({accessToken})
			api.refresh(accessToken).then((response) => {
				if (response.message && response.message == "Unauthenticated.") {
					api.logout(accessToken).then(() => {
						storage.removeItem(storage.keys.accessToken)
						storage.clear()
						this.props.navigation.navigate("LogSignScreen")
					})
				}
				else {
					this.setState({accessToken: response.access_token})
					storage.setItem(storage.keys.accessToken, response.access_token)
					this.setState({name: response.user.name})
					storage.setItem(storage.keys.name, response.user.name)
					storage.setItem(storage.keys.user, response.user)
					globals.user = response.user
					webRTCServices.myId=response.user.id

				}
			})
		})
		
	}
	componentDidMount(){
		BackHandler.addEventListener('hardwareBackPress',()=> {return this.handleBackButton()});
		socket.on('custom_message', (data) => {
			console.log("recived a custom message")
			if(data.type == 'friend_request') {
				if(data.friend_id == myId){
					if (onFriendRequsted != null) {
						onFriendRequsted(JSON.parse(data));
					}
				}
			 }else if (data.type == 'exitCall'){
					if (globals.user.id===data.your_id){
						this.handleFriendLeft();
					}
			 }
		});
	}
	componentWillUnmount() {
		if (this.state.joinState === "joined" || this.state.joinState === "joining" ){
			this.exitCall(this.state.accessToken,this.state.friendId,this.state.socketId);
		  }
		BackHandler.removeEventListener('hardwareBackPress', ()=> {return this.handleBackButton()});
	}
	  handleBackButton() {
		  if (this.state.joinState === "joined" || this.state.joinState === "joining" ){
			this.exitCall(this.state.accessToken,this.state.friendId,this.state.socketId);
		  }else{
			BackHandler.exitApp();
		  }
		  
    }

	getLocalStream = () => {
		webRTCServices.getLocalStream(true, (stream) => {
			this.setState({
				activeStreamId: SELF_STREAM_ID,
				streams: [{
					id: SELF_STREAM_ID,
					url: stream.toURL()
				}]
			})
		});
	}
  
    render() {
	  let activeStreamResult = this.state.streams.filter(stream => stream.id == this.state.activeStreamId);
	  
      return (
        <View style={{
          backgroundColor: '#000', flex: 1, alignItems: 'center', justifyContent: 'space-between',
        }}
        >	
            <FullScreenVideo 
			  streamURL={activeStreamResult.length > 0 ? activeStreamResult[0].url : null}
			  rejoin={this.handleRejoin.bind(this)}>
			</FullScreenVideo>
            {
              this.state.joinState == "joined"?
                <Thumbnails streams={this.state.streams}
                  setActive={this.handleSetActive.bind(this)}
				  activeStreamId={this.state.activeStreamId}
				/>
				: null
			}
			
			<TouchableOpacity style={styles.profileIcon} onPress={() => this.props.navigation.navigate("UserSettings")}>
				<Icon style={{color: 'white', fontSize: 35}} name="account-circle"  type="MaterialIcons"/>
			</TouchableOpacity>

			<TouchableOpacity style={styles.friendsIcon} onPress={() => {this.props.navigation.navigate("UserFriends")}}>
				<Icon style={{color: 'white', fontSize: 35}} name="chat"  type="Entypo"/>
			</TouchableOpacity>

			{this.renderJoinContainer()}
			
			{
              this.state.joinState == "joined" && this.state.streams.length > 1 && !this.state.hideInfo ?
                <View style={[styles.backgroundOverlay, { display: 'flex', justifyContent: 'center', alignItems: 'center' }]}>
					<Image source={doubleTapImage} style={{width: 120, height: 120}} />
					<Text style={[styles.joinLabel, {maxWidth: 220, textAlign: 'center'}]}>You can double tap to connect randomly to another person!</Text>
					<Button style={{alignSelf: 'center', marginTop: 15}} small onPress={() => this.setState({ hideInfo: true })}>
						<Text>Continue</Text>
					</Button>
				</View>
				: null
			}
			{this.renderFriendStates()}
        </View>
      );
    }

	renderLogo() {
		return <Image source={logo} style={styles.logo} resizeMode={"contain"} />;
	}

	renderJoinContainer() {
		if (this.state.streams.length <= 1) {
			return <View style={[styles.joinContainer]}>
				<Pulse color='#6ae4e0' numPulses={3} diameter={300} speed={20} duration={2000} />
				<TouchableHighlight style={styles.joinButton} activeOpacity={0}
					onPress={this.handleJoinClick.bind(this)}>
					{
						this.state.joinState == "ready" ?
						<Icon style={{color: 'white', fontSize: 50}} name="ios-happy" />
						:
						<Spinner color='white' />
					}
				</TouchableHighlight>
				{
					this.state.joinState == "ready" ?
					<Text style={styles.joinLabel}>Click to connect to a random person!</Text>
					:
					<Text style={styles.joinLabel}>Connecting...</Text>
				}
			</View>
		}
		return null;
	}
	renderFriendStates(){
		if (this.state.joinState=="joined"){
			return(
			this.state.alreadyFriends ?
			<View style={[styles.friendsContainer]}>
				<TouchableOpacity style={styles.alreadyFriendsButton} activeOpacity={0}
					onPress={()=>{/* alert("you are already friends"); */this.exitCall(this.state.accessToken,this.state.friendId,this.state.socketId)}}>
						<Icon style={{color: 'white', fontSize: 50}} name="check-circle" type="Feather" />
				</TouchableOpacity>
			</View>
			:
			this.handleSendFriendRequest()
				)
			}
	}
	handleSendFriendRequest(){
		if(this.state.alreadyFriends==false){
			if(this.state.friendRequsted){
				return(
					<View style={[styles.friendsContainer]}>
						<TouchableOpacity style={styles.waitingFriendButton} activeOpacity={0}
							onPress={()=>{alert("pending");}}>
								<Icon style={{color: 'white', fontSize: 50}} name="send" type="FontAwesome" />
						</TouchableOpacity>
					</View>
				)
			}else if(this.state.friendRequsted == false){
				return(
					<View style={[styles.friendsContainer]}>
						<TouchableOpacity style={styles.addFriendButton} activeOpacity={0}
							onPress={()=>{alert("added");this.setState({friendRequsted:true})}}>
								<Icon style={{color: 'white', fontSize: 50}} name="person-add" type="MaterialIcons" />
						</TouchableOpacity>
					</View>
				)
			}else if (this.state.friendRequstedFromOtherUser){
					<View style={[styles.friendsContainer]}>
						<TouchableOpacity style={styles.friendRequstedFromOtherUser} activeOpacity={0}
							onPress={()=>{alert("you accepted friend Request");this.setState({alreadyFriends:true})}}>
								<Icon style={{color: 'white', fontSize: 50}} name="call-received" type="MaterialIcons" />
						</TouchableOpacity>
					</View>
			}
		
		}
	
	}

	handleSetActive(streamId) {
		this.setState({
			activeStreamId: streamId,
			socketId:streamId
		});
	}

	handleRejoin() {
		webRTCServices._disconnect()
		this.getLocalStream()
		this.setState({
			joinState: "joining",
			streams: this.state.streams.filter(stream => stream.id == SELF_STREAM_ID)
		});
	}

	async handleJoinClick() {
		if (this.state.name.length == 0 || this.state.joinState != 'ready') {
			console.log('handleClick', this.state.joinState)
			return;
		}

		console.log('handleClick2')
		this.setState({
			joinState: "joining"
		});
		let callbacks = {
			joined: this.handleJoined.bind(this),
			friendConnected: this.handleFriendConnected.bind(this),
			dataChannelMessage: this.handleDataChannelMessage.bind(this),
			onFriendRequsted:this.onFriendRequsted.bind(this),
		}

		api.get_room(this.state.accessToken).then((response) => {
			console.log(response)
			this.setState({friendId:response.friend_id})
			webRTCServices.join(response.room_token, this.state.name, callbacks);
		})
	}

	//----------------------------------------------------------------------------
	//  WebRTC service callbacks
	handleJoined() {
		this.setState({
			joinState: "joined"
		});
		
	}

	exitCall(accessToken,friend_id,socketId) {
		webRTCServices.exitCallFromOtherUser(accessToken,friend_id);
		webRTCServices.exitCall(socketId);
		this.setState({
			joinState: "ready", 
		});
		this.getLocalStream();
	}


	handleFriendLeft() {
		this.setState({
			joinState: "ready", 
		});
		this.getLocalStream();
	} 

	handleFriendConnected(socketId, stream) {
		this.setState({
			streams: [
				...this.state.streams,
				{
					id: socketId,
					url: stream.toURL()
				}
			]
		})

		if (socketId != SELF_STREAM_ID) {
			this.handleSetActive(socketId)
		}
	}

	
	addingFriend(){
		this.globals.mainSocket.emit("custom_message", { type: 'friend_request', data: { friend_id: 0 } })
	}
	onFriendRequsted(data){
		this.setState({friendRequsted:true});
		console.log(data)
	}



	handleDataChannelMessage(message) {}
}

