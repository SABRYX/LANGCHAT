import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View , Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Form } from 'native-base';
import Email from '../InputComponents/Email';
import Password from '../InputComponents/Password';
import PasswordRepeat from '../InputComponents/PasswordRepeat';
import Name from '../InputComponents/Name';
import RegisterButton from './RegisterButton';
import GuestButton from '../GuestButton/GuestButton';
import MultiSelect from '../InputComponents/MultiSelect';
import api from '../../services/api';



const hide = { from: { opacity: 0 }, to: { opacity: 0 } };

export default class SignInScreen extends Component {
  constructor() {
    super();
    this.state = {
      inputs: [],
      zIndex: 0,
      languages: [],
      registrationErrorMessage: ''
    };
    
    api.getLanguages().then((languages) => {
      this.setState({languages})
    })
  }

  postErrorMessage(message){
    this.state.registrationErrorMessage = message;
    this.setState(this.state);
  }

  // changeInputFocus = index => () => {
  //   if (index < 5) {
  //     this.state.inputs[index + 1].state.inputRef._root.focus(); // eslint-disable-line
  //     if (index >= 1) {
  //       this.props.scroll(index);
  //     }
  //   }
  // };

  updateCanRegisterState = () => {
    const pass = this.state.inputs[2].state.value;

    if (pass !== '') {
      this.state.inputs[2].state.isCorrect = 1;
      this.state.inputs[2].forceUpdate();
    }

    let canRegister = true;
    this.state.inputs.forEach((child) => {
      if (child.state.isCorrect !== 1) {
        canRegister = false;
      }
    });
    if(!canRegister){
      console.log('you cant register');
      this.state.inputs.forEach((child) => {
        if (child.state.isCorrect !== 1) {
          console.log(child);
        }
      });
    }
    if(canRegister){
      console.log('you can register, YAAY');
      this.state.inputs.forEach((child) => {
        if (child.state.isCorrect !== 1) {
          console.log(child);
        }
      });
    }
    this.registerButton.updateCanRegister(
      canRegister,
      this.state.inputs[0].state.value, this.state.inputs[1].state.value,
      this.state.inputs[2].state.value, this.state.inputs[3].state.value,
    );
  };

  changeZindex() {
    if (this.state.zIndex === 0) {
      this.setState({ zIndex: 2 });
    } else {
      this.setState({ zIndex: 0 });
    }
  }

  clearAllInputs = () => {
    this.state.inputs.forEach(child => child.clearInput());
  };

  render() {
    return (
      <Animatable.View
        animation={hide}
        duration={0}
        ref={(ref) => { this.animationView = ref; }}
        style={{
          zIndex: this.state.zIndex, position: 'absolute', flex: 1, backgroundColor: 'transparent',
        }}
      >
        <Form style={GLOBAL.loginScreenStyle.form}>
          <Name
            // changeFocus={this.changeInputFocus(0)}
            update={this.updateCanRegisterState}
            ref={(ref) => { this.state.inputs[0] = ref; }}
            shown={this.state.zIndex === 2}
          />
          <Email
            // changeFocus={this.changeInputFocus(1)}
            update={this.updateCanRegisterState}
            special
            ref={(ref) => { this.state.inputs[1] = ref; }}
          />
          <Password
            // changeFocus={this.changeInputFocus(2)}
            update={this.updateCanRegisterState}
            special
            ref={(ref) => { this.state.inputs[2] = ref; }}
          />
          <MultiSelect
            items={this.state.languages}
            update={this.updateCanRegisterState}
            special
            ref={(ref) => { this.state.inputs[3] = ref; }}
          />
        </Form>
        <View style={{marginTop: 2, alignSelf: 'center',}}>
          <Text style={{color: '#e71a64',fontSize: 12}}>
            {this.state.registrationErrorMessage}
          </Text>
        </View>
        <View style={{ marginTop: height / 50}}>
          <RegisterButton
            switch={this.props.switch}
            clear={this.clearAllInputs}
            ref={(ref) => { this.registerButton = ref; }}
            postErrorMessage={this.postErrorMessage.bind(this)}
          />
          {/* <GuestButton move={this.props.move} /> */}
        </View>
      </Animatable.View>
    );
  }
}
 

SignInScreen.propTypes = {
  scroll: PropTypes.func.isRequired,
  switch: PropTypes.func.isRequired,
  move: PropTypes.func.isRequired,
};



