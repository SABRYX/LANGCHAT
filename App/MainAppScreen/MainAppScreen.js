import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, View, ListView, Image, TextInput, DeviceEventEmitter,BackHandler,TouchableOpacity } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { Button, Text, Icon, Spinner,Fab, Container } from 'native-base';
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
import GestureRecognizer  from 'react-native-swipe-gestures'; 


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
			gestureNotification:false,
			accessToken: '',
			alreadyFriends:null,
			friendRequest:null,
			friendRequested:null,
			socketId:null,
			friendId:null,
			friendRequstedFromId:null,
			BadgeCount:0,
			fabActive:false,
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
			if (data.type == 'exitCall'){
					if (globals.user.id===data.your_id){
						this.handleFriendLeft();
					}
			 }else if(data.type == "recieveAddFriend"){
				 if(globals.user.id==data.data.your_id){
					 console.log(data,"datatatatat")
					 this.handleFriendRequested(data.data)
				 }
			 }else if(data.type == "acceptedFriendRequest"){
				 this.acceptedFriendRequest();
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
		  if(this.state.joinState === "joined"){
			this.exitCall(this.state.accessToken,this.state.friendId,this.state.socketId);
			BackHandler.exitApp();
		  }
		  else if (this.state.joinState === "joining" ){
			this.setState({
				joinState:"ready",
				alreadyFriends:null,
				friendRequest:null,
				friendRequested:null,
				socketId:null,
				friendId:null,
				friendRequstedFromId:null,})
				
		  }else if(this.state.joinState == "ready"){
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

	onSwipeDown(gestureState) {
		if (this.state.joinState=="joined"&&this.state.hideInfo==true&&this.state.gestureNotification==true){
			this.exitCall(this.state.accessToken,this.state.friendId,this.state.socketId);
		}else if (this.state.hideInfo==false && this.state.joinState=="joined"){
			this.setState({hideInfo:true})
		}
					  
	  }
	  onSwipeRight(gestureState){
		if (this.state.joinState=="joined"&&this.state.gestureNotification==true){
			this.handleRejoin()
		}else if (this.state.gestureNotification==false && this.state.joinState=="joined"){
			this.setState({gestureNotification:true})
		}
	  }
	  getMessagesCount(){
		  api.get_messages_count(this.state.accessToken).then((response)=>{
			  this.setState({BadgeCount:response})
		  }
		  )
	  }

	  badgeGenerator(){
        if(this.state.BadgeCount>0){
        return(<Badge style={{scaleX: 0.7, scaleY: 0.7,position:"absolute",}}>
            <Text>{this.state.BadgeCount}</Text>
        </Badge>)}else{return null}
    }
	
    render() {
		
	  let activeStreamResult = this.state.streams.filter(stream => stream.id == this.state.activeStreamId);
	  
      return (
		<GestureRecognizer
		onSwipeDown={(state) => this.onSwipeDown(state)}
		onSwipeRight={(state) => this.onSwipeRight(state)}
		config={{
		  velocityThreshold: 0.3,
		  directionalOffsetThreshold: 80
		}}
		style={styles.container}
		>
			<Container style={{backgroundColor: '#000', flex: 1, alignItems: 'center', justifyContent: 'space-between',}}>	

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
				{
				this.state.joinState=="ready" ?
				<Fab
					active={this.state.fabActive}
					direction="up"
					containerStyle={{zIndex:2 }}
					style={{ backgroundColor: 'deepskyblue' }}
					position="bottomLeft"
					onPress={() => this.setState({ fabActive: !this.state.fabActive })}>
				
					<Icon name="message-settings-variant" type="MaterialCommunityIcons" style={{color: 'white', fontSize: 35}} />
						<Button style={{ backgroundColor: 'purple' }} onPress={() => this.props.navigation.navigate("UserSettings")}>
							<Icon style={{color: 'white', fontSize: 30}} name="account-settings-variant"  type="MaterialCommunityIcons"/>
						</Button>
						<Button style={{ backgroundColor: 'indigo' }} onPress={() => {this.props.navigation.navigate("UserFriends")}}>
							<Icon style={{color: 'white', fontSize: 30}} name="chat"  type="Entypo"/>
						</Button>

				</Fab>
				:null		
			}

				{this.renderJoinContainer()}
				
				{
				this.state.joinState == "joined" && this.state.streams.length > 1 && !this.state.hideInfo && !this.state.gestureNotification ?
					<View style={[styles.backgroundOverlay, { display: 'flex', justifyContent: 'center', alignItems: 'center' }]}>
						<Icon name="gesture-swipe-down" type="MaterialCommunityIcons"  color="white" fontSize={50} style={{color:"white"}}  />
						<Text style={[styles.joinLabel, {maxWidth: 220, textAlign: 'center'}]}>You can swipe down to close the call !</Text>
						<Text style={[styles.joinLabel2, {maxWidth: 220, textAlign: 'center'}]}>Now Swipe Down To Continue !</Text>
					</View>
					: 
					null
				}
				{this.renderGestureNotification()}
				{this.renderFriendStates()}

        </Container>
		</GestureRecognizer>
      );
    }

	renderLogo() {
		return <Image source={logo} style={styles.logo} resizeMode={"contain"} />;
	}
	renderGestureNotification() {
		if (this.state.gestureNotification == false && this.state.hideInfo == true) {
			return (
				<View style={[styles.backgroundOverlay, { display: 'flex', justifyContent: 'center', alignItems: 'center' }]}>
						<View style={[styles.backgroundOverlay, { display: 'flex', justifyContent: 'center', alignItems: 'center' }]}>
							<Icon name="gesture-swipe-right" type="MaterialCommunityIcons" color="white" fontSize={50} style={{color:"white"}} />
							<Text style={[styles.joinLabel, {maxWidth: 220, textAlign: 'center'}]}>You can swipe right to connect randomly to another person!</Text>
							<Text style={[styles.joinLabel2, {maxWidth: 220, textAlign: 'center'}]}>Now Swipe right To Continue !</Text>
						</View>
				</View>
			)
		}
		return null;
	}

	renderJoinContainer() {
		if (this.state.streams.length <= 1) {
			return <View style={[styles.joinContainer]}>
				{/* <Pulse color='#6ae4e0' numPulses={3} diameter={300} speed={20} duration={2000} /> */}
				<TouchableHighlight style={styles.joinButton} activeOpacity={0}
					onPress={this.handleJoinClick.bind(this)}>
					{
						this.state.joinState == "ready" ?
						<Icon style={{color: 'white', fontSize: 50}} name="ios-happy" />
						:
						<Spinner color='white'/>
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
		if ( this.state.joinState == "joined" && this.state.hideInfo == true && this.state.gestureNotification == true ){
			if (this.state.gestureNotification == true){
			if (this.state.alreadyFriends == true){
				return(
					<View style={[styles.friendsContainer]}>
						<TouchableOpacity style={styles.alreadyFriendsButton} activeOpacity={0}
							onPress={()=>{alert("you are already friends");}}>
								<Icon style={{color: 'white', fontSize: 30}} name="check-circle" type="Feather" />
						</TouchableOpacity>
					</View>
				)
			}
			else if(this.state.alreadyFriends == false && this.state.hideInfo == true ){
				if(this.state.friendRequest==true && this.state.alreadyFriends == false){
					return(
						<View style={[styles.friendsContainer]}>
							<TouchableOpacity style={styles.waitingFriendButton} activeOpacity={0}
								onPress={()=>{alert("pending");}}>
									<Icon style={{color: 'white', fontSize: 30}} name="send" type="FontAwesome" />
							</TouchableOpacity>
						</View>
					)
				}else if(this.state.friendRequested == false ){
					return(
						<View style={[styles.friendsContainer]}>
							<TouchableOpacity style={styles.addFriendButton} activeOpacity={0}
								onPress={()=>{alert("added");this.setState({friendRequest:true});this.handleSendFriendRequest(this.state.friendId,globals.user.id)}}>
									<Icon style={{color: 'white', fontSize: 30}} name="person-add" type="MaterialIcons" />
							</TouchableOpacity>
						</View>
					)
				}else if (this.state.friendRequested == true && this.state.friendRequest == false){
					return(
						<View style={[styles.friendsContainer]}>
							<TouchableOpacity style={styles.friendRequstedFromOtherUser} activeOpacity={0}
								onPress={()=>{alert("you accepted friend Request"); this.handleAcceptFriendRequest(this.state.friendRequstedFromId); console.log(this.state.friendRequstedFromId)}}>
									<Icon style={{color: 'white', fontSize: 30}} name="call-received" type="MaterialIcons" />
							</TouchableOpacity>
						</View>
							)
					}
			
				}
			return null;
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
		setTimeout(()=>{this.exitCall(),200}) 
		this.setState({
			joinState: "joining",
			streams: this.state.streams.filter(stream => stream.id == SELF_STREAM_ID)
		});
	}

	async handleJoinClick() {
		if (this.state.joinState=="ready"){
			this.setState({
			joinState: "joining"
			});
		let callbacks = {
			joined: this.handleJoined.bind(this),
			friendConnected: this.handleFriendConnected.bind(this),
			dataChannelMessage: this.handleDataChannelMessage.bind(this),
		}

		api.get_room(this.state.accessToken).then((response) => {
			this.setState({
				friendId:response.friend_id,
				alreadyFriends:response.user_is_friend,
				friendRequest:response.user_is_friend_request,
				friendRequested:response.user_is_friend_requested,})
			webRTCServices.join(response.room_token, this.state.name, callbacks);
		})
		
	}
		if (this.state.name.length == 0 || this.state.joinState != 'ready') {
				this.setState({
				joinState:"ready",
				alreadyFriends:null,
				friendRequest:null,
				friendRequested:null,
				socketId:null,
				friendId:null,
				friendRequstedFromId:null,})
		}
		
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
			alreadyFriends:null,
			friendRequest:null,
			friendRequested:null,
			socketId:null,
			friendId:null,
			friendRequstedFromId:null, 
		});
		this.getLocalStream();
	}


	handleFriendLeft() {
		this.setState({
			joinState: "ready",
			alreadyFriends:null,
			friendRequest:null,
			friendRequested:null,
			socketId:null,
			friendId:null,
			friendRequstedFromId:null, 
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

	

	handleDataChannelMessage(message) {}

	handleSendFriendRequest(to,from){
		console.log("tooooo",to);
		globals.mainSocket.emit("custom_message", { type: 'recieveAddFriend', data: { your_id:to,from:from}});
		console.log(to,this.state.accessToken)	
		api.add_friend(to,this.state.accessToken).then((response) => {
				console.log(response)
			});
	}

	handleFriendRequested(data){
		this.setState({friendRequested:true,friendRequstedFromId:data.from})
	}

	handleAcceptFriendRequest(to){
		if (this.state.friendId==to){
		api.accept_friend_request(to,this.state.accessToken).then((response) => {
			console.log(response)
			console.log("helloitsme")
			this.setState({alreadyFriends:true});
		});
		globals.mainSocket.emit("custom_message", { type: 'acceptedFriendRequest'});
	}
		else if(this.state.friendRequstedFromId==null && this.state.friendId!=null){
			api.accept_friend_request(this.state.friendId,this.state.accessToken).then((response) => {
				console.log(response)
			});
			globals.mainSocket.emit("custom_message", { type: 'acceptedFriendRequest'});
		}
	}
	acceptedFriendRequest(){
		this.setState({alreadyFriends:true});
	}

}
	


//// this is exit call function 
//this.exitCall(this.state.accessToken,this.state.friendId,this.state.socketId)
