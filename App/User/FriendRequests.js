import React, { Component } from 'react';
import { View, Image, ScrollView, BackHandler,TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import {
    Container, Header, Left, Body, Right, Button, Icon, Content,
    Title, Text, Form, Toast, Spinner, List, ListItem, Thumbnail,Badge  
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
                response.forEach(element => {
                    this.state.friends.push(element) 
                 });
                this.setState({ screen: 1, dataLoaded: "done"})
                console.log(this.state.friends);
            })
        })
    }

    removeRequestFromUI(requestNumber){
        var index = requestNumber;
        // this.state.friends.splice(index,1);
        delete this.state.friends [index]
        // console.log(requestNumber);
        this.setState({friends: this.state.friends})
        
        
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
                                <ListItem style={{ backgroundColor: friend.is_seen ? 'transparent' : 'transparent',marginTop:"2%",flexDirection:"row",flex:1 }}>
                                            <Left style={{margin:"0%",flex:1}}>
                                                {/* <Thumbnail source={{uri: friend.avatar}} /> */}
                                                <ImageLoad
                                                    style={{ width: 50, height: 50 }}
                                                    loadingStyle={{ width: 50, height: 50 }}
                                                    placeholderStyle={{ width: 50, height: 50, resizeMode: Image.resizeMode.stretch, borderRadius: 50 }}
                                                    borderRadius={50}
                                                    source={{ uri: friend.user.avatar }}
                                                    placeholderSource={	require('../../assets/default_avatar.png') } />
                                                
                                            </Left>
                                            <Body style={{marginLeft:"0%",width:180,flex:3}}>
                                                <Text style={{ fontWeight: 'normal' ,textAlign:"left" }}>{friend.user.name}</Text>
                                            </Body>
                                            <Right style={{flexDirection:"row",flex:2,justifyContent:"space-between"}}>
                                                <TouchableOpacity style={{width: 50, height: 40,margin:"0%",justifyContent:"center"}} 
                                                    onPress={()=>{this.removeRequestFromUI(index);}}
                                                >
                                                    <Icon name='check' type="FontAwesome" style={{color:"green",alignSelf:"center"}}  />
                                                </TouchableOpacity>
                                                
                                                <TouchableOpacity style={{width: 50, height: 40,margin:"0%",justifyContent:"center"}}  
                                                    onPress={()=>{console.log(this.state.friends[index].to);this.removeRequestFromUI(index);}}
                                                >
                                                    <Icon name='remove' type="FontAwesome" style={{color:"red",alignSelf:"center"}} />
                                                </TouchableOpacity>
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