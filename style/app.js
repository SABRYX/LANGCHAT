import {StyleSheet} from 'react-native';
import config from "../src/config/app.js";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width: config.screenWidth,
    height: config.screenHeight,
    //borderWidth: 1, borderColor: "red"
  },
  logo: {
    position: "absolute",
    width: 100,
    height: 50,
    top: 0,
    left: 0,
    //borderWidth: 1, borderColor: "white"
    backgroundColor: "rgba(255, 255, 255, 0.5)"
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: config.screenWidth,
    height: config.screenHeight
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: config.screenWidth,
    height: config.screenHeight,
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },

  joinContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: config.screenWidth,
    height: config.screenHeight,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    paddingTop: 15,
    //borderWidth: 1, borderColor: "white"
  },

  joinLabel: {
    color: "deepskyblue",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10
  },
  joinLabel2: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10
  },
  joinName: {
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    textAlign: "center",
    color: "white"
  },
  joinButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    marginTop: 10,
    borderRadius: 100,
    backgroundColor: "deepskyblue"
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  },
	alert:{
		position: 'absolute',
		backgroundColor:'#cb1758', 
		zIndex: 3, 
    marginTop: config.screenHeight - 250,
    borderRadius: 5
  },
  profileIcon: {
    position: "absolute",
    top: 30,
    right: 18,
    zIndex: 2
  },
  friendsIcon: {
    position: "absolute",
    top: 30,
    left: 18,
    zIndex: 2
  },
  friendsContainer:{
    position: "absolute",
    width: 45,
    height: 45,
    top: 580,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    //borderWidth: 1, borderColor: "white"
  },
  speakerMicContainer:{
    position: "absolute",
    width: 45,
    height: 120,
    top: 250,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  alreadyFriendsButton:{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: "90%",
    height: "90%",
    borderRadius: 100,
    backgroundColor: "green"
  },
  waitingFriendButton:{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: "90%",
    height: "90%",
    borderRadius: 100,
    backgroundColor: "orange"
  },
  addFriendButton:{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: "90%",
    height: "90%",
    borderRadius: 100,
    backgroundColor: "#6ae4e0"
  },
  friendRequstedFromOtherUser:{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: "90%",
    height: "90%",
    borderRadius: 100,
    backgroundColor: "yellow"
  },
  micAndSpeaker:{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: "90%",
    height: "35%",
    marginBottom:"20%",
    borderRadius: 100,
    backgroundColor: "yellow"
  }

});
