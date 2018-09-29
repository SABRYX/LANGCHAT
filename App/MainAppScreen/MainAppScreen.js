import React, { Component } from "react";
import {
  TouchableHighlight,
  Image,
  BackHandler,
  TouchableOpacity,
  AsyncStorage,
  Platform,
  AppState,
  DeviceEventEmitter,
  ToastAndroid,
  ImageBackground
} from "react-native";
import {
  Button,
  Text,
  Icon,
  Header,
  Left,
  Right,
  Body,
  Title,
  Footer,
  FooterTab
} from "native-base";
import Thumbnails from "../../src/components/Thumbnails.js";
import FullScreenVideo from "../../src/components/FullScreenVideo.js";
import styles from "../../style/app.js";
import storage from "../services/storage";
import { View } from "react-native-animatable";
import webRTCServices from "../../src/lib/services.js";
import api from "../services/api";
import GestureRecognizer from "react-native-swipe-gestures";
import { globals } from "../services/globals";
import * as Animatable from "react-native-animatable";
import SplashScreen from "react-native-splash-screen";
const SELF_STREAM_ID = "self_stream_id";
var timer;

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
      gestureNotification: false,
      accessToken: "",
      alreadyFriends: null,
      friendRequest: null,
      friendRequested: null,
      socketId: null,
      friendId: null,
      friendRequstedFromId: null,
      BadgeCount: 5,
      fabActive: false,
      speaker: false,
      mic: false,
      trying: false,
      messageCount: 0
    };
  }

  async componentWillMount() {
    this.getLocalStream();
    this.retrieveData();
    storage.getItem(storage.keys.accessToken).then(result => {
      api.go_online(result).then(response => {
        console.log("goonline", response);
      });
      this.setState({ accessToken: result });
      // api.get_friend_requests_count(result).then((response)=>{console.log(response)
      // this.setState({BadgeCount:response})})
    });
  }

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("accessToken");
      const theToken = await AsyncStorage.getItem("accessToken");
      if (value !== null) {
        api.check_token(value, theToken).then(response => {
          this.setState({ accessToken: response.token });
          storage.setItem(storage.keys.accessToken, response.token);
          this.setState({ name: response.name });
          storage.setItem(storage.keys.name, response.name);
          storage.setItem(storage.keys.user, response);
          globals.user = response;
          webRTCServices.myId = response._id;
          console.log(webRTCServices.myId);
          storeData = async response => {
            try {
              await AsyncStorage.setItem("accessToken", response.token);
              await AsyncStorage.setItem("name", response.name);
              await AsyncStorage.setItem("user", response);
              await AsyncStorage.setItem("user_id", response._id);
            } catch (error) {
              console.log(error);
            }
          };
        });
        // api.get_messages_count(value).then(response => {
        //   this.setState({ messageCount: response });
        //   console.log("response", response);
        //   console.log("messageCount", this.state.messageCount);
        // });
      }
    } catch (error) {}
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", () => {
      return this.handleBackButton();
    });
    DeviceEventEmitter.addListener("ON_HOME_BUTTON_PRESSED", () => {
      console.log("You tapped the home button!");
    });
    globals.mainSocket.on("custom_message", data => {
      if (data.type == "exitCall") {
        if (globals.user.id === data.your_id) {
          this.handleFriendLeft();
        }
      } else if (data.type == "recieveAddFriend") {
        if (globals.user.id == data.data.your_id) {
          console.log(data, "datatatatat");
          this.handleFriendRequested(data.data);
        }
      } else if (data.type == "acceptedFriendRequest") {
        this.acceptedFriendRequest();
      }
    });
    ///////////////  EVENT LISTENER FOR APP STATE ///////////////////////
    AppState.addEventListener("change", state => {
      if (state === "active") {
        storage.getItem(storage.keys.accessToken).then(result => {
          api.go_online(result).then(response => {
            console.log(response);
          });
        });
      } else if (state === "background") {
        if (this.state.joinState === "joined") {
          storage.getItem(storage.keys.accessToken).then(result => {
            api.cancel_request(result).then(response => {
              console.log(response);
            });
            this.exitCall(result, this.state.friendId, this.state.socketId);
            console.log(this.state.friendId, this.state.socketId);
            api.go_offline(result).then(response => {
              console.log(response);
            });
          });
        } else if (this.state.joinState === "joining") {
          storage.getItem(storage.keys.accessToken).then(result => {
            api.cancel_request(result).then(response => {
              console.log(response);
            });
            api.go_offline(result).then(response => console.log(response));
          });
          this.setState({
            joinState: "ready",
            alreadyFriends: null,
            friendRequest: null,
            friendRequested: null,
            socketId: null,
            friendId: null,
            friendRequstedFromId: null
          });
        } else if (this.state.joinState == "ready") {
          storage.getItem(storage.keys.accessToken).then(result => {
            api.go_offline(result).then(response => {
              console.log(response);
            });
          });
        }
      } else if (state === "inactive") {
        console.log(this.state.joinState);
      }
    });
    SplashScreen.hide();
  }

  async componentWillUnmount() {
    AppState.removeEventListener("change");
    if (
      this.state.joinState === "joined" ||
      this.state.joinState === "joining"
    ) {
      const value = await AsyncStorage.getItem("accessToken");
      api.cancel_request(value).then(response => {
        console.log(response);
      });
      this.exitCall(
        this.state.accessToken,
        this.state.friendId,
        this.state.socketId
      );
    }
    BackHandler.removeEventListener("hardwareBackPress", () => {
      return this.handleBackButton();
    });
  }

  async handleBackButton() {
    if (this.state.joinState === "joined") {
      this.exitCall(
        this.state.accessToken,
        this.state.friendId,
        this.state.socketId
      );
      BackHandler.exitApp();
    } else if (this.state.joinState === "joining") {
      const value = await AsyncStorage.getItem("accessToken");
      api.cancel_request(value).then(response => {
        console.log(response);
      });
      this.setState({
        joinState: "ready",
        alreadyFriends: null,
        friendRequest: null,
        friendRequested: null,
        socketId: null,
        friendId: null,
        friendRequstedFromId: null
      });
    } else if (this.state.joinState == "ready") {
      BackHandler.exitApp();
    }
  }

  getLocalStream = () => {
    console.log("Here i am ");
    webRTCServices.getLocalStream(true, stream => {
      console.log("stream", stream);
      this.setState({
        activeStreamId: SELF_STREAM_ID,
        streams: [
          {
            id: SELF_STREAM_ID,
            url: stream.toURL()
          }
        ]
      });
    });
  };

  onSwipeDown(gestureState) {
    if (
      this.state.joinState == "joined" &&
      this.state.hideInfo == true &&
      this.state.gestureNotification == true
    ) {
      this.exitCall(
        this.state.accessToken,
        this.state.friendId,
        this.state.socketId
      );
    } else if (
      this.state.hideInfo == false &&
      this.state.joinState == "joined"
    ) {
      this.setState({ hideInfo: true });
    }
  }
  onSwipeRight(gestureState) {
    if (
      this.state.joinState == "joined" &&
      this.state.gestureNotification == true
    ) {
      this.handleRejoin();
    } else if (
      this.state.gestureNotification == false &&
      this.state.joinState == "joined"
    ) {
      this.setState({ gestureNotification: true });
    }
  }

  badgeGenerator() {
    if (this.state.BadgeCount > 0) {
      return (
        <Badge style={{ scaleX: 0.7, scaleY: 0.7, position: "absolute" }}>
          <Text>{this.state.BadgeCount}</Text>
        </Badge>
      );
    } else {
      return null;
    }
  }

  render() {
    let activeStreamResult = this.state.streams.filter(
      stream => stream.id == this.state.activeStreamId
    );
    console.log(activeStreamResult);
    let animationType;

    if (this.state.BadgeCount > 0) {
      animationType = "swing";
    }
    return (
      <GestureRecognizer
        onSwipeDown={state => this.onSwipeDown(state)}
        onSwipeRight={state => this.onSwipeRight(state)}
        config={{
          velocityThreshold: 0.3,
          directionalOffsetThreshold: 80
        }}
        style={styles.container}
      >
        <ImageBackground
          source={require("../../assets/mainbg.png")}
          style={{
            height: "100%",
            width: "100%"
          }}
        >
          <Header
            style={{
              marginTop: "5.8%",
              backgroundColor: "rgba(11, 27, 53,0.8)",
              elevation: 0,
              marginBottom: 0
            }}
            androidStatusBarColor="rgba(11, 27, 53,0.8)"
          >
            <Body
              style={{
                flex: 2,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Title
                style={{
                  color: "#9da0a6",
                  textAlign: "center",
                  marginLeft: "50%"
                }}
              >
                MAIN SCREEN
              </Title>
            </Body>
            <Right style={{ flex: 1 }}>
              <TouchableOpacity>
                <Icon
                  name="dots-three-vertical"
                  type="Entypo"
                  style={{ color: "#9da0a6", fontSize: 20 }}
                />
              </TouchableOpacity>
            </Right>
          </Header>
          <View
            style={{
              backgroundColor: "rgba(11, 27, 53,0.8)",
              flex: 1,
              zIndex: 190,
              marginTop: 0
            }}
          >
            <FullScreenVideo
              streamURL={
                activeStreamResult.length > 0 ? activeStreamResult[0].url : null
              }
              rejoin={this.handleRejoin.bind(this)}
            />
            {this.state.joinState == "joined" ? (
              <Thumbnails
                streams={this.state.streams}
                setActive={this.handleSetActive.bind(this)}
                activeStreamId={this.state.activeStreamId}
              />
            ) : null}
            {/* {this.fabIcons()} */}

            {/* {this.renderJoinContainer()} */}

            {this.state.joinState == "joined" &&
            this.state.streams.length > 1 &&
            !this.state.hideInfo &&
            !this.state.gestureNotification ? (
              <View
                style={[
                  styles.backgroundOverlay,
                  {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }
                ]}
              >
                <Icon
                  name="gesture-swipe-down"
                  type="MaterialCommunityIcons"
                  color="white"
                  fontSize={50}
                  style={{ color: "white" }}
                />
                <Text
                  style={[
                    styles.joinLabel,
                    { maxWidth: 220, textAlign: "center" }
                  ]}
                >
                  You can swipe down to close the call !
                </Text>
                <Text
                  style={[
                    styles.joinLabel2,
                    { maxWidth: 220, textAlign: "center" }
                  ]}
                >
                  Now Swipe Down To Continue !
                </Text>
              </View>
            ) : null}
            {this.renderGestureNotification()}
            {this.renderFriendStates()}
            {/* {this.renderSpeakerAndMicView()} */}
          </View>
          <Footer style={{ backgroundColor: "#275c6f", height: "9%" }}>
            <FooterTab style={{ backgroundColor: "#275c6f" }}>
              <Button
                onPress={() => this.props.navigation.navigate("UserSettings")}
              >
                <Icon name="gears" type="FontAwesome" style={{fontSize:24}}/>
              </Button>
              <Button onPress={() => this.props.navigation.navigate("Friends")}>
                <Icon name="people-outline" type="MaterialIcons"  style={{fontSize:34}}/>
              </Button>
              <Button style={{ marginBottom: "3%" }}>
                <Image
                  source={require("../../assets/logofinal.png")}
                  style={{
                    height: 65,
                    width: 65,
                    marginTop: "5%"
                  }}
                  resizeMode="contain"
                />
              </Button>
              <Button>
                <Icon active name="globe" type="SimpleLineIcons"  style={{fontSize:24}}/>
              </Button>
              <Button>
                <Icon name="calendar" type="EvilIcons" style={{fontSize:38}} />
              </Button>
            </FooterTab>
          </Footer>
        </ImageBackground>
      </GestureRecognizer>
    );
  }
  renderGestureNotification() {
    if (
      this.state.gestureNotification == false &&
      this.state.hideInfo == true
    ) {
      return (
        <View
          style={[
            styles.backgroundOverlay,
            { display: "flex", justifyContent: "center", alignItems: "center" }
          ]}
        >
          <View
            style={[
              styles.backgroundOverlay,
              {
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }
            ]}
          >
            <Icon
              name="gesture-swipe-right"
              type="MaterialCommunityIcons"
              color="white"
              fontSize={50}
              style={{ color: "white" }}
            />
            <Text
              style={[styles.joinLabel, { maxWidth: 220, textAlign: "center" }]}
            >
              You can swipe right to connect randomly to another person!
            </Text>
            <Text
              style={[
                styles.joinLabel2,
                { maxWidth: 220, textAlign: "center" }
              ]}
            >
              Now Swipe right To Continue !
            </Text>
          </View>
        </View>
      );
    }
    return null;
  }

  // renderJoinContainer() {
  //   if (this.state.streams.length <= 1) {
  //     return (
  //       <View style={[styles.joinContainer]}>
  //         {/* <Pulse color='#6ae4e0' numPulses={3} diameter={300} speed={20} duration={2000} /> */}
  //         <TouchableHighlight
  //           style={styles.joinButton}
  //           activeOpacity={0}
  //           onPress={() => {
  //             if (this.state.joinState == "ready") {
  //               this.setState({ trying: true });
  //               this.handleJoinClick();
  //             } else if (this.state.joinState == "joining") {
  //               this.handleJoinClickDismiss();
  //             }
  //           }}
  //         >
  //           {this.state.joinState == "ready" ? (
  //             <Icon style={{ color: "white", fontSize: 50 }} name="ios-happy" />
  //           ) : (
  //             <Spinner color="white" />
  //           )}
  //         </TouchableHighlight>
  //         {this.state.joinState == "ready" ? (
  //           <Text style={styles.joinLabel}>
  //             Click to connect to a random person!
  //           </Text>
  //         ) : (
  //           <Text style={styles.joinLabel}>Connecting...</Text>
  //         )}
  //       </View>
  //     );
  //   }
  //   return null;
  // }
  renderFriendStates() {
    if (
      this.state.joinState == "joined" &&
      this.state.hideInfo == true &&
      this.state.gestureNotification == true
    ) {
      if (this.state.alreadyFriends == true) {
        return (
          <View style={[styles.friendsContainer]}>
            <TouchableOpacity
              style={styles.alreadyFriendsButton}
              activeOpacity={0}
              onPress={() => {
                ToastAndroid.show(
                  "you are already friends",
                  ToastAndroid.SHORT
                );
              }}
            >
              <Icon
                style={{ color: "white", fontSize: 30 }}
                name="check-circle"
                type="Feather"
              />
            </TouchableOpacity>
          </View>
        );
      } else if (
        this.state.alreadyFriends == false &&
        this.state.hideInfo == true
      ) {
        if (
          this.state.friendRequest == true &&
          this.state.alreadyFriends == false
        ) {
          return (
            <View style={[styles.friendsContainer]}>
              <TouchableOpacity
                style={styles.waitingFriendButton}
                activeOpacity={0}
                onPress={() => {
                  ToastAndroid.show("pending", ToastAndroid.SHORT);
                }}
              >
                <Icon
                  style={{ color: "white", fontSize: 30 }}
                  name="send"
                  type="FontAwesome"
                />
              </TouchableOpacity>
            </View>
          );
        } else if (this.state.friendRequested == false) {
          return (
            <View style={[styles.friendsContainer]}>
              <TouchableOpacity
                style={styles.addFriendButton}
                activeOpacity={0}
                onPress={() => {
                  ToastAndroid.show("friend request sent", ToastAndroid.SHORT);
                  this.setState({ friendRequest: true });
                  this.handleSendFriendRequest(
                    this.state.friendId,
                    globals.user.id
                  );
                }}
              >
                <Icon
                  style={{ color: "white", fontSize: 30 }}
                  name="person-add"
                  type="MaterialIcons"
                />
              </TouchableOpacity>
            </View>
          );
        } else if (
          this.state.friendRequested == true &&
          this.state.friendRequest == false
        ) {
          return (
            <View style={[styles.friendsContainer]}>
              <TouchableOpacity
                style={styles.friendRequstedFromOtherUser}
                activeOpacity={0}
                onPress={() => {
                  ToastAndroid.show(
                    "accepted friend request",
                    ToastAndroid.SHORT
                  );
                  this.handleAcceptFriendRequest(
                    this.state.friendRequstedFromId
                  );
                  console.log(this.state.friendRequstedFromId);
                }}
              >
                <Icon
                  style={{ color: "white", fontSize: 30 }}
                  name="call-received"
                  type="MaterialIcons"
                />
              </TouchableOpacity>
            </View>
          );
        }
      }
      return null;
    }
  }
  // renderSpeakerAndMicView(){
  // 	if (this.state.joinState==="joined" && Platform.OS === 'android'){
  // 		return(
  // 			<View style={[styles.speakerMicContainer]}>
  // 				<TouchableOpacity style={styles.micAndSpeaker} onPress={()=>{this.setState({speaker:!this.state.speaker}); webRTCServices.mutateMicAndSpeaker("speaker")} }>
  // 					{ this.state.speaker ?<Icon name="volume-strike" type="Foundation"/>:<Icon name="volume" type="Foundation"/>}
  // 				</TouchableOpacity>
  // 				<TouchableOpacity style={styles.micAndSpeaker} onPress={()=>{this.setState({mic:!this.state.mic});webRTCServices.mutateMicAndSpeaker("mic") }}>
  // 					{ this.state.mic ?<Icon name="microphone-slash" type="FontAwesome"/>:<Icon name="microphone" type="FontAwesome"/>}
  // 				</TouchableOpacity>
  // 			</View>
  // 		)
  // 	}else if (this.state.joined=== "joined" && Platform.OS === "ios"){
  // 		return(
  // 			<View style={[styles.speakerMicContainer]} onPress={()=>{this.setState({mic:!mic}); webRTCServices.mutateMicAndSpeaker("mic")}}>
  // 				<TouchableOpacity style={styles.micAndSpeaker}>
  // 					{ this.state.mic ?<Icon name="microphone-slash" type="FontAwesome"/>:<Icon name="microphone" type="FontAwesome"/>}
  // 				</TouchableOpacity>
  // 			</View>
  // 		)
  // 	}
  // }

  handleSetActive(streamId) {
    this.setState({
      activeStreamId: streamId,
      socketId: streamId
    });
  }

  handleRejoin() {
    setTimeout(() => {
      this.handleJoinClick(), 2000;
    });

    this.exitCall(
      this.state.accessToken,
      this.state.friendId,
      this.state.socketId
    );
  }
  async handleJoinClick() {
    console.log("here here here");
    if (this.state.joinState == "ready") {
      this.setState({
        joinState: "joining",
        trying: true
      });
    }
    let callbacks = {
      joined: this.handleJoined.bind(this),
      friendConnected: this.handleFriendConnected.bind(this),
      dataChannelMessage: this.handleDataChannelMessage.bind(this)
    };
    api.get_room(this.state.accessToken).then(response => {
      console.log("get room", response);
      if (response.message != "added to waiting list or already in!") {
        this.setState({
          friendId: response.friend_id,
          alreadyFriends: response.user_is_friend,
          friendRequest: response.user_is_friend_request,
          friendRequested: response.user_is_friend_requested,
          trying: false
        });
        clearTimeout(timer);
        console.log(this.state);
        webRTCServices.join(response.room_token, this.state.name, callbacks);
      } else if (response.message == "added to waiting list or already in!") {
        if (this.state.trying == true) {
          timer = setTimeout(() => {
            this.handleJoinClick();
          }, 2000);
          console.log(timer);
        }
      }
    });
  }

  async handleJoinClickDismiss() {
    if (this.state.joinState != "ready") {
      this.setState({
        joinState: "ready",
        alreadyFriends: null,
        friendRequest: null,
        friendRequested: null,
        socketId: null,
        friendId: null,
        friendRequstedFromId: null,
        trying: false
      });
      const value = await AsyncStorage.getItem("accessToken");
      api.cancel_request(value).then(response => {
        console.log(response);
      });
      clearTimeout(timer);
    }
  }

  //----------------------------------------------------------------------------
  //  WebRTC service callbacks
  handleJoined() {
    this.setState({
      joinState: "joined"
    });
  }

  exitCall(accessToken, friend_id, socketId) {
    if (socketId == null) {
      this.handleJoinClick();
    }
    webRTCServices.exitCallFromOtherUser(accessToken, friend_id);
    webRTCServices.exitCall(socketId);

    this.setState({
      joinState: "ready",
      alreadyFriends: null,
      friendRequest: null,
      friendRequested: null,
      socketId: null,
      friendId: null,
      friendRequstedFromId: null
    });
    this.getLocalStream();
  }

  handleFriendLeft() {
    this.setState({
      joinState: "ready",
      alreadyFriends: null,
      friendRequest: null,
      friendRequested: null,
      socketId: null,
      friendId: null,
      friendRequstedFromId: null
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
    });

    if (socketId != SELF_STREAM_ID) {
      this.handleSetActive(socketId);
    }
  }

  handleDataChannelMessage(message) {}

  handleSendFriendRequest(to, from) {
    console.log("tooooo", to);
    globals.mainSocket.emit("custom_message", {
      type: "recieveAddFriend",
      data: { your_id: to, from: from }
    });
    api.add_friend(to, this.state.accessToken).then(response => {
      console.log("hello");
      console.log(response);
    });
  }

  handleFriendRequested(data) {
    this.setState({ friendRequested: true, friendRequstedFromId: data.from });
  }

  handleAcceptFriendRequest(to) {
    if (this.state.friendId == to) {
      api.accept_friend_request(to, this.state.accessToken).then(response => {
        console.log("accept_friend_request");
        console.log(response);
        console.log("helloitsme");
        this.setState({ alreadyFriends: true });
      });
      globals.mainSocket.emit("custom_message", {
        type: "acceptedFriendRequest"
      });
    }
    // else if(this.state.friendRequstedFromId==null && this.state.friendId!=null){
    // 	api.accept_friend_request(this.state.friendId,this.state.accessToken).then((response) => {
    // 		console.log("accept_friend_request",response)
    // 	});
    // 	globals.mainSocket.emit("custom_message", { type: 'acceptedFriendRequest'});
    // }
  }
  acceptedFriendRequest() {
    this.setState({ alreadyFriends: true });
  }
  // fabIcons() {
  //   if (this.state.joinState == "ready" && this.state.messageCount > 0) {
  //     return (
  //       <Fab
  //         active={this.state.fabActive}
  //         direction="up"
  //         containerStyle={{ zIndex: 2, height: "28%" }}
  //         style={{ backgroundColor: "deepskyblue" }}
  //         position="bottomLeft"
  //         onPress={() => this.setState({ fabActive: !this.state.fabActive })}
  //       >
  //         <Animatable.View
  //           animation={"flash"}
  //           iterationCount="infinite"
  //           duration={4000}
  //           style={{ zIndex: 2 }}
  //         >
  //           <Icon
  //             name="message-settings-variant"
  //             type="MaterialCommunityIcons"
  //             style={{ color: "white", fontSize: 30 }}
  //           />
  //         </Animatable.View>
  //         <Button
  //           style={{ backgroundColor: "purple" }}
  //           onPress={() => this.props.navigation.navigate("UserSettings")}
  //         >
  //           <Icon
  //             style={{ color: "white", fontSize: 20 }}
  //             name="account-settings-variant"
  //             type="MaterialCommunityIcons"
  //           />
  //         </Button>
  //         <Button
  //           style={{ backgroundColor: "indigo" }}
  //           onPress={() => {
  //             this.props.navigation.navigate("Friends");
  //           }}
  //         >
  //           <Animatable.View
  //             animation={"flash"}
  //             iterationCount="infinite"
  //             duration={4000}
  //             style={{ zIndex: 2 }}
  //           >
  //             <Icon
  //               style={{ color: "white", fontSize: 20 }}
  //               name="chat"
  //               type="Entypo"
  //             />
  //           </Animatable.View>
  //         </Button>
  //       </Fab>
  //     );
  //   } else if (
  //     this.state.joinState == "ready" &&
  //     this.state.messageCount == 0
  //   ) {
  //     return (
  //       <Fab
  //         active={this.state.fabActive}
  //         direction="up"
  //         containerStyle={{ zIndex: 2, height: "28%" }}
  //         style={{ backgroundColor: "deepskyblue" }}
  //         position="bottomLeft"
  //         onPress={() => this.setState({ fabActive: !this.state.fabActive })}
  //       >
  //         <Icon
  //           name="message-settings-variant"
  //           type="MaterialCommunityIcons"
  //           style={{ color: "white", fontSize: 30 }}
  //         />
  //         <Button
  //           style={{ backgroundColor: "purple" }}
  //           onPress={() => this.props.navigation.navigate("UserSettings")}
  //         >
  //           <Icon
  //             style={{ color: "white", fontSize: 20 }}
  //             name="account-settings-variant"
  //             type="MaterialCommunityIcons"
  //           />
  //         </Button>
  //         <Button
  //           style={{ backgroundColor: "indigo" }}
  //           onPress={() => {
  //             this.props.navigation.navigate("Friends");
  //           }}
  //         >
  //           <Icon
  //             style={{ color: "white", fontSize: 20 }}
  //             name="chat"
  //             type="Entypo"
  //           />
  //         </Button>
  //       </Fab>
  //     );
  //   }
  // }
}

//// this is exit call function
//this.exitCall(this.state.accessToken,this.state.friendId,this.state.socketId)
