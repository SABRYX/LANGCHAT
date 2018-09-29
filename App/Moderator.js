import { Component } from 'react';
import { StatusBar, Platform, BackHandler,AsyncStorage } from 'react-native';
import AppGlobalConfig from './AppGlobalConfig/AppConfig';
import api from './services/api';
import { globals } from "./services/globals";
import webRTCServices from "../src/lib/services";

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
	componentWillMount(){
		this.retrieveData()
	}

		retrieveData = async () => {
			try {
			  const value = await AsyncStorage.getItem('accessToken');
			  const accessTokennn = await AsyncStorage.getItem('accessToken');
			  if (value !== null) {
				api.check_token(value,accessTokennn).then((response) => {
					if (response.message == "Unauthenticated.") {
							this.props.navigation.navigate("Signin")
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
				this.props.navigation.navigate("Signin")
			  }
			 } catch (error) {
			   console.log("error",error)
			 }
		  }
	

	componentDidMount() {
		if (Platform.OS === 'android') {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor('transparent');
		}
		BackHandler.addEventListener('hardwareBackPress',()=> {return this.onBackPressed()});

	}


	onBackPressed = () => {
			BackHandler.exitApp();
	};

	render() {
		if (this.state.initLoaded) {
			console.log(this.state.initLoaded)
        }
        return (null);
    }
}

