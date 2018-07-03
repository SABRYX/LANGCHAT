import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Text, View, TouchableOpacity} from 'react-native';
import { Item, Icon, Input } from 'native-base';

export default class NewPassword extends Component {
  constructor() {
    super();
    this.state = {
      inputRef: null,
      value: "",
      isCorrect: 0,
      showPasswordEye: 'md-eye',
      showPassword: true,
      iconRef: null,
      errorMessage: ''
    };
  }

  checkIfIsCorrect = () => {
    if (this.state.value == '') {
      this.state.isCorrect = 2;
      this.state.errorMessage = 'Password field is required!'
    }
    else{
      console.log("my val",this.state.value,"other value ",this.props.otherValue)
      if(this.state.value.length < 6){
        this.state.isCorrect = 2;
        this.state.errorMessage = 'Password has to be 6 letters at least!'
      }
      else{
        this.state.isCorrect = 1;
        this.state.errorMessage = ''
      }
    }
    this.setState(this.state);
    this.props.update(this.state.value);
  };

  clearInput = () => {
    this.state.inputRef._root.setNativeProps({ text: '' }); // eslint-disable-line
    this.setState({ isCorrect: 0, value: '' });
  };

  updateText = (value) => {
    this.state.value = value;
  };
  togglePassShow = () => {
    const newIconName = this.state.showPassword ? 'md-eye-off' : 'md-eye';
    this.setState({showPassword: !this.state.showPassword, showPasswordEye: newIconName})
    this.props.update(this.state.value);
  }

  renderIcon(){
    if(this.state.showPassword){
      return(
        <Icon
        ref={(ref) => { this.state.iconRef = ref; }}
        name='md-eye'
        style={{
          color: this.props.full ? "#333" : mainThemeColor, fontSize: GLOBAL.totalSize(4), marginRight: width / 200,
        }}
      />
      )
    }else{
      return(
        <Icon
        ref={(ref) => { this.state.iconRef = ref; }}
        name='md-eye-off'
        style={{
          color: this.props.full ? "#333" : mainThemeColor, fontSize: GLOBAL.totalSize(4), marginRight: width / 200,
        }}
      />
      )
    }
  }

  render() {
    let keyType = 'done';
    if (this.props.special) {
      keyType = 'next';
    }
    return (
      <View style={{
        marginTop: this.props.special ? height / 350 : 0,
      }}>
      <Item style={{
        width: this.props.full ? width - 30 : (width * 7) / 10,
        borderBottomColor: mainThemeColor,
      }}
      >
        <Icon
          name="md-lock"
          style={{
            color: this.props.full ? "#333" : mainThemeColor, fontSize: GLOBAL.totalSize(2.61), marginLeft: width / 200,
          }}
        />
        <Input
          {...(this.props.full ? GLOBAL.inputTextStyleBlack : GLOBAL.inputTextStyle)}
          blurOnSubmit={!this.props.special}
          returnKeyType={keyType}
          ref={(ref) => { this.state.inputRef = ref; }}
          autoCapitalize="none"
          placeholder={language.newPassword}
          onSubmitEditing={this.props.changeFocus}
          secureTextEntry={this.state.showPassword}
          onChangeText={this.updateText}
          onEndEditing={this.checkIfIsCorrect}
        />
        <TouchableOpacity onPress={this.togglePassShow}>
          {this.renderIcon()}
        </TouchableOpacity>
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

NewPassword.propTypes = {
  update: PropTypes.func.isRequired,
  changeFocus: PropTypes.func.isRequired,
  special: PropTypes.bool,
  full: PropTypes.bool,
  otherValue: PropTypes.string
};

NewPassword.defaultProps = {
  special: false,
  full: false,
  otherValue: ''
};
