import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, View, ListView, Image, TextInput, DeviceEventEmitter,BackHandler } from 'react-native';
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
import { Actions } from 'react-native-router-flux';
import {Dimensions} from 'react-native';
import Pulse from 'react-native-pulse';
import Colors from '../AppGlobalConfig/Colors/Colors';
import api from '../services/api';

//const sampleFullScreenURL = require("./image/sample-image-2.jpg");
const logo = require("../../image/logo.png");
const FRONT_CAMERA = true;
const VIDEO_CONFERENCE_ROOM = "video_conference";

const SELF_STREAM_ID = "self_stream_id";
const iconWidth = (width * 52) / 100;

const langChat = require('../../assets/langchat.png');
const doubleTapImage = require('../../assets/double_tap.png');
import { globals } from "../services/globals";


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
			accessToken: ''
		}
	}

	async componentDidMount() {
		this.getLocalStream();
		BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

		await storage.getItem(storage.keys.accessToken).then((accessToken) => {
			this.setState({accessToken})
			api.refresh(accessToken).then((response) => {
				if (response.message && response.message == "Unauthenticated.") {
					api.logout(accessToken).then(() => {
						storage.removeItem(storage.keys.accessToken)
						storage.clear()
						Actions.push('logSignScreen')
					})
				}
				else {
					this.setState({accessToken: response.access_token})
					storage.setItem(storage.keys.accessToken, response.access_token)
					this.setState({name: response.user.name})
					storage.setItem(storage.keys.name, response.user.name)
					storage.setItem(storage.keys.user, response.user)
					globals.user = response.user
				}
			})
        })
	}

	componentWillUnmount() {
		this.handleLeave()
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
	}
	  handleBackButton() {
        ToastAndroid.show('Back button is pressed', ToastAndroid.SHORT);
        return true;
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
			
			<TouchableHighlight style={styles.profileIcon} onPress={() => Actions.push('userSettings')}>
				<Icon style={{color: 'white', fontSize: 35}} name="md-contact" />
			</TouchableHighlight>

			<TouchableHighlight style={styles.friendsIcon} onPress={() => {Actions.push('containerOfTabs');console.log("holahola")}}>
				<Icon style={{color: 'white', fontSize: 35}} name="md-contacts" />
			</TouchableHighlight>

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
        </View>
      );
    }

	renderLogo() {
		return <Image source={logo} style={styles.logo} resizeMode={"contain"} />;
	}

	renderJoinContainer() {
		if (this.state.streams.length <= 1) {
			return <View style={[styles.joinContainer]}>
				<Pulse color='#26A65B' numPulses={2} diameter={300} speed={20} duration={2000} />
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

	handleSetActive(streamId) {
		this.setState({
			activeStreamId: streamId
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
			friendLeft: this.handleFriendLeft.bind(this),
			dataChannelMessage: this.handleDataChannelMessage.bind(this),
			leave: this.handleLeave.bind(this)
		}

		api.get_room(this.state.accessToken).then((response) => {
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

	handleLeave() {
		api.leave_room(this.state.accessToken)
	}

	handleFriendLeft(socketId) {
		let newState = {
			streams: this.state.streams.filter(stream => stream.id != socketId)
		}
		if (this.state.activeStreamId == socketId) {
			newState.activeStreamId = newState.streams[0].id;
		}
		this.setState(newState);
		this.handleJoinClick()	
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
}

