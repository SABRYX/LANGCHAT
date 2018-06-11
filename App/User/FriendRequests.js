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

export default class FriendRequest extends Component {
    accessToken;

    constructor(props) {
        super(props);
        this.state = {
            screen: 1,
            dataLoaded: "Loading",
            friends: [],
            currentFriend: null,
            userChatRef: null
        }
    }

     componentDidMount() {
        console.log("hola")
        BackHandler.addEventListener('hardwareBackPress', () => {
            if (this.state.screen == 1) {
                Actions.pop();
                return true;
            }
            else this.setState({ screen: 1 })

            return true;
        });

        storage.getItem(storage.keys.accessToken).then((result) => {
            accessToken = result
            api.get_all_requests(result).then((response) => {
                console.log(response)
                this.setState({ screen: 1, dataLoaded: "done", friends: response.data })
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

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }

    renderBody() {
        console.log(this.state.dataLoaded)
        if (this.state.screen == 1) {
            return(
                
                <Content style={{ width: config.screenWidth }}>
                    {   
                        
                        this.state.dataLoaded == "done" ? 
                        <List style={{marginTop: 5}} dataArray={this.state.friends.sort((a,b) => {
                            return new Date(b.last_message_date) - new Date(a.last_message_date);
                        })}
                        renderRow={(friend, s1, index) =>
                                <ListItem avatar
                                    onPress={() => this.setState({ screen: 2, currentFriend: friend }) }
                                    style={{ backgroundColor: friend.is_seen ? 'transparent' : '#eaf2ff' }}>
                                            <Left>
                                                {/* <Thumbnail source={{uri: friend.avatar}} /> */}
                                                <ImageLoad
                                                    style={{ width: 50, height: 50 }}
                                                    loadingStyle={{ width: 50, height: 50 }}
                                                    placeholderStyle={{ width: 50, height: 50, resizeMode: Image.resizeMode.stretch, borderRadius: 50 }}
                                                    borderRadius={50}
                                                    source={{ uri: friend.user.avatar }}
                                                    placeholderSource={	require('../../assets/default_avatar.png') } />
                                                {
                                                    friend.user.is_online ? (
                                                    <Icon name='ios-radio-button-on' style={{color:'green', position: 'absolute', bottom: 0, right: -8}} />
                                                    ) : null
                                                }
                                            </Left>
                                            <Body>
                                                <Text style={{ fontWeight: friend.is_seen ? 'normal' : 'bold' }}>{friend.user.name}</Text>
                                            </Body>
                                            <Right>
                                                
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

    onBackPressed = () => {
		console.log('UserFriends', Actions.currentScene)        
        if (this.state.screen != 1) {
            this.setState({ screen: 1, currentFriend: null })
            return false
        }

        Actions.pop()
        return true
    }

    render() {
        return (
            <Container style={{ backgroundColor: 'white', flex: 1 }}>
                {this.renderBody()}
                {
                    this.state.screen != 1 ? (
                        <UserChat
                            ref={(ref) => { this.state.userChatRef = ref; }}
                            data={{ friend_id: this.state.currentFriend.user.id, friend_name: this.state.currentFriend.user.name }} />
                    )
                    :
                    null
                }
            </Container>
        )
    }
}