import React, { Component } from 'react';
import { View, ScrollView,BackHandler,Image} from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Title, Text, Form, Spinner } from 'native-base';
import config from "../../src/config/app.js";
import styles from "../../style/app.js";
import storage from '../services/storage'
import api from '../services/api';
import Name from '../LogSignScreen/InputComponents/Name';
import Email from '../LogSignScreen/InputComponents/Email';
import Password from '../LogSignScreen/InputComponents/Password';
import MultiSelect from '../LogSignScreen/InputComponents/MultiSelect';
import PhotoUpload from 'react-native-photo-upload'
import NewPassword from "../LogSignScreen/InputComponents/NewPassword"
import { NavigationActions } from 'react-navigation' ;


export default class UserSettings extends Component {
    accessToken;

    constructor(props) {
        super(props);
        this.state = {
            inputs: [],
            loginErrorMessage: '',
            languages: [],
            userAvatar: 'https://thesocietypages.org/socimages/files/2009/05/nopic_192.gif',
            profileAvatar: '',
            dataLoaded: "Loading",
            oldResponse:null
        }
    }
    
    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress',()=> {return this.handleBackButton()});
        await storage.getItem(storage.keys.accessToken).then((result) => {
            accessToken = result
            api.me(result).then((response) => {
                console.log(response)
                this.setState({oldResponse:response})
                this.setState({dataLoaded: "done"})
                this.state.inputs[0].changeText(response.name)
                this.state.inputs[3].setSelectedItems(response.languages)
                this.setState({
                    userAvatar: response.avatar
                })
            })
        })
        api.getLanguages().then((languages) => {
            this.setState({ languages })
            console.log(this.state.languages)
            this.state.inputs[3].loadItems(this.state.languages)
        })

    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', ()=> {return this.handleBackButton()});
    }
    handleBackButton() { 
        this.props.navigation.dispatch(NavigationActions.reset(
            {
               index: 0,
               actions: [
                 NavigationActions.navigate({ routeName: 'MainAppScreen'})
               ]
             }))
              return true;
  }
    logOut = async () => {
        api.logout(accessToken).then(() => {
            storage.removeItem(storage.keys.accessToken);
            this.props.navigation.navigate("LogSignScreen")    
        });
    };

    changeInputFocus = index => () => {
        if (index === 0) {
          this.state.inputs[index+1].state.inputRef._root.focus(); // eslint-disable-line
        }
    };

    updateProfile =  () => {
        this.setState({dataLoaded: 'Updating'})
       if(this.state.inputs[1].value != "" && this.state.inputs[2].value != "" && this.state.inputs[3]!=""){
            api.updateProfile(this.state.inputs[0].state.value,
                          this.state.inputs[1].state.value,
                          this.state.inputs[2].state.value,
                          this.state.profileAvatar,
                          this.state.inputs[3].state.value,
                          accessToken).then((response) => {
                            console.log("response",response)
                            console.log("response error",response.error)
                            if (response.error === "These credentials do not match our records."){
                                this.returnOldProfile(this.state.oldResponse)
                                alert("Sorry The Data You Filled In Is Wrong !!")
                        }else {
                            this.setState({dataLoaded: 'done'})
                            this.state.inputs[0].changeText(response.data.name)
                            this.state.inputs[3].setSelectedItems(response.data.languages)
                            this.getImage();
                            }
                          })
                          }
    }
    getImage = async ()=>{
        await storage.getItem(storage.keys.accessToken).then((result) => {
            accessToken = result
            api.me(result).then((response) => {
                this.setState({
                    userAvatar: response.avatar
                })
            })
        })
    }
    returnOldProfile(oldResp){
                this.setState({dataLoaded: "done"})
                this.setState({inputs:[]})
                this.state.inputs[0].changeText(oldResp.name)
                this.state.inputs[3].setSelectedItems(oldResp.languages)
    }

    render() {
        return (
            <Container style={{ backgroundColor: 'white' }}>
                <Header style={{marginTop: "6%",backgroundColor:"#8ee2ff"}} noShadow>
                    <Left>
                        <Button transparent onPress={() =>this.props.navigation.goBack(null)}>
                            <Icon name='arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Profile settings</Title>
                    </Body>
                </Header>
                <Body style={{width: config.screenWidth}}>
                    <ScrollView>
                        {
                            this.state.dataLoaded == "done" ?
                                <View>
                                    <View style={{ backgroundColor: "#8ee2ff", height: 160, width: config.screenWidth, marginTop: -15, marginBottom: 10 }}>
                                        <PhotoUpload
                                            onPhotoSelect={
                                                avatar => {
                                                    if (avatar) {
                                                        this.setState({profileAvatar: avatar})
                                                    }
                                            }}>
                                            <Image
                                                style={{
                                                    width: 100,
                                                    height: 100,
                                                    borderRadius: 140
                                                }}
                                                resizeMode='cover'
                                                source={{uri:this.state.userAvatar}}
                                                ref={(ref) => { this.state.inputs[3] = ref; }}
                                            />
                                        </PhotoUpload>
                                    </View>
                                    <Form>
                                        <Name
                                            full
                                            changeFocus={this.changeInputFocus(0)}
                                            update={() => {}}
                                            shown={true}
                                            ref={(ref) => { this.state.inputs[0] = ref; }}
                                        />
                                        <Password
                                            full
                                            changeFocus={this.changeInputFocus(1)}
                                            update={() => {}}
                                            ref={(ref) => { this.state.inputs[1] = ref; }}
                                        />
                                         <NewPassword
                                            full
                                            changeFocus={this.changeInputFocus(1)}
                                            update={() => {}}
                                            ref={(ref) => { this.state.inputs[2] = ref; }}
                                        />
                                        <Text style={{ color: '#666', fontSize: 12, marginVertical: 10, marginHorizontal: 15 }}>Leave the password field empty for not changing it!</Text>
                                        <MultiSelect
                                            full
                                            items={this.state.languages}
                                            update={() => {}}
                                            special
                                            ref={(ref) => { this.state.inputs[3] = ref; }}
                                        />
                                    </Form>
                                    <View style={{marginTop: 2, alignSelf: 'center',}}>
                                        <Text style={{color: '#e71a64',fontSize: 12}}>
                                            {this.state.loginErrorMessage}
                                        </Text>
                                    </View>

                                    <View style={{padding: 10}}>
                                        <Button iconLeft block onPress={this.updateProfile.bind(this)} style={{marginBottom: 10,backgroundColor:"#8ee2ff"}}>
                                            <Icon name='md-checkmark' />
                                            <Text>Update profile</Text>
                                        </Button>

                                        <Button iconLeft danger block onPress={this.logOut.bind(this)}>
                                            <Icon name='ios-log-out-outline' />
                                            <Text>Logout</Text>
                                        </Button>
                                    </View>
                                </View>
                            :
                            null
                        }

                        {
                            this.state.dataLoaded != "done" ? 
                                <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: config.screenWidth, height: config.screenHeight - 80}}>
                                    <Spinner />
                                    <Text style={{color: '#666', fontSize: 12, fontWeight: "bold", marginTop: 10}}>{this.state.dataLoaded} profile data...</Text>
                                </View>
                            :
                            null
                        }
                    </ScrollView>
                </Body>
            </Container>
        )
    }
}