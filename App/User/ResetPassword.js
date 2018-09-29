import React, { Component } from 'react';
import { BackHandler ,View,Text,ToastAndroid} from 'react-native';
import { Form, Input, Button } from 'native-base';
import NewPassword from "../LogSignScreen/InputComponents/NewPassword"
import Password from "../LogSignScreen/InputComponents/Password"
import api from "../services/api"

export default class ResetPassword extends Component {
	constructor() {
		super();
		this.state = {
			inputs: [],
			loginErrorMessage: '',
			email:'',
			text:"",
			modalVisible: false,
            code:null,
            loginErrorMessage:"",
            value1:null,
            value2:null,
		  };
	}
	
	componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress',()=> {return this.onBackPressed()});
	}
	componentWillMount(){
		const navigation = this.props.navigation;
      }
      changeInputFocus = index => () => {
        if (index === 0) {
          this.state.inputs[index+1].state.inputRef._root.focus(); // eslint-disable-line
        }
    };
    returnValue1=(value)=>{
        this.setState({value1:value})
    }
    returnValue2=(value)=>{
        this.setState({value2:value})
    }
	onBackPressed = () => {
		this.props.navigation.navigate("LogSignScreen")
    };
    checker(){
        if(this.state.value1===this.state.value2&&this.state.loginErrorMessage===""){
            console.log(this.state.value1,this.state.value2)
            api.change_password(this.props.navigation.state.params.code,this.state.value1,this.state.value2).then((response)=>{
                console.log(response);
                ToastAndroid.show(response.message, ToastAndroid.SHORT);
                if(response.message=="Your password is now changed!"){
                    this.props.navigation.dispatch(NavigationActions.reset(
                        {
                           index: 0,
                           actions: [
                             NavigationActions.navigate({ routeName: 'LogSignScreen'})
                           ]
                         }))}
                })
        }
    }
	render() {
		return(
		<View  style={{flex:1,backgroundColor:"white",height:"100%"}}>
            <Text style={{color:"deepskyblue",marginTop:"20%",textAlign:"center",alignSelf:"center",paddingTop:"20%"}}>Please Enter Your New Password</Text>
        	<Form style={{marginTop:"20%",marginLeft:"10%",marginRight:"10%"}}>
                        <Password
                        changeFocus={this.changeInputFocus(1)}
                        update={(text) => {console.log(text)}}
                        ref={(ref) => { this.state.inputs[1] = ref; }}
                        returnValue1={this.returnValue1}
                        />
                        <NewPassword
                            changeFocus={this.changeInputFocus(1)}
                            update={(text) => {console.log(text)}}
                            ref={(ref) => { this.state.inputs[2] = ref; }}
                            returnValue2={this.returnValue2}
                        />
                          <View style={{marginTop: 2, alignSelf: 'center',}}>
                               <Text style={{color: '#e71a64',fontSize: 12}}>
                                    {this.state.loginErrorMessage}
                                </Text>
                           </View>
                        <Button onPress={()=>{this.checker()}} style={{backgroundColor:"deepskyblue",width:"30%",borderRadius:10,alignContent:"center",alignSelf:"center"}}>
                            <Text style={{color:"white",textAlign:"center",marginLeft:"25%"}}>
                                Submit
                            </Text>
                        </Button>
            </Form>
            
		</View>
		)
		
    }
}

