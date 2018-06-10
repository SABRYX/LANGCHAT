import React, { Component } from 'react';
import { View, StatusBar, Platform, BackHandler } from 'react-native';
import { Root } from "native-base";
import { Router, Scene, Actions } from 'react-native-router-flux';
import Toast, { DURATION } from 'react-native-easy-toast';
import SplashScreen from 'react-native-splash-screen';
import AppGlobalConfig from './AppGlobalConfig/AppConfig';
import LogSignScreen from './LogSignScreen/LogSignScreen';
import MainAppScreen from './MainAppScreen/MainAppScreen';
import UserSettings from './User/UserSettings';
import UserFriends from './User/UserFriends';
import UserChat from './User/UserChat';
import storage from './services/storage';
import FriendRequest from "./User/FriendRequests";
import containerOfTabs from "./User/containerOfTabs"
let context;

GLOBAL.showToast = (message) => {
	context.toast.show(message, DURATION.LENGTH_LONG);
};

GLOBAL.resetAppWithNewColorOrTheme = () => {
	context.setState(context.state);
};

export default class App extends Component {
	constructor() {
		super();
		context = this;
		this.state = {
			initLoaded: false,
		};
		GLOBAL.AppGlobalConfig = AppGlobalConfig;
		AppGlobalConfig.init().finally(() => {
			SplashScreen.hide();
			this.setState({
				initLoaded: true,
			});
		});
	}

	async checkUserExists() {
		let accessToken = await storage.getItem(storage.keys.accessToken);
		if (accessToken !== null) {
			Actions.mainAppScreen();
		} else {
			console.log('didnt find user')
		}
	}

	componentDidMount() {
		this.checkUserExists();
		if (Platform.OS === 'android') {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor('transparent');
		}
	}

	onBackPressed = () => {
		console.log('MainApp', Actions.currentScene)
		if (Actions.currentScene === 'logSignScreen' || Actions.currentScene === 'mainAppScreen') {
			BackHandler.exitApp();
			return false;
		}
		Actions.pop();
		return true;
	};

	render() {
		if (this.state.initLoaded) {
			return (
				<Root>
					<View style={{ flex: 1, backgroundColor: appMainColor }}>
						<Router backAndroidHandler={this.onBackPressed} style={{ backgroundColor: appMainColor }}>
							<Scene key="root">
								<Scene
									key="logSignScreen"
									component={LogSignScreen}
									hideNavBar
									initial
								/>
								<Scene
									key="mainAppScreen"
									component={MainAppScreen}
									renderBackButton={() => (null)}
									hideNavBar
								/>
								<Scene
									key="userSettings"
									component={UserSettings}
									renderBackButton={() => (null)}
									hideNavBar
								/>
								
									<Scene key="myTabBar" tabBarPosition="bottom" headerMode="screen" tabs={true}  swipeEnabled tabBarStyle={{ backgroundColor: 'white',marginTop:"0%",padding:"0%" }} >
									
											<Scene
												key="userFriends"
												component={UserFriends}
												hideNavBar
											/>
											<Scene
												key="FriendRequest"
												component={FriendRequest}
												hideNavBar
											/>
									</Scene>
								<Scene
									key="userChat"
									component={UserChat}
									renderBackButton={() => (null)}
									hideNavBar
								/>
							</Scene>
						</Router>
						<Toast
							positionValue={height / 8}
							style={{ backgroundColor: mainReverseThemeColor }}
							textStyle={{ fontSize: GLOBAL.totalSize(2.34), color: mainThemeColor, fontWeight: '400' }}
							ref={(ref) => { context.toast = ref; }}
						/>
					</View>
				</Root>
			);
		}
		return (null);
	}
}

