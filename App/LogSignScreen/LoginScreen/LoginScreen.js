import React, { Component } from 'react';
import { TouchableOpacity,View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { Form } from 'native-base';
import * as Animatable from 'react-native-animatable';
import Email from '../InputComponents/Email';
import Password from '../InputComponents/Password';
import LoginButtons from './LoginButtons/LoginButtons';

export default class LoginScreen extends Component {
  constructor() {
    super();
    this.state = {
      inputs: [],
      loginErrorMessage: ''
    };
  }
  componentWillMount(){
    const navigation = this.props.navigation;
  }

  changeInputFocus = index => () => {
    if (index === 0) {
      this.state.inputs[index+1].state.inputRef._root.focus(); // eslint-disable-line
    }
  };

  postErrorMessage(message){
    this.state.loginErrorMessage = message;
    this.setState(this.state);
  }

  updateCanLoginState = () => {
    let canLogin = true;
    this.state.inputs.forEach((child) => {
      if (child.state.isCorrect !== 1) {
        canLogin = false;
      }
    });
    this.loginButtons.loginButton.updateCanLogin(
      canLogin, 
      this.state.inputs[0].state.value,
      this.state.inputs[1].state.value,
    );
  };

  clearAllInputs = () => {
    this.state.inputs.forEach((child) => {
      child.clearInput();
    });
  };

  forgotPassword = () => {
    console.warn('Forgot password clicked'); // eslint-disable-line
  };

  render() {
    return (
      <Animatable.View
        animation="fadeInRight"
        delay={1200}
        duration={700}
        ref={(ref) => { this.animationView = ref; }}
        style={{backgroundColor:"white"}}
      >
        <Form style={GLOBAL.loginScreenStyle.form}>
          <Email
            changeFocus={this.changeInputFocus(0)}
            update={this.updateCanLoginState}
            ref={(ref) => { this.state.inputs[0] = ref; }}
            value=""
          />
          <Password
            changeFocus={this.changeInputFocus(1)}
            update={this.updateCanLoginState}
            ref={(ref) => { this.state.inputs[1] = ref; }}
            value=""
          />
        </Form>
        <View style={{marginTop: 2, alignSelf: 'center',}}>
          <Text style={{color: '#e71a64',fontSize: 12}}>
            {this.state.loginErrorMessage}
          </Text>
        </View>
        <TouchableOpacity onPress={this.forgotPassword} activeOpacity={0.5} style={{ marginTop: height / 25, alignItems: 'center' }}>
          <Text style={GLOBAL.loginScreenStyle.remember}>{language.dontRemember}</Text>
        </TouchableOpacity>
        <LoginButtons
          ref={(ref) => { this.loginButtons = ref; }}
          clear={this.clearAllInputs}
          move={this.props.move}
          postErrorMessage={this.postErrorMessage.bind(this)}
          navigation={this.props.navigation}
        />
      </Animatable.View>
    );
  }
}

LoginScreen.propTypes = {
  move: PropTypes.func.isRequired,
};