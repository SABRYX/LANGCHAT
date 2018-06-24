import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import { Text, Spinner, Button } from 'native-base';
import api from '../../../services/api';
import storage from '../../../services/storage';
import { globals } from "../../../services/globals";

export default class LoginButton extends Component {
	componentDidMount(){
		const navigation = this.props.navigation
	}
	constructor() {
		super();
		this.state = {
			isLogin: false,
			canLogin: false,
			email: null,
			password: null
		};
	}

	updateCanLogin(can, email, password) {
		this.setState({ canLogin: can, email: email, password: password });
	}

	moveToMainAppScreen = () => {
		this.props.navigation.navigate("MainAppScreen");
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
	
	loginUser = () => {
		var errorMessage = '';
		if (!this.state.isLogin) {
			if (!this.state.canLogin) {
				GLOBAL.showToast(language.checkFields);
			} else {
				this.setState({ isLogin: true });
				//GLOBAL.showToast(`Email: ${this.state.email}, password: ${this.state.password}`);
				api.login(this.state.email, this.state.password).then((result) => {
					if(result.type !== 'error'){
						storage.setItem(storage.keys.accessToken, result.access_token);
						storage.setItem(storage.keys.name, result.name);
						storage.setItem(storage.keys.user, result);

						globals.user = result

						this.moveToMainAppScreen();
						this.props.clear();
					}
					else{
						if(typeof result.message == typeof 'string'){
							if(result.message == 'unauthorized'){
								errorMessage = 'Invalid email or password'
							}
							else errorMessage = result.message;
						}
							
						else errorMessage = this.errorParser(result.message);
						this.props.postErrorMessage(errorMessage);
					}
					this.setState({ isLogin: false, canLogin: false });
				}).catch((err)=>{console.log(err)})
			}
		}
	};

	render() {
		let animationType;
		let loginColor;

		if (this.state.canLogin) {
			animationType = 'pulse';
			loginColor = mainThemeColor;
		} else {
			loginColor = mainThemeColor;
			animationType = null;
		}

		let indicator = (<Text uppercase={false} style={{ color: loginColor, fontWeight: '500', fontSize: GLOBAL.totalSize(2.22) }}>{language.login}</Text>);
		if (this.state.isLogin) {
			indicator = (<Spinner color={loginColor} size="large" />);
		}

		return (
			<Animatable.View animation={animationType} iterationCount="infinite" duration={500}>
				<Button
					bordered
					rounded
					activeOpacity={0.5}
					onPress={this.loginUser}
					style={{
						borderColor: loginColor, alignSelf: 'center', justifyContent: 'center', width: (width * 13) / 20, height: height / 14,
					}}
				>
					{indicator}
				</Button>
			</Animatable.View>
		);
	}
}

LoginButton.propTypes = {
	clear: PropTypes.func.isRequired,
};
