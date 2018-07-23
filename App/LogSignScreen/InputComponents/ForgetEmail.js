import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Text, View,Keyboard} from 'react-native';
import { Item, Icon, Input } from 'native-base';


const emailValidationRegex = `/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/`

export default class ForgetEmail extends Component {
  constructor() {
    super();
    this.state = {
      inputRef: null,
      value: "",
      isCorrect: 0,
      errorMessage: '',
    };
  }

  validateEmail = () => {
    var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(this.state.value);
  };

  checkIfIsCorrect = () => {
    this.state.isCorrect = 2;
    if (this.state.value !== '') {
      console.log('email validation came back with: '+this.validateEmail(this.state.value));
      if(this.validateEmail()){
        this.state.isCorrect = 1;
        this.state.errorMessage = '';
        this.props.changeText(this.state.value)
      }else{
        this.state.errorMessage = 'Invalid email format!'  
      }
    }else{
      this.state.errorMessage = 'Email field is required!'
    }
    this.setState(this.state);
  };

  clearInput = () => {
    this.state.inputRef._root.setNativeProps({ text: '' }); // eslint-disable-line
    this.setState({ isCorrect: 0, value: '' });
  };

  updateText = (value) => {
    this.setState({value: value});
  };
  

  changeText = (value) => {
    this.setState({value: value});
    this.state.inputRef._root.setNativeProps({ text: this.state.value });

  };

  render() {
    return (
      <View
      style={{
        marginTop: this.props.special ? height / 350 : 0,
      }}>
        <Item
        style={{
          borderBottomColor: "#D3D3D3",
          width: this.props.full ? width - 30 : (width * 7) / 10,
          height: height / 13,
        }}>
          <Icon
            name="md-mail"
            style={{
              color: this.props.full ? "#D3D3D3" : "#D3D3D3", fontSize: GLOBAL.totalSize(2.61), marginLeft: -width / 400,
            }}
          />
          <Input
            {...(this.props.full ? GLOBAL.inputTextStyleBlack : GLOBAL.inputTextStyle)}
            blurOnSubmit={false}
            returnKeyType="done"
            ref={(ref) => { this.state.inputRef = ref; }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={language.email}
            onSubmitEditing={Keyboard.dismiss}
            onChangeText={this.updateText}
            onEndEditing={this.checkIfIsCorrect}
          />
          {GLOBAL.checkMarksArray[this.state.isCorrect]}

        </Item>
        <View style={{marginLeft: 15,marginTop: 2}}>
          <Text style={{color: '#e71a64',fontSize: 12}}>
            {this.state.errorMessage}
          </Text>
        </View>
      </View>
    );
  }
}

ForgetEmail.propTypes = {
  special: PropTypes.bool,
  full: PropTypes.bool
};

ForgetEmail.defaultProps = {
  special: false,
  full: false
};
