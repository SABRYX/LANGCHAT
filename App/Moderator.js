import React, { Component } from 'react';
import { View, StatusBar, Platform, BackHandler,Image,AsyncStorage } from 'react-native';
import { Root,Header } from "native-base";
import Toast, { DURATION } from 'react-native-easy-toast';
import SplashScreen from 'react-native-splash-screen';
import AppGlobalConfig from './AppGlobalConfig/AppConfig';
import storage from './services/storage';
import api from './services/api';
import { globals } from "./services/globals";
import webRTCServices from "../src/lib/services";
let context;

// GLOBAL.showToast = (message) => {
// 	context.toast.show(message, DURATION.LENGTH_LONG);
// };

// GLOBAL.resetAppWithNewColorOrTheme = () => {
// 	context.setState(context.state);
// };

export default class Moderator extends Component {
	constructor() {
		super();
		context = this;
		this.state = {
			initLoaded: false,
		};
		GLOBAL.AppGlobalConfig = AppGlobalConfig;
		AppGlobalConfig.init().finally(() => {
			this.setState({
				initLoaded: true,
			});
		});
	}

		retrieveData = async () => {
			try {
			  const value = await AsyncStorage.getItem('accessToken');
			  const accessTokennn = await AsyncStorage.getItem('accessToken');
			  console.log(accessTokennn)
			  if (value !== null) {
				api.check_token(value,accessTokennn).then((response) => {
					if (response.message == "Unauthenticated.") {
							this.props.navigation.navigate("LogSignScreen")
					}
					else {
						this.setState({accessToken: response.access_token})
						this.setState({name: response.name})
						globals.user = response
						webRTCServices.myId=response.id
						this.props.navigation.navigate("MainAppScreen")
	
					}
				})
			  }else{
				this.props.navigation.navigate("LogSignScreen")
			  }
			 } catch (error) {
			   console.log("error",error)
			 }
		  }
	

	componentDidMount() {
		this.retrieveData();
		if (Platform.OS === 'android') {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor('black');
		}
	}

	onBackPressed = () => {
		if (this.state.currentScene == "LoginScreen" || this.state.currentScene == "MainAppScreen") {
			BackHandler.exitApp();
			return false;
		}
		return true;
	};

	render() {
		if (this.state.initLoaded) {
			return (
					<View style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor:'white'
                        }}>
						<View style={{height:"50%",width:"80%",alignItems: 'center',}}>
						 	<Image source={require("../assets/splash_icon.png")} style={{height:"58%",width:"68%",borderRadius:100,marginTop:"20%"}}/>
						</View>
					</View>
			);
        }
        return (null);
    }
}

