import React, { Component } from 'react';
import { StatusBar, Platform, BackHandler,KeyboardAvoidingView ,View,Text,ToastAndroid,TextInput,TouchableHighlight} from 'react-native';
import { Form, Input } from 'native-base';
import ForgetEmail from "../LogSignScreen/InputComponents/ForgetEmail"
import ForgetButton from "../LogSignScreen/SignInScreen/ForgetButton"
import api from "../services/api"
import Overlay from 'react-native-modal-overlay';


export default class ForgetPassword extends Component {
	constructor() {
		super();
		this.state = {
			inputs: [],
			loginErrorMessage: '',
			email:'',
			text:"",
			modalVisible: false,
			code:null,
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
	changeText=(value)=>{
		this.setState({
			text:value
		})
		
	}
	forgetPassword=()=>{
		api.forget_password(this.state.text).then((response)=>{ToastAndroid.show(response.message, ToastAndroid.SHORT);if(response.message=="Your Code has been sent to your Email"){this.setModalVisible()};console.log(response)})
	}
	
	setModalVisible() {
		this.setState({modalVisible:!this.state.modalVisible});
	  }
	
	checkCode(){api.check_code(this.state.code).then((response)=>{console.log(response);ToastAndroid.show(response.message, ToastAndroid.SHORT);if(response.message=="code Correct"){this.props.navigation.navigate("ResetPassword",{ code:this.state.code })}})}
	

	render() {
		return(
		<View  style={{flex:1}}>
		<Overlay visible={this.state.modalVisible}  animationType="zoomIn"
				containerStyle={{backgroundColor: 'rgba(0, 0, 0, 0.7)',padding:0}} childrenWrapperStyle={{backgroundColor: 'white',height:"35%",marginTop:"0%",marginBottom:"0%",padding:0,position:"relative"}} >
				<View style={{width: "100%",marginTop:"5%"}}><Text style={{ fontSize: 15, textAlign: 'center',color:"deepskyblue",width:"100%"}}> Enter The Code </Text></View>
					<TextInput style={{width:"70%"}}  onChangeText={text => this.setState({code:text})} />
				<TouchableHighlight onPress={()=>{this.setModalVisible();this.checkCode()}} style={{backgroundColor:"white",marginBottom:"10%",marginTop:"10%",marginLeft:"20%",marginRight:"20%"}}>
					<Text style={{color:"deepskyblue",textAlign:"center"}}>OK</Text>
				</TouchableHighlight>
        </Overlay>
			<Form style={{marginTop:"40%",marginLeft:"10%",marginRight:"10%"}}>
				<Text style={{color: 'grey',fontSize: 28,marginBottom:"10%",textAlign:"center"}}>
					Forgot Password ?
				</Text>
				<Text style={{color: 'deepskyblue',fontSize: 16,marginBottom:"10%",textAlign:"center"}}>
					Enter your email and you will recieve a code to change password.
				</Text>
			<ForgetEmail
				value={this.state.email}
				changeText={this.changeText}
			/>
			</Form>
			<View style={{marginTop: 2, alignSelf: 'center',}}>
			<ForgetButton
			forgetPassword={this.forgetPassword}
			email={this.state.email}
			navigation={this.props.navigation}
			property={this.state.inputs[0]}
          	/>
			</View>
		</View>
		)
		
    }
}

