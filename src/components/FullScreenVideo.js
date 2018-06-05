import React, {Component} from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback, View, ListView, Image} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import config from "../config/app.js";
import styles from "../../style/fullScreenVideo.js";

export default class FullScreenVideo extends Component{

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return <View style={styles.container}>
      <TouchableWithoutFeedback style={styles.video} onLongPress={() => {this.props.rejoin()}}>
      {
        config.useRCTView ?
        <RTCView streamURL={this.props.streamURL} zOrder={0} style={[styles.video]} mirror={true} />
        :
        <Image source={this.props.streamURL} style={styles.video} resizeMode={"contain"} />
      }
      </TouchableWithoutFeedback>
    </View>
  }
}
