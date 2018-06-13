import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import LoginButton from './LoginButton';
import GuestButton from '../../GuestButton/GuestButton';
import GoogleButton from './GoogleButton';
import FacebookButton from './FacebookButton';

export default class LoginButtons extends Component {
  componentWillMount(){
    const navigation = this.props.navigation;
  }
  render() {
    if (GLOBAL.appLoginStyle === 0) {
      return (
        <View style={{ marginTop: height / 25 }}>
          <LoginButton 
          clear={this.props.clear} 
          postErrorMessage={this.props.postErrorMessage}
          ref={(ref) => { this.loginButton = ref; }}
          navigation={this.props.navigation}
          />
          <GoogleButton />
          <GuestButton move={this.props.move} />
        </View>
      );
    } else if (GLOBAL.appLoginStyle === 1) {
      return (
        <View style={{ marginTop: height / 25 }}>
          <LoginButton 
          clear={this.props.clear} 
          postErrorMessage={this.props.postErrorMessage}
          ref={(ref) => { this.loginButton = ref; }} 
          navigation={this.props.navigation}
          />
          <FacebookButton />
          <GuestButton move={this.props.move} />
        </View>
      );
    }
    else if (GLOBAL.appLoginStyle === 2) {
      return (
        <View style={{ marginTop: height / 25 }}>
          <LoginButton 
          clear={this.props.clear} 
          postErrorMessage={this.props.postErrorMessage}
          ref={(ref) => { this.loginButton = ref; }} 
          navigation={this.props.navigation}
          />
        </View>
      );
    }
    return (
      <View style={{ marginTop: height / 25 }}>
        <LoginButton 
        clear={this.props.clear} 
        postErrorMessage={this.props.postErrorMessage}
        ref={(ref) => { this.loginButton = ref; }}
        navigation={this.props.navigation}
        />
        <GuestButton move={this.props.move} />
        <View style={{ flexDirection: 'row', marginTop: height / 100 }}>
          <FacebookButton special />
          <GoogleButton special />
        </View>
      </View>
    );
  }
}

LoginButtons.propTypes = {
  move: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired,
};
