import React, { Component } from 'react';
import { View, StatusBar, Platform, BackHandler,Image } from 'react-native';
import { Root,Header } from "native-base";
import Toast, { DURATION } from 'react-native-easy-toast';
import SplashScreen from 'react-native-splash-screen';
import AppGlobalConfig from './AppGlobalConfig/AppConfig';
import storage from './services/storage';
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

	async checkUserExists() {
        let accessToken = await storage.getItem(storage.keys.accessToken);
        console.log(accessToken)
		if (accessToken !== null) {
            setTimeout(() => this.props.navigation.navigate("MainAppScreen"),4000);
			
		} else {
            console.log('didnt find user')
            setTimeout(() => this.props.navigation.navigate("LogSignScreen"),4000);
		}
	}

	componentDidMount() {
		this.checkUserExists();
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
						 	<Image source={require("../assets/langchat_logo1.png")} style={{height:"58%",width:"68%",borderRadius:100,marginTop:"20%"}}/>
						</View>
					</View>
			);
        }
        return (null);
    }
}

