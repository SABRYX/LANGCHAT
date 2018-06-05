import React, { Component } from 'react';
import { View } from 'react-native-animatable';
import { Text, Spinner, Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import api from '../../services/api'
import storage from '../../services/storage';

const inputNames = ['name','password','email','languages']

export default class RegisterButton extends Component {
  constructor() {
    super();
    this.state = {
      isRegistering: false,
      canRegister: false,
      name: null,
      email: null,
      password: null,
      repeat: null,
      avatar: null,
      langauges: [1,2],
    };
  }

  updateCanRegister = (can, name, email, password, langauges) => {
    this.setState({canRegister: can, name, email, password, langauges});
  };

	moveToMainAppScreen = () => {
		Actions.push('mainAppScreen');
  };
  
  errorParser(error){
    var errMsg = '';
    Object.keys(error).forEach(function(key) {
      var arr = error[key];
      for(var i = 0;i < arr.length;i++){
        errMsg += arr[i]+' ';
      }
    });
    return errMsg;
  }

  registerUser = () => {
    let {isRegistering, canRegister, name, email, password, repeat, avatar, langauges} = this.state;
    if (!isRegistering) {
      if (!canRegister) {
        GLOBAL.showToast(language.checkFields);
      } else {
        this.setState({ isRegistering: true });
				api.register(name, email, password, avatar, langauges).then((result) => {
          if(result.type !== 'error'){
            GLOBAL.showToast(language.accountCreated);
            storage.setItem(storage.keys.accessToken, result.access_token);
            storage.setItem(storage.keys.name, result.name);
            this.moveToMainAppScreen();  
            this.props.clear();
          }else if(result.type == 'error'){
            var error = this.errorParser(result.message);
            this.props.postErrorMessage(error);
          }
          
          this.setState({ isRegistering: false, canRegister: false });
        }).catch(error => {
          console.log(error);
        });
      }
    }
  };

  render() {
    let animationType;
    let registerColor;

    if (this.state.canRegister) {
      animationType = 'pulse';
      registerColor = mainThemeColor;
    } else {
      registerColor = mainThemeColor;
      animationType = null;
    }

    let indicator = (<Text uppercase={false} style={{ color: registerColor, fontWeight: '500', fontSize: GLOBAL.totalSize(2.22) }}>{language.create}</Text>);
    if (this.state.isRegistering) {
      indicator = (<Spinner color={registerColor} size="large" />);
    }

    return (
      <View animation={animationType} iterationCount="infinite" duration={500}>
        <Button
          bordered
          rounded
          activeOpacity={0.5}
          onPress={this.registerUser}
          style={{
            borderColor: registerColor, alignSelf: 'center', justifyContent: 'center', width: (width * 13) / 20, height: height / 14,
          }}
        >
          {indicator}
        </Button>
      </View>
    );
  }
}

RegisterButton.propTypes = {
  switch: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired,
};
