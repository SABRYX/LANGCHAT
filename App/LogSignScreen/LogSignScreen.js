import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import { View } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import CompanyBanner from './CompanyBanner/CompanyBanner';
import LoginScreen from './LoginScreen/LoginScreen';
import SignInScreen from './SignInScreen/SignInScreen';
import TopTabs from './TopTabs/TopTabs';
import SettingsButton from './Settings/SettingsButton';
import SettingsPanel from './Settings/SettingsPanel';
import PopupDialogs from './Settings/PopupDialogs/PopupDialogs';
import Colors from '../AppGlobalConfig/Colors/Colors';

export default class LogSignScreen extends Component {
	changeZindex = () => {
		this.signInScreen.changeZindex();
	};

	switchScreens = index => () => {
		if (this.topTabs.state.currentTabIndex !== index) {
			if (index === 0) {
				this.loginScreen.animationView.fadeInLeft(60).then(this.changeZindex);
				this.signInScreen.animationView.fadeOutRight(40);
			} else {
				this.loginScreen.animationView.fadeOutLeft(40);
				this.signInScreen.animationView.fadeInRight(60).then(this.changeZindex);
			}
			this.topTabs.state.tabsStyles.reverse();
			this.topTabs.setState({ currentTabIndex: index });
		}
	};

	moveToMainAppScreen = () => {
		this.props.navigation.navigate("MainAppScreen")
	};

	showSettings = () => {
		this.settingsPanel.showPanel();
	};

	showPopupDialog = (index) => {
		this.popupDialogs.showPopup(index);
	};

	scrollToTextInput = (index) => {
		this.keyboardAvoidView.scrollToPosition(0, (index * height) / 10, true);
	};

	render() {
		return (
			<KeyboardAwareScrollView
				{...GLOBAL.keyboardAvoidView}
				ref={(ref) => { this.keyboardAvoidView = ref; }}
			>
				<CompanyBanner />
				<TopTabs
					ref={(ref) => { this.topTabs = ref; }}
					switch={this.switchScreens}
				/>
				<View
					style={{
						backgroundColor: appMainColor, width, height: GLOBAL.bodyHeight, alignItems: 'center', justifyContent: 'center',
					}}
				>
					<Animatable.View
						animation="fadeIn"
						delay={1900}
						duration={1000}
						style={{ position: 'absolute' }}
					>
						<LinearGradient
							colors={[gradient1, gradient2, appMainColor]}
							style={{ width, height: GLOBAL.bodyHeight }}
						/>
					</Animatable.View>
					<SignInScreen
						switch={this.switchScreens(0)}
						move={this.moveToMainAppScreen}
						scroll={this.scrollToTextInput}
						ref={(ref) => { this.signInScreen = ref; }}
						navigation={this.props.navigation}
					/>
					<LoginScreen
						move={this.moveToMainAppScreen}
						ref={(ref) => { this.loginScreen = ref; }}
						navigation={this.props.navigation}
					/>
				</View>
				{/* <SettingsButton show={this.showSettings} />
				<SettingsPanel
					showPopup={this.showPopupDialog}
					ref={(ref) => { this.settingsPanel = ref; }}
				/> */}
				<PopupDialogs ref={(ref) => { this.popupDialogs = ref; }} />
			</KeyboardAwareScrollView>
		);
	}
}
