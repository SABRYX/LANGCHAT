import React, { Component } from 'react';
import {AsyncStorage} from "react-native"
import { View } from 'react-native-animatable';
import { Text, Spinner, Button } from 'native-base';
import PropTypes from 'prop-types';
import api from '../../services/api'


const inputNames = ['name','password','email','languages']

export default class RegisterButton extends Component {
  constructor() {
    super();
    this.state = {
      isRegistering: false,
      canRegister: false,
      name: null,
      email: null,
      phone:null,
      password: null,
      repeat: null,
      avatar: null,
      languages: [1,2],
    };
  }

  updateCanRegister = (can, name, email,phone, password, languages) => {
    this.setState({canRegister: can, name, email,phone, password, languages});
    console.log("update register is called")
  };

	moveToMainAppScreen = () => {
		this.props.navigation.navigate("MainAppScreen")
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
    let {isRegistering, canRegister, name, email,phone, password, repeat, avatar, languages} = this.state;
    console.log(name, email,phone, password, repeat, avatar, languages)
    if (!isRegistering) {
      if (!canRegister) {
        alert("cant register")
      } else {
        this.setState({ isRegistering: true });
				api.register(name, email, phone, password, languages).then((result) => {
          console.log(name, email,phone, password, languages)
          console.log(result)
          if(result.message!="The given data was invalid."){
          if(result.type !== 'error'){
            alert("account Created")
            this.storeData(result)
            this.moveToMainAppScreen();  
            this.props.clear();}
          }else if(result.type == 'error'){
            var error = this.errorParser(result.message);
            this.props.postErrorMessage(error);
          }else{
            alert("you can't register ya sara 5alas")
          }
          
          this.setState({ isRegistering: false, canRegister: false });
        }).catch(error => {
          console.log(error);
        });
      }
    }
  };
  
  
    storeData = async (response) => {
      try {
        console.log(response)
        await AsyncStorage.setItem("accessToken",response.access_token);
        await AsyncStorage.setItem("name", response.name);
      } catch (error) {
        console.log(error)
      }
      }

  render() {
    const { navigate } = this.props.navigation;
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
      <View>
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
