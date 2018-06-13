import React, { Component } from 'react';
import { View, Image, ScrollView, BackHandler } from 'react-native';
import {
    Container, Header, Left, Body, Right, Button, Icon, Content,
    Title, Text, Form, Spinner, List, ListItem, Thumbnail,
    Tabs,Tab
} from 'native-base';
import ImageLoad from 'react-native-image-placeholder';
import config from "../../src/config/app.js";
import styles from "../../style/app.js";
import UserFriends from './UserFriends';
import FriendRequest from "./FriendRequests";

export default class test extends Component {
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

    render() {
        return (
            <Container>
                 <Content style={{flex:1}}>
                     <UserFriends/>
                </Content>
                            
                       
            </Container>
        )
    }
}