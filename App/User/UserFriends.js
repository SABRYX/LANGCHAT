import React, { Component } from 'react';
import { View, Image, ScrollView, BackHandler } from 'react-native';
import { Actions } from 'react-native-router-flux';
import {
    Container, Header, Left, Body, Right, Button, Icon, Content,
    Title, Text, Form, Toast, Spinner, List, ListItem, Thumbnail
} from 'native-base';
import ImageLoad from 'react-native-image-placeholder';
import config from "../../src/config/app.js";
import styles from "../../style/app.js";
import storage from '../services/storage'
import api from '../services/api';
import {globals} from "../services/globals";
import UserChat from "./UserChat";

export default class UserFriends extends Component {
    accessToken;

    constructor(props) {
        super(props);
        this.state = {
            screen: 1,
            dataLoaded: "Loading",
            friends: [],
            currentFriend: null,
            userChatRef: null,
            last_message:null,
            messageWritten:null,
        }
        this.backToChat=this.backToChat.bind(this)
    }
    componentWillMount(){
        this.getMessagesMain();
    }

     componentDidMount() {
        console.log("hola")
        BackHandler.addEventListener('hardwareBackPress', () => {
            if (this.state.screen == 2) {
                
                this.backToChat();
            }
            else {this.props.navigation.navigate("MainAppScreen")}

            return true;
        });

        
    }
    getMessagesMain(){
        storage.getItem(storage.keys.accessToken).then((result) => {
            accessToken = result
            api.get_all_friends(result).then((response) => {
                response.data.forEach(element => {
                   this.state.friends.push(element.friend)
                });
                console.log(this.state.friends)
                this.setState({ screen: 1, dataLoaded: "done" })
            })
        })

        console.log(globals.mainSocket)
        globals.mainSocket.on('chat_message', (data) => {
            if (this.state.screen == 1) {
                if (data.user_id == globals.user.id) {
                    let friends = this.state.friends;
                    let _friend = null;
                    friends.forEach((friend, index) => {
                        if (friend.user.id == data.message.user._id) {
                            friend.last_message = data.message.text
                            friend.last_message_time = data.last_message_time
                            friend.last_message_date = data.last_message_date
                            friend.is_seen = false
                            _friend = friend;

                            friends.splice(index, 1)
                        }
                    })

                    this.setState({ friends: friends })
                    if (_friend != null)
                        friends.push(_friend)
                    this.setState({ friends: friends })
                }
            }
            else this.state.userChatRef.updateMessage(data)
        })

    }

    wordWrittenGenerator(){
            if(this.state.last_message == undefined){
                this.setState({messageWritten:"Wanna start a conversation"})
                console.log(this.state.messageWritten)
            }
            else{
                this.setState ({messageWritten:this.state.last_message.substring(0, 30) + (this.state.last_message.length > 30 ? '...' : '')} )
                console.log(this.state.messageWritten);
            }
    }

    renderBody() {
        if (this.state.screen == 1) {
            return(
                
                <Content style={{ width: config.screenWidth,height:config.screenHeight,flex:1 }}>
                    {
                        this.state.dataLoaded == "done" ? 
                        <List style={{marginTop: 0}} dataArray={this.state.friends.sort((a,b) => {
                            return new Date(b.last_message_date) - new Date(a.last_message_date);
                        })}
                            renderRow={(friend, s1, index) =>
                                    <ListItem
                                        onPress={() =>{ this.setState({ screen: 2, currentFriend: friend,last_message:friend.last_message });this.wordWrittenGenerator();console.log("working") /* this.props.currentFriends(friend);console.log(friend) */} }
                                        style={{ backgroundColor: friend.is_seen ? 'transparent' : 'transparent' }}>
                                                <Left style={{ margin: "0%", flex: 1 }}>
                                                    {/* <Thumbnail source={{uri: friend.avatar}} /> */}
                                                    <ImageLoad
                                                        style={{ width: 50, height: 50 }}
                                                        loadingStyle={{ width: 50, height: 50 }}
                                                        placeholderStyle={{ width: 50, height: 50, resizeMode: Image.resizeMode.stretch, borderRadius: 50 }}
                                                        borderRadius={50}
                                                        source={{ uri: friend.avatar }}
                                                        placeholderSource={	require('../../assets/default_avatar.png') } />
                                                    {
                                                        friend.is_online ? (
                                                        <Icon name='ios-radio-button-on' style={{color:'green', position: 'absolute', bottom: 0, right: -8}} />
                                                        ) : null
                                                    }
                                                </Left>
                                                <Body style={{ marginLeft: "0%", width: 180, flex: 3 }}>
                                                    <Text style={{ fontWeight: friend.is_seen ? 'normal' : 'bold' }}>{friend.name}</Text>
                                                    <Text style={{ fontWeight: friend.is_seen ? 'normal' : 'bold' }} note> {this.state.messageWritten} </Text>
                                                </Body>
                                                <Right style={{ flexDirection: "row", flex: 2, justifyContent: "space-between" }}>
                                                    <Text style={{ fontWeight: friend.is_seen ? 'normal' : 'bold' }} note>{friend.last_message_time}</Text>
                                                </Right>
                                            </ListItem>
                                        }>
                                </List>
                        :
                        null
                    }

                    {
                        this.state.dataLoaded != "done" ? 
                            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: config.screenWidth, height: config.screenHeight - 80}}>
                                <Spinner />
                                <Text style={{color: '#666', fontSize: 12, fontWeight: "bold", marginTop: 10}}>{this.state.dataLoaded} messages...</Text>
                            </View>
                        :
                        null
                    }
                </Content>);
        }
        
        return null;
    }

    backToChat(){
        if (this.state.screen == 2) {
            this.setState({
                screen: 1,
                dataLoaded: "Loading",
                friends: [],
                currentFriend: null,
                userChatRef: null,
                last_message:null,
                messageWritten:null,});
            this.getMessagesMain();
        }else{
            this.props.navigation.goBack();
        }
    }

    render() {
        return (<Container style={{ backgroundColor: 'white', flex: 1 }}>
        <Header style={{ marginTop: 20 }} noShadow>
            <Left>
                <Button transparent onPress={() =>this.backToChat()}>
                    <Icon name='arrow-back' />
                </Button>
            </Left>
            <Body>
                <Title></Title>
            </Body>
        </Header>
            <Content style={{ backgroundColor: 'white', flex: 1 }}>
                {
                    this.state.screen != 1 ? (
                        <UserChat
                            ref={(ref) => { this.state.userChatRef = ref; }}
                            data={{ friend_id: this.state.currentFriend.id, friend_name: this.state.currentFriend.name }} 
                            action={this.backToChat}
                            />
                    )
                    :
                    this.renderBody()
                }
                </Content>
            </Container>
        )
    }
}