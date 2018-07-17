import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import { Item, Icon, Input } from 'native-base';

export default class PhoneNumber extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputRef: null,
      value: "",
      isCorrect: 0,
      errorMessage: ''
    };
  }

  checkIfIsCorrect = () => {
    if (this.state.value == '') {
      this.state.isCorrect = 2;
      this.state.errorMessage = 'Phone Number field is required!'
    }
    else{
      if(this.state.value.length < 7){
        this.state.isCorrect = 2;
        this.state.errorMessage = 'Please Enter a Valid Phone Number !'
      }else{
        this.state.isCorrect = 1;
        this.state.errorMessage = ''
      }
    }
    this.setState(this.state);
    this.props.update();
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
    this.state.inputRef._root.setNativeProps({ text: this.state.value })
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
            name="mobile"
            type="Entypo"
            style={{
              color: this.props.full ? "#D3D3D3" : "#D3D3D3", fontSize: GLOBAL.totalSize(2.61), marginLeft: width / 200,
            }}
          />
          <Input
            {...(this.props.full ? GLOBAL.inputTextStyleBlack : GLOBAL.inputTextStyle)}
            blurOnSubmit={false}
            returnKeyType="next"
            ref={(ref) => { this.state.inputRef = ref; }}
            editable={this.props.shown}
            placeholder={language.PhoneNumber}
            keyboardType="phone-pad"
            onSubmitEditing={this.props.changeFocus}
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

PhoneNumber.propTypes = {
  update: PropTypes.func.isRequired,
  changeFocus: PropTypes.func.isRequired,
  shown: PropTypes.bool.isRequired,
  full: PropTypes.bool
};

PhoneNumber.defaultProps = {
  full: false
}