import React, { Component } from 'react';
import { ImageBackground, Image, Text } from 'react-native';
import { View } from 'react-native-animatable';

const bannerImage = require('../../../assets/White.png');
const langChatLogo = require('../../../assets/splash_icon.png');

export default class CompanyBanner extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View animation="fadeInRight" delay={20} duration={300}>
        <ImageBackground
          source={bannerImage}
          style={companyBannerStyle.background}
        >
          <Image source={langChatLogo} resizeMode="contain" style={companyBannerStyle.icon} />
          
        </ImageBackground>
      </View>
    );
  }
}
