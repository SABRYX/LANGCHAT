import React, { Component } from "react";
import {
  ImageBackground,
  View,
  Image,
  Text,
  TouchableOpacity
} from "react-native";
import SplashScreen from "react-native-splash-screen";
import { Icon } from "native-base";
import Video from "react-native-video";
import HolaVideo from "../../assets/hola.mp4";
import RocketVideo from "../../assets/Rocket.mp4";
import config from "../../src/config/app";
import GestureRecognizer from "react-native-swipe-gestures";

export default class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: 1,
      rocketPlay: true
    };
  }
  componentDidMount() {
    SplashScreen.hide();
  }

  render() {
    let screen = this.state.screen;
    return (
      <GestureRecognizer
        onSwipeLeft={() => {if(this.state.screen<4){this.setState({ screen: this.state.screen + 1 })}}}
        config={{
          velocityThreshold: 0.3,
          directionalOffsetThreshold: 80
        }}
        style={{
          flex: 1,
          justifyContent: "center",
          width: config.screenWidth,
          height: config.screenHeight
          //borderWidth: 1, borderColor: "red"
        }}
      >
        <View>
          {this.state.screen === 1 ? this.ScreenOne() : null}
          {this.state.screen === 2 ? this.ScreenTwo() : null}
          {this.state.screen === 3 ? this.ScreenThree() : null}
          {this.state.screen === 4 ? this.ScreenFour() : null}
        </View>
      </GestureRecognizer>
    );
  }
  ScreenOne() {
    if (this.state.screen === 1) {
      return (
        <ImageBackground
          source={require("../../assets/mainbg.png")}
          style={{
            height: "100%",
            width: "100%"
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(11, 27, 53,0.8)",
              flex: 1,
              width: "100%",
              height: "100%",
              zIndex: 190
            }}
          >
            <Image
              source={require("../../assets/hello.png")}
              style={{
                height: 320,
                width: 320,
                marginLeft: "12%",
                marginTop: "5%"
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "500",
                color: "#9da0a6",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "8%"
              }}
            >
              WELCOME TO LANGCHAT
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#9da0a6",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "4%",
                marginLeft: "8%",
                marginRight: "8%"
              }}
            >
              jbaiudnjdn saadnsoidnoaisdnas dasndoasndoians
              dsa'ndoi'andsoinasoidnaw aisdnonasoidnoiasnd sdonao'sndoinadoisnd
              aosindoainsdinaside[f ]as[fmsdmfosmdfp[ms[dmf dmfpsdmfomsdfp dsfom
            </Text>
            <Image
              source={require("../../assets/dots.png")}
              style={{
                height: 70,
                width: 60,
                marginLeft: "42%",
                marginTop: "0%"
              }}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#0e3655",
                height: 54,
                width: 270,
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                alignSelf: "center",
                elevation: 2
              }}
              onPress={() => {
                this.setState({ screen: 2 });
              }}
            >
              <View style={{ flexDirection: "row", marginLeft: "30%" }}>
                <Text
                  style={{
                    color: "#9da0a6",
                    fontSize: 17,
                    fontWeight: "600",
                    alignSelf: "center",
                    textAlign: "center",
                    marginTop: "5%",
                    fontFamily: "Built Titling"
                  }}
                >
                  GET START
                </Text>
                <Icon
                  name="chevron-with-circle-right"
                  type="Entypo"
                  style={{
                    color: "#9da0a6",
                    fontSize: 25,
                    fontWeight: "600",
                    alignSelf: "center",
                    textAlign: "center",
                    marginTop: "4%",
                    marginLeft: "10%"
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    }
  }
  ScreenTwo() {
    if (this.state.screen === 2) {
      return (
        <View style={{ height: "100%", width: "100%" }}>
          <View
            style={{
              height: "50%",
              width: "100%",
              backgroundColor: "#0b1b35",
              marginLeft: 0
            }}
          >
            <Image
              source={require("../../assets/whats.png")}
              style={{
                height: "100%",
                width: "70%"
              }}
              resizeMode="contain"
            />
          </View>
          <View
            style={{ height: "50%", width: "100%", backgroundColor: "#14213a" }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "500",
                color: "#9da0a6",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "8%"
              }}
            >
              LEARN NEW LANGUAGES
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#9da0a6",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "4%",
                marginLeft: "8%",
                marginRight: "8%"
              }}
            >
              jbaiudnjdn saadnsoidnoaisdnas dasndoasndoians
              dsa'ndoi'andsoinasoidnaw aisdnonasoidnoiasnd sdonao'sndoinadoisnd
              aosindoainsdinaside[f ]as[fmsdmfosmdfp[ms[dmf dmfpsdmfomsdfp dsfom
            </Text>
            <Image
              source={require("../../assets/dots2.png")}
              style={{
                height: 70,
                width: 60,
                marginLeft: "42%"
              }}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#0e3655",
                height: 58,
                width: 270,
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                alignSelf: "center",
                elevation: 2
              }}
              onPress={() => {
                this.setState({ screen: 3 });
              }}
            >
              <View style={{ flexDirection: "row", marginLeft: "5%" }}>
                <Text
                  style={{
                    color: "#9da0a6",
                    fontSize: 17,
                    fontWeight: "600",
                    alignSelf: "center",
                    textAlign: "center",
                    marginTop: "5%",
                    fontFamily: "Built Titling"
                  }}
                >
                  CHOOSE YOUR LANGUAGE
                </Text>
                <Icon
                  name="chevron-with-circle-down"
                  type="Entypo"
                  style={{
                    color: "#9da0a6",
                    fontSize: 25,
                    fontWeight: "600",
                    alignSelf: "center",
                    textAlign: "center",
                    marginTop: "5%",
                    marginLeft: "5%"
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
  ScreenThree() {
    if (this.state.screen === 3) {
      return (
        <View style={{ height: "100%", width: "100%" }}>
          <View
            style={{
              height: "50%",
              width: "100%",
              backgroundColor: "#0b1b35",
              marginLeft: 0
            }}
          >
            <Video
              source={HolaVideo} // Can be a URL or a local file.
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
              }}
              resizeMode="contain"
              repeat={true}
            />
          </View>
          <View
            style={{ height: "50%", width: "100%", backgroundColor: "#14213a" }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "500",
                color: "#9da0a6",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "8%"
              }}
            >
              MEET NEW PEOPLE
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#9da0a6",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "4%",
                marginLeft: "8%",
                marginRight: "8%"
              }}
            >
              jbaiudnjdn saadnsoidnoaisdnas dasndoasndoians
              dsa'ndoi'andsoinasoidnaw aisdnonasoidnoiasnd sdonao'sndoinadoisnd
              aosindoainsdinaside[f ]as[fmsdmfosmdfp[ms[dmf dmfpsdmfomsdfp dsfom
            </Text>
            <Image
              source={require("../../assets/dots3.png")}
              style={{
                height: 70,
                width: 60,
                marginLeft: "42%"
              }}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#0e3655",
                height: 58,
                width: 270,
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                alignSelf: "center",
                elevation: 2
              }}
              onPress={() => {
                this.setState({ screen: 4 });
              }}
            >
              <View style={{ flexDirection: "row", marginLeft: "5%" }}>
                <Text
                  style={{
                    color: "#9da0a6",
                    fontSize: 17,
                    fontWeight: "600",
                    alignSelf: "center",
                    textAlign: "center",
                    marginTop: "5%",
                    fontFamily: "Built Titling"
                  }}
                >
                  CHOOSE YOUR COUNTRY
                </Text>
                <Icon
                  name="chevron-with-circle-down"
                  type="Entypo"
                  style={{
                    color: "#9da0a6",
                    fontSize: 25,
                    fontWeight: "600",
                    alignSelf: "center",
                    textAlign: "center",
                    marginTop: "5%",
                    marginLeft: "5%"
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
  ScreenFour() {
    if (this.state.screen === 4) {
      return (
        <View style={{ height: "100%", width: "100%" }}>
          <View
            style={{
              height: "50%",
              width: "100%",
              backgroundColor: "#14213a",
              marginLeft: 0
            }}
          >
            <Video
              source={RocketVideo} // Can be a URL or a local file.
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
              }}
              resizeMode="cover"
              paused={this.state.rocketPlay}
              onLoad={duration => console.log(duration)}
              onProgress={duration => {
                console.log(duration);
                if (duration.currentTime == 2.326) {
                  this.props.navigation.navigate("Signin");
                }
              }}
              onEnd={() => this.props.navigation.navigate("Signin")}
            />
          </View>
          <View
            style={{ height: "50%", width: "100%", backgroundColor: "#14213a" }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "500",
                color: "#9da0a6",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "8%"
              }}
            >
              START YOUR JOURNEY
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#9da0a6",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "4%",
                marginLeft: "8%",
                marginRight: "8%"
              }}
            >
              jbaiudnjdn saadnsoidnoaisdnas dasndoasndoians
              dsa'ndoi'andsoinasoidnaw aisdnonasoidnoiasnd sdonao'sndoinadoisnd
              aosindoainsdinaside[f ]as[fmsdmfosmdfp[ms[dmf dmfpsdmfomsdfp dsfom
            </Text>
            <Image
              source={require("../../assets/dots4.png")}
              style={{
                height: 70,
                width: 60,
                marginLeft: "42%"
              }}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#0e3655",
                height: 58,
                width: 270,
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                alignSelf: "center",
                elevation: 2
              }}
              onPress={() => {
                this.setState({ rocketPlay: false });
              }}
            >
              <View style={{ flexDirection: "row", marginLeft: "30%" }}>
                <Text
                  style={{
                    color: "#9da0a6",
                    fontSize: 17,
                    fontWeight: "600",
                    alignSelf: "center",
                    textAlign: "center",
                    marginTop: "5%",
                    fontFamily: "Built Titling"
                  }}
                >
                  LET'S START
                </Text>
                <Icon
                  name="chevron-with-circle-right"
                  type="Entypo"
                  style={{
                    color: "#9da0a6",
                    fontSize: 25,
                    fontWeight: "600",
                    alignSelf: "center",
                    textAlign: "center",
                    marginTop: "4%",
                    marginLeft: "10%"
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}
