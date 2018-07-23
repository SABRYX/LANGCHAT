import React, { Component } from 'react';
import { StatusBar, Platform, BackHandler,AsyncStorage,View,Text } from 'react-native';
import { Form } from 'native-base';
import ForgetEmail from "../LogSignScreen/InputComponents/ForgetEmail"
import ForgetButton from "../LogSignScreen/SignInScreen/ForgetButton"

export default class ForgetPassword extends Component {
	constructor() {
		super();
		this.state = {
			inputs: [],
			loginErrorMessage: '',
			email:''
		  };
	}
	
	componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress',()=> {return this.onBackPressed()});
	}
	componentWillMount(){
		const navigation = this.props.navigation;
	  }



	onBackPressed = () => {
		this.props.navigation.navigate("LogSignScreen")
	};

	render() {
		return(
		<View style={{flex:1}}>
			<Form style={{marginTop:"40%",marginLeft:"10%",marginRight:"10%"}}>
				<Text style={{color: 'grey',fontSize: 28,marginBottom:"10%",textAlign:"center"}}>
					Forgot Password ?
				</Text>
				<Text style={{color: 'deepskyblue',fontSize: 16,marginBottom:"10%",textAlign:"center"}}>
					Enter your email and you will recieve a code to change password.
				</Text>
			<ForgetEmail
				value={this.state.email}
			/>
			</Form>
			<View style={{marginTop: 2, alignSelf: 'center',}}>
			<ForgetButton
			email={this.state.email}
			navigation={this.props.navigation}
			property={this.state.inputs[0]}
          	/>
			</View>
		</View>
		)
		
    }
}

