import React, { Component } from 'react';
import { ImageBackground, Image, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { View } from 'react-native-animatable';

const bannerImage = require('../../../assets/companybanner.jpg');
const langChatLogo = require('../../../assets/langchat_logo_2.png');

export default class CompanyBanner extends Component {
  constructor() {
    super();
    this.state = {
      gradient: [`transparent`, `${appMainColor}DC`],
    };
  }

  render() {
    return (
      <View animation="fadeInRight" delay={250} duration={700}>
        <ImageBackground
          source={bannerImage}
          style={companyBannerStyle.background}
        >
          <LinearGradient colors={this.state.gradient} style={companyBannerStyle.background} />
          <Image source={langChatLogo} resizeMode="contain" style={companyBannerStyle.icon} />
          
        </ImageBackground>
      </View>
    );
  }
}
