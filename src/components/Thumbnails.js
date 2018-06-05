import React, { Component } from 'react';
import {StyleSheet, Text, TouchableHighlight, View, ListView, Image} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import styles from "../../style/thumbnails.js";
import config from "../config/app.js";
import {BoxShadow} from 'react-native-shadow';

export default class Thumbnails extends Component {

  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: props.streams.filter(stream => stream.id != props.activeStreamId)
    }
  }

  componentWillReceiveProps(nextProps) {
    let b = nextProps.streams != this.props.streams || nextProps.activeStreamId != this.props.activeStreamId;
    if(b) {
      this.setState({
        dataSource: nextProps.streams.filter(stream => stream.id != nextProps.activeStreamId)
      })
    }
  }

  render() {
    if(this.props.streams.length <= 1) {
      return null;
    }
    //ELSE:
    // return <ListView contentContainerStyle={styles.thumbnailContainer}
    //   zOrder={1}
    //   horizontal={true}
    //   showsHorizontalScrollIndicator={false}
    //   showsVerticalScrollIndicator={false}
    //   dataSource={this.state.dataSource}
    //   renderRow={this.renderRow.bind(this)} />
    return (
      <View style={styles.thumbnailContainer}>
        <BoxShadow style={styles.thumbnail} setting={{
              width: config.thumbnailWidth,
              height: config.thumbnailHeight - 20,
              color: "#000",
              border: 40,
              radius: 0,
              opacity: 0.15,
              x: 0,
              y: 0
          }}>
          <TouchableHighlight style={[styles.activeThumbnail, {position: 'relative'}]} onPress={() => this.handleThumbnailPress(this.state.dataSource[0].id)}>
            {
              config.useRCTView ?
              <RTCView streamURL={this.state.dataSource[0].url} zOrder={2} style={styles.thumbnail} objectFit={'cover'} mirror={true} />
              :
              <Image source={this.state.dataSource[0].url} resizeMode={"contain"} style={styles.thumbnail} />
            }
          </TouchableHighlight>
        </BoxShadow>
      </View>
    )
  }

  renderRow(stream, sectionId, rowId) {
    let thumbnailStyles = [styles.thumbnail];
    if(rowId == this.props.activeStreamId) {
      thumbnailStyles.push(styles.activeThumbnail);
    }
    
    return (
    <BoxShadow style={styles.thumbnail} setting={{
          width: config.thumbnailWidth,
          height: config.thumbnailHeight,
          color: "#000",
          border: 40,
          radius: 0,
          opacity: 0.15,
          x: 0,
          y: 0,
          style:{marginVertical:0}
      }}>
      <TouchableHighlight style={[styles.thumbnail, {position:"relative"}]} onPress={() => this.handleThumbnailPress(stream.id)}>
        {
          config.useRCTView ?
          <RTCView streamURL={stream.url} zOrder={2} style={thumbnailStyles} objectFit={'cover'} mirror={true} />
          :
          <Image source={stream.url} resizeMode={"contain"} style={thumbnailStyles} />
        }

      </TouchableHighlight>
    </BoxShadow>)
  }

  handleThumbnailPress(streamId) {
    this.props.setActive(streamId);
  }
}